const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropType: {
    type: String,
    required: [true, 'फसल का प्रकार आवश्यक है'],
    enum: ['धान', 'गेहूं', 'गन्ना']
  },
  cropNameEnglish: {
    type: String,
    enum: ['Rice', 'Wheat', 'Sugarcane']
  },
  startDate: {
    type: Date,
    required: [true, 'शुरुआत की तारीख आवश्यक है']
  },
  expectedDuration: {
    type: Number, // in months
    required: true
  },
  landSize: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['बीघा', 'डिस्मिल', 'एकड़', 'हेक्टेयर'],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['चालू', 'पूर्ण', 'रद्द'],
    default: 'चालू'
  },
  production: {
    quantity: Number,
    unit: {
      type: String,
      enum: ['क्विंटल', 'टन', 'किलोग्राम']
    },
    sellingPrice: Number // per unit
  },
  totalCost: {
    type: Number,
    default: 0
  },
  totalIncome: {
    type: Number,
    default: 0
  },
  netProfit: {
    type: Number,
    default: 0
  },
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Crop', CropSchema);
