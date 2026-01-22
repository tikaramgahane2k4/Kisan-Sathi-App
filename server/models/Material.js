const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'तारीख आवश्यक है'],
    default: Date.now
  },
  materialType: {
    type: String,
    required: [true, 'सामग्री का प्रकार आवश्यक है'],
    enum: ['बीज', 'खाद', 'दवाई', 'कीटनाशक', 'मजदूरी', 'ट्रैक्टर/उपकरण', 'पानी/बिजली', 'परिवहन', 'भंडारण', 'अन्य']
  },
  materialName: {
    type: String,
    required: [true, 'सामग्री का नाम आवश्यक है'],
    trim: true
  },
  quantity: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['किलोग्राम', 'लीटर', 'पैकेट', 'बोरी', 'दिन', 'घंटा', 'पीस', 'बोतल', 'व्यक्ति']
    }
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'प्रति इकाई कीमत आवश्यक है'],
    min: 0
  },
  price: {
    type: Number,
    required: [true, 'कुल कीमत आवश्यक है'],
    min: 0
  },
  laborDays: {
    type: Number,
    default: 1,
    min: 1
  },
  gender: {
    type: String,
    enum: ['पुरुष', 'महिला', 'mixed'],
    default: 'mixed'
  },
  billImage: {
    type: String // path to uploaded image
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Material', MaterialSchema);
