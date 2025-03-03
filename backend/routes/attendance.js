const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const { auth, isHROrHigher, isSelfOrAdmin } = require('../middleware/auth');

// Validation middleware
const attendanceValidation = [
  body('date').isISO8601().toDate(),
  body('shift').isIn(['morning', 'evening', 'night']),
  body('status').isIn(['present', 'absent', 'half-day', 'leave', 'holiday'])
];

// Mark attendance (check-in)
router.post('/check-in', auth, async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      user: req.user._id,
      date: today
    });

    if (existingAttendance?.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const attendance = existingAttendance || new Attendance({
      user: req.user._id,
      date: today,
      shift: req.body.shift || 'morning',
      status: 'present'
    });

    attendance.checkIn = {
      time: new Date(),
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0]
      }
    };

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance (check-out)
router.post('/check-out', auth, async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      user: req.user._id,
      date: today
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'No check-in found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOut = {
      time: new Date(),
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0]
      }
    };

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance records (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // User filter (admins can view all, users can only view their own)
    if (req.user.role === 'employee' || req.user.role === 'supervisor') {
      query.user = req.user._id;
    } else if (userId) {
      query.user = userId;
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update attendance record (HR/Admin only)
router.put('/:id', [auth, isHROrHigher, ...attendanceValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const updates = req.body;
    updates.approvedBy = req.user._id;

    Object.keys(updates).forEach(key => {
      attendance[key] = updates[key];
    });

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance summary (HR/Admin only)
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Department filter for HR and above
    if (req.user.role !== 'employee') {
      if (department) {
        query['userDetails.department'] = department;
      }
    } else {
      // For regular employees, only show their own summary
      query.user = req.user._id;
    }

    const summary = await Attendance.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          users: { $addToSet: '$user' }
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 