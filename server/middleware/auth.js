const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'कृपया लॉगिन करें' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'उपयोगकर्ता नहीं मिला' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'अमान्य टोकन' });
  }
};
