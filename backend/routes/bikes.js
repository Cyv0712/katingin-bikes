const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Bike = require('../models/Bike');
const { persistUploadedImages, deleteBikeImages } = require('../utils/imageStorage');
const authMiddleware = require('../middleware/auth');
const { downloadImage } = require('../utils/download');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Ensure cache directory exists for storing optimized images locally
const cacheDir = path.join(__dirname, '..', 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Image proxy route - optimizes Cloudinary images on the fly on our server
router.get('/image-proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).send('URL parameter is required');
    }

    // Validate that it's a Cloudinary URL to prevent SSRF
    if (!imageUrl.includes('res.cloudinary.com')) {
      return res.status(400).send('Invalid image source');
    }

    // Generate a unique filename based on the MD5 hash of the URL
    const urlHash = crypto.createHash('md5').update(imageUrl).digest('hex');
    const cachedFilePath = path.join(cacheDir, `${urlHash}.webp`);

    // Check if the optimized image is already in our local disk cache
    if (fs.existsSync(cachedFilePath)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.set('Content-Type', 'image/webp');
      return res.sendFile(cachedFilePath);
    }

    // Fetch the raw image from Cloudinary
    let imageBuffer;
    try {
      imageBuffer = await downloadImage(imageUrl);
    } catch (fetchErr) {
      console.error(`Failed to download image: ${fetchErr.message}`);
      return res.status(502).send('Failed to fetch image');
    }

    // Optimize the image using sharp (resize to max 1200px and compress to WebP)
    const optimizedBuffer = await sharp(imageBuffer)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Save to local disk cache asynchronously
    fs.writeFile(cachedFilePath, optimizedBuffer, (err) => {
      if (err) console.error('Failed to write image cache:', err);
    });

    // Set aggressive cache control and correct mime type
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.set('Content-Type', 'image/webp');
    res.send(optimizedBuffer);
  } catch (err) {
    console.error('Image proxy error:', err);
    res.status(500).send('Error processing image');
  }
});

// Get all bikes
router.get('/', async (req, res) => {
  try {
    const bikes = await Bike.find().sort({ createdAt: -1 });
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single bike
router.get('/:id', async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });
    res.json(bike);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Simple in-memory cache to prevent duplicate submissions from retries
const recentSubmissions = new Map();

// Create a bike — accepts multiple images
router.post('/', authMiddleware, upload.array('images', 20), async (req, res) => {
  try {
    const bikeData = { ...req.body };
    
    // Create a unique fingerprint for this submission
    const fingerprint = `${bikeData.brand}-${bikeData.model}-${bikeData.price}-${bikeData.mileage}`;
    const now = Date.now();
    
    if (recentSubmissions.has(fingerprint)) {
      const lastTime = recentSubmissions.get(fingerprint);
      if (now - lastTime < 30000) { // 30 second window
        console.log('Duplicate submission detected, ignoring retry:', fingerprint);
        return res.status(200).json({ message: 'Duplicate submission ignored' });
      }
    }
    
    recentSubmissions.set(fingerprint, now);

    if (req.files?.length) {
      bikeData.images = await persistUploadedImages(req.files);
    }

    const bike = new Bike(bikeData);
    const newBike = await bike.save();
    res.status(201).json(newBike);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a bike — accepts multiple images
router.put('/:id', authMiddleware, upload.array('images', 20), async (req, res) => {
  try {
    console.log('PUT ROUTE RECEIVED:');
    console.log('Files count:', req.files?.length);
    console.log('req.body:', req.body);
    
    const existing = await Bike.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Bike not found' });

    const bikeData = { ...req.body };

    if (req.files?.length) {
      await deleteBikeImages(existing.images);
      bikeData.images = await persistUploadedImages(req.files);
    } else if (req.body.existingImages) {
      const imagesArray = Array.isArray(req.body.existingImages) 
        ? req.body.existingImages 
        : [req.body.existingImages];
      bikeData.images = imagesArray;
    }

    const updatedBike = await Bike.findByIdAndUpdate(req.params.id, bikeData, { new: true });
    res.json(updatedBike);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark a bike as sold — clears spec details and deletes associated images from disk / Cloudinary
router.patch('/:id/sold', authMiddleware, async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });

    // Delete associated images from disk / Cloudinary to keep it lightweight
    if (bike.images && bike.images.length > 0) {
      await deleteBikeImages(bike.images);
    }

    const updatedBike = await Bike.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status: 'Sold' },
        $unset: {
          edition: 1,
          type: 1,
          year: 1,
          mileage: 1,
          description: 1,
          issues: 1,
          engineSize: 1,
          engineConfig: 1,
          power: 1,
          transmission: 1,
          fuelCapacity: 1,
          images: 1
        }
      },
      { new: true }
    );
    res.json(updatedBike);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a bike — removes associated disk files and Cloudinary assets
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });

    await deleteBikeImages(bike.images);

    await Bike.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bike and all associated images deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
