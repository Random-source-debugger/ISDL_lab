// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const baseUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  region: {
    type: String,
    required: [true, 'Region is required']
  },
  district: {
    type: String,
    required: [true, 'District is required']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  ethereumWalletId: {
    type: String,
    required: [true, 'Ethereum wallet ID is required'],
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid Ethereum wallet address']
  },
  userType: {
    type: String,
    enum: ['customer', 'agent'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { discriminatorKey: 'userType' });

// Hash password before saving
baseUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
baseUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', baseUserSchema);

// Customer Schema
const Customer = User.discriminator('customer', new mongoose.Schema({}));

// Agent Schema
const Agent = User.discriminator('agent', new mongoose.Schema({
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  certificateFiles: [{
    filename: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  workingDays: {
    type: [String],
    required: [true, 'Working days are required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  workingHours: {
    start: {
      type: String,
      required: [true, 'Working hours start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
    },
    end: {
      type: String,
      required: [true, 'Working hours end time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
    }
  },
  charges: {
    type: Number,
    required: [true, 'Charges are required'],
    min: [0, 'Charges cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}));

module.exports = { User, Customer, Agent };