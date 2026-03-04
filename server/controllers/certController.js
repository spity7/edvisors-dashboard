const Certificate = require("../models/certModel");
const { uploadImage, deleteImage } = require("../utils/gcs");
const QRCode = require("qrcode");
const sharp = require("sharp");

/**
 * Composites a QR code onto the bottom-right corner of an image buffer.
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {string} qrText     - Text to encode in the QR code
 * @returns {Buffer}          - Composited image buffer (PNG)
 */
async function compositeQRCode(imageBuffer, qrText) {
  // Get original image dimensions
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  // QR size = 20% of the smallest dimension, minimum 80px
  const qrSize = Math.max(80, Math.round(Math.min(width, height) * 0.2));
  const padding = Math.round(qrSize * 0.08); // small padding from the edge

  // Generate QR code as a PNG buffer
  const qrBuffer = await QRCode.toBuffer(qrText, {
    type: "png",
    width: qrSize,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  // Add a white rounded background behind QR (adds 8px padding around QR)
  const bgPad = 8;
  const bgSize = qrSize + bgPad * 2;
  const background = await sharp({
    create: {
      width: bgSize,
      height: bgSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: qrBuffer, top: bgPad, left: bgPad }])
    .png()
    .toBuffer();

  // Position: bottom-right corner
  const left = width - bgSize - padding;
  const top = height - bgSize - padding;

  // Composite onto original image (convert to PNG output)
  const composited = await sharp(imageBuffer)
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // flatten transparency
    .composite([{ input: background, top, left, blend: "over" }])
    .png()
    .toBuffer();

  return composited;
}

exports.createCert = async (req, res) => {
  try {
    const { description } = req.body;
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!description) {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    if (!thumbnailFile) {
      return res.status(400).json({ message: "Thumbnail image is required." });
    }

    // Upload original thumbnail
    const thumbnailFileName = `certificates/thumbnails/${Date.now()}_${thumbnailFile.originalname}`;
    const thumbnailUrl = await uploadImage(
      thumbnailFile.buffer,
      thumbnailFileName,
      thumbnailFile.mimetype,
    );

    // Create the cert document first to obtain the unique _id
    const newCert = await Certificate.create({
      description,
      thumbnailUrl,
    });

    // Generate QR code composited on the image (encode full public certificate URL)
    try {
      const certPublicUrl = `https://dashboard.edvisors.ai/certificates/${newCert._id.toString()}`;
      const compositedBuffer = await compositeQRCode(
        thumbnailFile.buffer,
        certPublicUrl,
      );

      const qrFileName = `certificates/qr/${Date.now()}_qr_${thumbnailFile.originalname.replace(/\.[^.]+$/, "")}.png`;
      const qrImageUrl = await uploadImage(
        compositedBuffer,
        qrFileName,
        "image/png",
      );

      // Update cert with the QR image URL
      newCert.qrImageUrl = qrImageUrl;
      await newCert.save();
    } catch (qrErr) {
      // QR generation failure is non-fatal — cert is still created
      console.warn("⚠️ QR code generation failed:", qrErr.message);
    }

    res.status(201).json({
      message: "Cert created successfully",
      cert: newCert,
    });
  } catch (error) {
    console.error("Cert creation error:", error);
    res.status(500).json({
      message: "Server error creating cert",
      error: error.message,
    });
  }
};

exports.getAllCerts = async (req, res) => {
  try {
    const certs = await Certificate.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ certs });
  } catch (error) {
    console.error("Error fetching certs:", error);
    res.status(500).json({ message: "Server error fetching certs" });
  }
};

exports.getCertById = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: "Cert not found" });
    res.status(200).json({ cert });
  } catch (error) {
    console.error("Error fetching cert:", error);
    res.status(500).json({ message: "Server error fetching cert" });
  }
};

exports.updateCert = async (req, res) => {
  try {
    const { description } = req.body;
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!description) {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    // ✅ Find existing cert first
    const existingCert = await Certificate.findById(req.params.id);
    if (!existingCert) {
      return res.status(404).json({ message: "Cert not found" });
    }

    const updateData = {
      description,
    };

    // ✅ Handle new thumbnail upload
    if (thumbnailFile) {
      // Delete old thumbnail if exists
      if (existingCert.thumbnailUrl) {
        try {
          await deleteImage(existingCert.thumbnailUrl);
        } catch (err) {
          console.warn("⚠️ Failed to delete old thumbnail:", err.message);
        }
      }

      // Upload new one
      const newThumbnailName = `certificates/thumbnails/${Date.now()}_${
        thumbnailFile.originalname
      }`;
      const newThumbnailUrl = await uploadImage(
        thumbnailFile.buffer,
        newThumbnailName,
        thumbnailFile.mimetype,
      );
      updateData.thumbnailUrl = newThumbnailUrl;
    }

    // ✅ Update cert
    const updatedCert = await Certificate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    res.status(200).json({
      message: "Cert updated successfully",
      cert: updatedCert,
    });
  } catch (error) {
    console.error("Error updating cert:", error);
    res.status(500).json({
      message: "Server error updating cert",
      error: error.message,
    });
  }
};

exports.deleteCert = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: "Cert not found" });

    // Delete thumbnail from GCS
    if (cert.thumbnailUrl) {
      await deleteImage(cert.thumbnailUrl);
    }

    // Delete QR-composited image from GCS
    if (cert.qrImageUrl) {
      await deleteImage(cert.qrImageUrl);
    }

    // Delete cert from MongoDB
    await cert.deleteOne();

    res.status(200).json({ message: "Cert deleted successfully" });
  } catch (error) {
    console.error("Error deleting cert:", error);
    res.status(500).json({ message: "Server error deleting cert" });
  }
};

exports.deleteCertImage = async (req, res) => {
  try {
    const { id } = req.params; // cert id
    const { imageUrl } = req.body; // the image URL to delete

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const cert = await Certificate.findById(id);
    if (!cert) {
      return res.status(404).json({ message: "Cert not found" });
    }

    // Check if the image exists in the cert's gallery
    const imageExists = cert.gallery.includes(imageUrl);
    if (!imageExists) {
      return res.status(404).json({ message: "Image not found in gallery" });
    }

    // Delete the image from GCS
    await deleteImage(imageUrl);

    // Remove the image from MongoDB array
    cert.gallery = cert.gallery.filter((url) => url !== imageUrl);
    await cert.save();

    res.status(200).json({
      message: "Gallery image deleted successfully",
      gallery: cert.gallery,
    });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    res.status(500).json({
      message: "Server error deleting gallery image",
      error: error.message,
    });
  }
};
