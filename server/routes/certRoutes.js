const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  createCert,
  getAllCerts,
  getCertById,
  updateCert,
  deleteCert,
  deleteCertImage,
} = require("../controllers/certController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
    files: 30, // allow up to 30 files total
  },
});

router.post(
  "/certs",
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  createCert,
);
router.get("/certs", getAllCerts);
router.get("/certs/:id", getCertById);
router.put(
  "/certs/:id",
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  updateCert,
);
router.delete("/certs/:id", deleteCert);
router.delete("/certs/:id/gallery", deleteCertImage);

module.exports = router;
