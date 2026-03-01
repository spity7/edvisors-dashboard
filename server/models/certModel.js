const mongoose = require("mongoose");

const certSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Certificate description is required"],
    },
    thumbnailUrl: {
      type: String,
      required: [true, "Thumbnail image URL is required"],
    },
    qrImageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

module.exports = mongoose.model("Certificate", certSchema);
