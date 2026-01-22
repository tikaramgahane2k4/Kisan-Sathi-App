const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Material = require('../models/Material');
const Crop = require('../models/Crop');

// @route   POST /api/materials
// @desc    Add material entry
// @access  Private
router.post('/', auth, upload.single('billImage'), async (req, res) => {
  try {
    const { crop, date, materialType, materialName, quantity, price, pricePerUnit, laborDays, gender, notes } = req.body;

    // Verify crop belongs to user
    const cropDoc = await Crop.findOne({
      _id: crop,
      farmer: req.user._id
    });

    if (!cropDoc) {
      return res.status(404).json({ message: 'फसल नहीं मिली' });
    }

    const material = await Material.create({
      farmer: req.user._id,
      crop,
      date,
      materialType,
      materialName,
      quantity: JSON.parse(quantity),
      pricePerUnit: parseFloat(pricePerUnit || 0),
      price: parseFloat(price),
      laborDays: parseInt(laborDays || 1),
      gender: gender || 'mixed',
      billImage: req.file ? `/uploads/${req.file.filename}` : undefined,
      notes
    });

    // Update crop total cost
    cropDoc.totalCost = (cropDoc.totalCost || 0) + parseFloat(price);
    await cropDoc.save();

    res.status(201).json({
      success: true,
      material
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'सामग्री जोड़ने में त्रुटि' });
  }
});

// @route   GET /api/materials
// @desc    Get all materials for a crop
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { crop } = req.query;

    const query = { farmer: req.user._id };
    if (crop) {
      query.crop = crop;
    }

    const materials = await Material.find(query)
      .populate('crop', 'cropType')
      .sort({ date: -1 });

    // Calculate total cost
    const totalCost = materials.reduce((sum, material) => sum + material.price, 0);

    res.json({
      success: true,
      count: materials.length,
      totalCost,
      materials
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'सामग्री लाने में त्रुटि' });
  }
});

// @route   GET /api/materials/:id
// @desc    Get single material
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const material = await Material.findOne({
      _id: req.params.id,
      farmer: req.user._id
    }).populate('crop', 'cropType');

    if (!material) {
      return res.status(404).json({ message: 'सामग्री नहीं मिली' });
    }

    res.json({
      success: true,
      material
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'सामग्री लाने में त्रुटि' });
  }
});

// @route   PUT /api/materials/:id
// @desc    Update material
// @access  Private
router.put('/:id', auth, upload.single('billImage'), async (req, res) => {
  try {
    let material = await Material.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!material) {
      return res.status(404).json({ message: 'सामग्री नहीं मिली' });
    }

    const oldPrice = material.price;
    const { date, materialType, materialName, quantity, price, pricePerUnit, laborDays, gender, notes } = req.body;

    material.date = date || material.date;
    material.materialType = materialType || material.materialType;
    material.materialName = materialName || material.materialName;
    material.quantity = quantity ? JSON.parse(quantity) : material.quantity;
    material.pricePerUnit = pricePerUnit ? parseFloat(pricePerUnit) : material.pricePerUnit;
    material.price = price ? parseFloat(price) : material.price;
    material.laborDays = laborDays ? parseInt(laborDays) : material.laborDays;
    material.gender = gender || material.gender;
    material.notes = notes !== undefined ? notes : material.notes;

    if (req.file) {
      material.billImage = `/uploads/${req.file.filename}`;
    }

    await material.save();

    // Update crop total cost
    const priceDifference = material.price - oldPrice;
    await Crop.findByIdAndUpdate(material.crop, {
      $inc: { totalCost: priceDifference }
    });

    res.json({
      success: true,
      material
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'सामग्री अपडेट करने में त्रुटि' });
  }
});

// @route   DELETE /api/materials/:id
// @desc    Delete material
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const material = await Material.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!material) {
      return res.status(404).json({ message: 'सामग्री नहीं मिली' });
    }

    // Update crop total cost
    await Crop.findByIdAndUpdate(material.crop, {
      $inc: { totalCost: -material.price }
    });

    await Material.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'सामग्री हटाई गई'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'सामग्री हटाने में त्रुटि' });
  }
});

module.exports = router;
