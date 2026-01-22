const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'नाम आवश्यक है'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'मोबाइल नंबर आवश्यक है'],
    unique: true,
    match: [/^[0-9]{10}$/, 'कृपया सही मोबाइल नंबर डालें']
  },
  password: {
    type: String,
    required: [true, 'पासवर्ड आवश्यक है'],
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
