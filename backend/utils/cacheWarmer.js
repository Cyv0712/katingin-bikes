const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const Bike = require('../models/Bike');
const { downloadImage } = require('./download');

/**
 * Background service that scans the database and pre-optimizes/caches all listing images
 * so that clients never experience slow "first load" times.
 */
async function warmImageCache() {
  console.log('[Cache Warmer] Starting background image cache warm-up...');
  try {
    const bikes = await Bike.find().sort({ createdAt: -1 });
    const urlsToWarm = [];

    // Collect all Cloudinary image URLs from available listings
    for (const bike of bikes) {
      if (bike.images && Array.isArray(bike.images)) {
        for (const imgUrl of bike.images) {
          if (imgUrl && imgUrl.includes('res.cloudinary.com')) {
            urlsToWarm.push(imgUrl);
          }
        }
      }
    }

    if (urlsToWarm.length === 0) {
      console.log('[Cache Warmer] No images found to warm.');
      return;
    }

    console.log(`[Cache Warmer] Found ${urlsToWarm.length} images. Checking cache status...`);
    const cacheDir = path.join(__dirname, '..', 'cache');

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    let warmedCount = 0;
    let skippedCount = 0;

    // Process sequentially with a delay to prevent overloading Render's CPU
    for (let i = 0; i < urlsToWarm.length; i++) {
      const url = urlsToWarm[i];
      
      // Clean up any transformation segment just in case
      const cleanUrl = url.replace(/\/f_auto,q_auto\//, '/');
      const urlHash = crypto.createHash('md5').update(cleanUrl).digest('hex');
      const cachedFilePath = path.join(cacheDir, `${urlHash}.webp`);

      if (fs.existsSync(cachedFilePath)) {
        skippedCount++;
        continue;
      }

      console.log(`[Cache Warmer] [${i + 1}/${urlsToWarm.length}] Cache miss. Warming up: ${cleanUrl}`);
      try {
        const imageBuffer = await downloadImage(cleanUrl);

        const optimizedBuffer = await sharp(imageBuffer)
          .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        await fs.promises.writeFile(cachedFilePath, optimizedBuffer);
        warmedCount++;
        console.log(`[Cache Warmer] Successfully cached: ${urlHash}.webp`);
      } catch (err) {
        console.error(`[Cache Warmer] Error warming image ${cleanUrl}:`, err.message);
      }

      // 500ms throttle delay to keep CPU usage low
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`[Cache Warmer] Cache warming completed. Warmed: ${warmedCount}, Skipped (already cached): ${skippedCount}`);
  } catch (err) {
    console.error('[Cache Warmer] Fatal error during cache warming:', err);
  }
}

module.exports = { warmImageCache };
