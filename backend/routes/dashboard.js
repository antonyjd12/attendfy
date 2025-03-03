const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { format } = require('date-fns');

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEmployees, todayAttendance] = await Promise.all([
      User.countDocuments({ role: 'employee' }),
      Attendance.find({ date: today })
    ]);

    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    const lateToday = todayAttendance.filter(a => {
      if (!a.checkIn) return false;
      const checkInHour = new Date(a.checkIn.time).getHours();
      return a.status === 'present' && checkInHour >= 9; // Assuming 9 AM is the cutoff
    }).length;
    const absentToday = totalEmployees - presentToday;

    res.json({
      totalEmployees,
      presentToday,
      lateToday,
      absentToday,
      presentPercentage: `${Math.round((presentToday / totalEmployees) * 100)}%`,
      latePercentage: `${Math.round((lateToday / totalEmployees) * 100)}%`,
      absentPercentage: `${Math.round((absentToday / totalEmployees) * 100)}%`
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get weekly attendance
router.get('/weekly-attendance', auth, async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const attendance = await Attendance.find({
      date: { $gte: lastWeek, $lte: today }
    });

    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayAttendance = attendance.filter(a => 
        new Date(a.date).toDateString() === date.toDateString()
      );

      weeklyData.unshift({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        present: dayAttendance.filter(a => a.status === 'present').length,
        late: dayAttendance.filter(a => {
          if (!a.checkIn) return false;
          const checkInHour = new Date(a.checkIn.time).getHours();
          return a.status === 'present' && checkInHour >= 9;
        }).length
      });
    }

    res.json(weeklyData);
  } catch (error) {
    console.error('Error fetching weekly attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activity
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const recentAttendance = await Attendance.find()
      .sort({ 'checkIn.time': -1 })
      .limit(5)
      .populate('user', 'firstName lastName');

    const activities = recentAttendance.map(attendance => {
      // Ensure we have valid dates before formatting
      const checkInTime = attendance.checkIn?.time;
      const checkOutTime = attendance.checkOut?.time;
      
      // Validate that we have at least a check-in time
      if (!checkInTime) {
        return null;
      }

      try {
        return {
          name: `${attendance.user.firstName} ${attendance.user.lastName}`,
          action: checkOutTime ? 'Checked out' : 'Checked in',
          time: format(
            new Date(checkOutTime || checkInTime),
            'h:mm a'
          ),
          avatar: `${attendance.user.firstName[0]}${attendance.user.lastName[0]}`
        };
      } catch (error) {
        console.error('Date formatting error:', error);
        return null;
      }
    }).filter(activity => activity !== null); // Remove any null entries

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;