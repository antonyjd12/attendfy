const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const { auth, isAdmin, isSuperAdmin } = require('../middleware/auth');

// Get all devices
router.get('/', auth, async (req, res) => {
  try {
    const devices = await Device.find({ isActive: true })
      .select('deviceId name location')
      .lean()
      .exec();
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new device (admin only)
router.post('/', [auth, isAdmin], async (req, res) => {
  try {
    const { deviceId, name, location } = req.body;

    // Check if device already exists
    let device = await Device.findOne({ deviceId });
    if (device) {
      return res.status(400).json({ message: 'Device already exists' });
    }

    // Create new device
    device = new Device({
      deviceId,
      name,
      location
    });

    await device.save();
    res.status(201).json(device);
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update device status
router.patch('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const { isActive } = req.body;
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;