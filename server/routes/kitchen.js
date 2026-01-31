const express = require('express');
const authMiddleware = require('../middleware/auth');
const { HealthProfile } = require('../models');
const { analyzeIngredients, generateRecipe } = require('../utils/gemini');

const router = express.Router();

// Analyze fridge/pantry image
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    const analysis = await analyzeIngredients(base64Image);

    res.json({
      message: 'Image analyzed successfully',
      ...analysis
    });
  } catch (error) {
    console.error('Analyze image error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Generate recipe from ingredients
router.post('/recipe', authMiddleware, async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !ingredients.length) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    const healthProfile = await HealthProfile.findOne({
      where: { userId: req.userId }
    });

    if (!healthProfile) {
      return res.status(400).json({ 
        error: 'Please complete your health profile first' 
      });
    }

    const recipe = await generateRecipe(ingredients, healthProfile);

    res.json({
      message: 'Recipe generated successfully',
      recipe
    });
  } catch (error) {
    console.error('Generate recipe error:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

// Analyze and generate recipe in one step
router.post('/smart-cook', authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const healthProfile = await HealthProfile.findOne({
      where: { userId: req.userId }
    });

    if (!healthProfile) {
      return res.status(400).json({ 
        error: 'Please complete your health profile first' 
      });
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // Step 1: Analyze ingredients
    const analysis = await analyzeIngredients(base64Image);

    // Step 2: Generate recipe
    const recipe = await generateRecipe(analysis.ingredients, healthProfile);

    res.json({
      message: 'Smart cook completed',
      ingredients: analysis.ingredients,
      summary: analysis.summary,
      recipe
    });
  } catch (error) {
    console.error('Smart cook error:', error);
    res.status(500).json({ error: 'Failed to process smart cook' });
  }
});

module.exports = router;
