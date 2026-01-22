const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Crop = require('../models/Crop');
const Material = require('../models/Material');

// @route   POST /api/crops
// @desc    Create new crop
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { cropType, startDate, expectedDuration, landSize } = req.body;

    // Normalize landSize so we always store { value, unit }
    let normalizedLandSize = landSize;
    if (typeof landSize === 'number' || typeof landSize === 'string') {
      normalizedLandSize = {
        value: parseFloat(landSize),
        unit: 'बीघा'
      };
    }
    if (landSize && typeof landSize === 'object') {
      normalizedLandSize = {
        value: parseFloat(landSize.value),
        unit: landSize.unit || 'बीघा'
      };
    }

    const parsedExpected = expectedDuration ? Number(expectedDuration) : undefined;

    const cropNameMapping = {
      'धान': 'Rice',
      'गेहूं': 'Wheat',
      'गन्ना': 'Sugarcane'
    };

    const crop = await Crop.create({
      farmer: req.user._id,
      cropType,
      cropNameEnglish: cropNameMapping[cropType],
      startDate,
      expectedDuration: parsedExpected,
      landSize: normalizedLandSize,
      status: 'चालू'
    });

    res.status(201).json({
      success: true,
      crop
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'फसल बनाने में त्रुटि' });
  }
});

// @route   GET /api/crops
// @desc    Get all crops for logged-in farmer
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { farmer: req.user._id };
    if (status) {
      query.status = status;
    }

    const crops = await Crop.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: crops.length,
      crops
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'फसलें लाने में त्रुटि' });
  }
});

// @route   GET /api/crops/:id
// @desc    Get single crop
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!crop) {
      return res.status(404).json({ message: 'फसल नहीं मिली' });
    }

    // Get all materials for this crop
    const materials = await Material.find({ crop: crop._id }).sort({ date: -1 });

    res.json({
      success: true,
      crop,
      materials
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'फसल लाने में त्रुटि' });
  }
});

// @route   PUT /api/crops/:id
// @desc    Update crop
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let crop = await Crop.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!crop) {
      return res.status(404).json({ message: 'फसल नहीं मिली' });
    }

    const updateBody = { ...req.body };
    // Normalize landSize if provided
    if (updateBody.landSize) {
      if (typeof updateBody.landSize === 'number' || typeof updateBody.landSize === 'string') {
        updateBody.landSize = {
          value: parseFloat(updateBody.landSize),
          unit: 'बीघा'
        };
      } else if (typeof updateBody.landSize === 'object') {
        updateBody.landSize = {
          value: parseFloat(updateBody.landSize.value),
          unit: updateBody.landSize.unit || 'बीघा'
        };
      }
    }
    if (updateBody.expectedDuration) {
      updateBody.expectedDuration = Number(updateBody.expectedDuration);
    }

    crop = await Crop.findByIdAndUpdate(
      req.params.id,
      updateBody,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      crop
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'फसल अपडेट करने में त्रुटि' });
  }
});

// @route   PUT /api/crops/:id/complete
// @desc    Complete crop and calculate profit/loss
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { production } = req.body;

    let crop = await Crop.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!crop) {
      return res.status(404).json({ message: 'फसल नहीं मिली' });
    }

    // Calculate total cost from materials
    const materials = await Material.find({ crop: crop._id });
    const totalCost = materials.reduce((sum, material) => sum + material.price, 0);

    // Calculate total income
    const totalIncome = production.quantity * production.sellingPrice;

    // Calculate net profit
    const netProfit = totalIncome - totalCost;

    crop.production = production;
    crop.totalCost = totalCost;
    crop.totalIncome = totalIncome;
    crop.netProfit = netProfit;
    crop.status = 'पूर्ण';
    crop.completedAt = new Date();

    await crop.save();

    res.json({
      success: true,
      crop
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'फसल पूर्ण करने में त्रुटि' });
  }
});

// @route   DELETE /api/crops/:id
// @desc    Delete crop
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!crop) {
      return res.status(404).json({ message: 'फसल नहीं मिली' });
    }

    // Delete all materials associated with this crop
    await Material.deleteMany({ crop: crop._id });

    await Crop.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'फसल हटाई गई'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'फसल हटाने में त्रुटि' });
  }
});

module.exports = router;
