const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'hr_manager', 'supervisor', 'employee'],
    default: 'employee'
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'employee';
    }
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving with enhanced security
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Increase salt rounds for better security
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Enhanced method to compare password with timeout
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const result = await Promise.race([
      bcrypt.compare(candidatePassword, this.password),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Password comparison timeout')), 5000)
      )
    ]);
    return result;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Method to return user data without sensitive information
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);