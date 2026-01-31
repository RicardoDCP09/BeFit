const express = require('express');
const authMiddleware = require('../middleware/auth');
const { User, HealthProfile } = require('../models');

const router = express.Router();

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{ model: HealthProfile, as: 'healthProfile' }],
      attributes: { exclude: ['passwordHash'] }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    await User.update({ name }, { where: { id: req.userId } });

    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update health profile (biometrics)
router.put('/health-profile', authMiddleware, async (req, res) => {
  try {
    const { weight, height, age, gender, activityLevel, goal } = req.body;

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // Calculate TMB (Mifflin-St Jeor)
    let tmb;
    if (gender === 'male') {
      tmb = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      tmb = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE based on activity level
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    const tdee = tmb * (activityMultipliers[activityLevel] || 1.55);

    // Estimate body fat percentage (simplified formula)
    let bodyFatPercentage;
    if (gender === 'male') {
      bodyFatPercentage = 1.20 * bmi + 0.23 * age - 16.2;
    } else {
      bodyFatPercentage = 1.20 * bmi + 0.23 * age - 5.4;
    }

    await HealthProfile.update(
      {
        weight,
        height,
        age,
        gender,
        activityLevel,
        goal,
        bmi: bmi.toFixed(2),
        tmb: tmb.toFixed(2),
        tdee: tdee.toFixed(2),
        bodyFatPercentage: bodyFatPercentage.toFixed(2)
      },
      { where: { userId: req.userId } }
    );

    // Mark onboarding as completed
    await User.update(
      { onboardingCompleted: true },
      { where: { id: req.userId } }
    );

    const healthProfile = await HealthProfile.findOne({
      where: { userId: req.userId }
    });

    res.json({
      message: 'Health profile updated',
      healthProfile,
      calculations: {
        bmi: bmi.toFixed(2),
        bmiCategory: getBMICategory(bmi),
        tmb: tmb.toFixed(2),
        tdee: tdee.toFixed(2),
        bodyFatPercentage: bodyFatPercentage.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Update health profile error:', error);
    res.status(500).json({ error: 'Failed to update health profile' });
  }
});

// Get health profile
router.get('/health-profile', authMiddleware, async (req, res) => {
  try {
    const healthProfile = await HealthProfile.findOne({
      where: { userId: req.userId }
    });

    if (!healthProfile) {
      return res.status(404).json({ error: 'Health profile not found' });
    }

    res.json({
      healthProfile,
      bmiCategory: healthProfile.bmi ? getBMICategory(parseFloat(healthProfile.bmi)) : null
    });
  } catch (error) {
    console.error('Get health profile error:', error);
    res.status(500).json({ error: 'Failed to get health profile' });
  }
});

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}

module.exports = router;
