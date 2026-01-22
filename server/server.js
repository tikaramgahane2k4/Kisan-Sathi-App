const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-profit-mitra')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.log('💡 Tip: Make sure MongoDB is running or use MongoDB Atlas connection string');
});

// Routes
const authRoutes = require('./routes/auth');
const cropRoutes = require('./routes/crops');
const materialRoutes = require('./routes/materials');

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/materials', materialRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kisan Profit Mitra API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
