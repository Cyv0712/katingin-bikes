const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

async function optimizeImageBuffer(buffer) {
  try {
    return await sharp(buffer)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (err) {
    console.error('Image optimization failed, using original buffer:', err.message);
    return buffer;
  }
}

async function writeBufferToDisk(file) {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let optimizedBuffer;
  let ext = '.webp';
  try {
    optimizedBuffer = await optimizeImageBuffer(file.buffer);
  } catch (err) {
    optimizedBuffer = file.buffer;
    ext = path.extname(file.originalname || '.jpg');
  }

  const filename =
    Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
  const dest = path.join(uploadDir, filename);
  fs.writeFileSync(dest, optimizedBuffer);
  return `/uploads/${filename}`;
}

/**
 * @param {Express.Multer.File[]} files
 * @returns {Promise<string[]>}
 */
async function persistUploadedImages(files) {
  if (!files?.length) return [];
  const urls = [];
  for (const file of files) {
    urls.push(await writeBufferToDisk(file));
  }
  return urls;
}

function deleteSingleImageAsset(imageRef) {
  if (!imageRef || typeof imageRef !== 'string') return;
  if (!imageRef.startsWith('/uploads')) return;

  const fullPath = path.join(__dirname, '..', imageRef);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

/**
 * @param {string[]} images
 */
async function deleteBikeImages(images) {
  if (!Array.isArray(images)) return;
  for (const img of images) {
    deleteSingleImageAsset(img);
  }
}

module.exports = {
  persistUploadedImages,
  deleteBikeImages,
};
