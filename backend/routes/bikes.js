const express = require('express');
const router = express.Router();
const multer = require('multer');
const Bike = require('../models/Bike');
const { persistUploadedImages, deleteBikeImages } = require('../utils/imageStorage');
const authMiddleware = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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
    const existing = await Bike.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Bike not found' });

    const bikeData = { ...req.body };

    if (req.files?.length) {
      await deleteBikeImages(existing.images);
      bikeData.images = await persistUploadedImages(req.files);
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
