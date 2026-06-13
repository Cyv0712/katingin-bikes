const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
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

function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET)
  );
}

function configureCloudinary() {
  if (!isCloudinaryConfigured()) return;
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config(true);
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

configureCloudinary();

function publicIdFromCloudinaryUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  try {
    const pathname = new URL(url).pathname;
    const marker = '/upload/';
    const idx = pathname.indexOf(marker);
    if (idx === -1) return null;
    let rest = pathname.slice(idx + marker.length);
    // Strip transformation segments (e.g. w_400,h_300,c_fill/)
    while (rest.includes('/') && !/^v\d+\//.test(rest)) {
      const slash = rest.indexOf('/');
      const segment = rest.slice(0, slash);
      if (segment.includes('_') || segment.includes(',')) {
        rest = rest.slice(slash + 1);
      } else {
        break;
      }
    }
    rest = rest.replace(/^v\d+\//, '');
    return rest.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}

async function uploadBufferToCloudinary(file) {
  const folder = process.env.CLOUDINARY_FOLDER || 'katingin-bikes/bikes';
  
  let optimizedBuffer;
  let mime = 'image/webp';
  try {
    optimizedBuffer = await optimizeImageBuffer(file.buffer);
  } catch (err) {
    optimizedBuffer = file.buffer;
    mime = file.mimetype || 'image/jpeg';
  }
  
  const dataUri = `data:${mime};base64,${optimizedBuffer.toString('base64')}`;
  
  // Create a unique filename
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  
  console.log('--- Cloudinary Upload Start ---');
  console.log('Target Path:', `${folder}/${fileName}`);
  
  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: fileName,
      folder: folder,
      resource_type: 'image',
      overwrite: true
    });
    console.log('Upload Success! URL:', result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary Upload FAILED:', err.message);
    throw err;
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
  if (isCloudinaryConfigured()) {
    return Promise.all(files.map((f) => uploadBufferToCloudinary(f)));
  }
  const urls = [];
  for (const file of files) {
    urls.push(await writeBufferToDisk(file));
  }
  return urls;
}

async function deleteSingleImageAsset(imageRef) {
  if (!imageRef || typeof imageRef !== 'string') return;

  if (imageRef.startsWith('/uploads')) {
    const fullPath = path.join(__dirname, '..', imageRef);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    return;
  }

  const publicId = publicIdFromCloudinaryUrl(imageRef);
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.error('Cloudinary destroy failed:', publicId, err.message);
  }
}

/**
 * @param {string[]} images
 */
async function deleteBikeImages(images) {
  if (!Array.isArray(images)) return;
  for (const img of images) {
    await deleteSingleImageAsset(img);
  }
}

module.exports = {
  isCloudinaryConfigured,
  configureCloudinary,
  persistUploadedImages,
  deleteBikeImages,
};
