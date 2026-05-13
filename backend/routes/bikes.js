const express = require('express');
const router = express.Router();
const multer = require('multer');
const Bike = require('../models/Bike');
const { persistUploadedImages, deleteBikeImages } = require('../utils/imageStorage');

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

// Create a bike — accepts multiple images
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const bikeData = { ...req.body };

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
router.put('/:id', upload.array('images', 10), async (req, res) => {
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

// Mark a bike as sold
router.patch('/:id/sold', async (req, res) => {
  try {
    const updatedBike = await Bike.findByIdAndUpdate(
      req.params.id,
      { status: 'Sold' },
      { new: true }
    );
    if (!updatedBike) return res.status(404).json({ message: 'Bike not found' });
    res.json(updatedBike);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a bike — removes associated disk files and Cloudinary assets
router.delete('/:id', async (req, res) => {
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
