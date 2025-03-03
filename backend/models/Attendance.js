const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: Date,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    }
  },
  checkOut: {
    time: Date,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'leave', 'holiday'],
    default: 'absent'
  },
  workHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  shift: {
    type: String,
    enum: ['morning', 'evening', 'night'],
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for querying attendance by date range
attendanceSchema.index({ date: 1, user: 1 });

// Method to calculate work hours
attendanceSchema.methods.calculateWorkHours = function() {
  if (this.checkIn && this.checkOut) {
    const hours = (this.checkOut.time - this.checkIn.time) / (1000 * 60 * 60);
    this.workHours = Math.round(hours * 100) / 100;
  }
};

// Middleware to calculate work hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    this.calculateWorkHours();
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema); 