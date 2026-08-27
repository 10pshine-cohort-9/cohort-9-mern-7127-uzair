const multer = require('multer');
const sharp = require('sharp');
const path = require('node:path');
const fs = require('node:fs');
const logger = require('../utils/logger')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const processAndSaveImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join('uploads', filename);

    await sharp(req.file.buffer)
      .resize(500, 500, { fit: 'cover' })
      .webp()
      .toFile(outputPath);

    req.file.filename = filename;
    next();
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({ message: "Invalid image file!" });
  }
};

module.exports = { upload, processAndSaveImage };