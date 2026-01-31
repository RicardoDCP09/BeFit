const express = require('express');
const authMiddleware = require('../middleware/auth');
const { Routine, HealthProfile } = require('../models');
const { generateRoutine } = require('../utils/gemini');

const router = express.Router();

// Generate new routine
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const healthProfile = await HealthProfile.findOne({
      where: { userId: req.userId }
    });

    if (!healthProfile || !healthProfile.goal) {
      return res.status(400).json({ 
        error: 'Please complete your health profile first' 
      });
    }

    const routinePlan = await generateRoutine(healthProfile);

    // Get start of current week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    // Deactivate previous routines
    await Routine.update(
      { isActive: false },
      { where: { userId: req.userId } }
    );

    // Create new routine
    const routine = await Routine.create({
      userId: req.userId,
      weekStart: weekStart.toISOString().split('T')[0],
      plan: routinePlan,
      progress: {},
      isActive: true
    });

    res.json({
      message: 'Routine generated successfully',
      routine
    });
  } catch (error) {
    console.error('Generate routine error:', error);
    res.status(500).json({ error: 'Failed to generate routine' });
  }
});

// Get current active routine
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const routine = await Routine.findOne({
      where: { userId: req.userId, isActive: true },
      order: [['created_at', 'DESC']]
    });

    if (!routine) {
      return res.status(404).json({ error: 'No active routine found' });
    }

    res.json({ routine });
  } catch (error) {
    console.error('Get routine error:', error);
    res.status(500).json({ error: 'Failed to get routine' });
  }
});

// Update exercise progress
router.put('/progress', authMiddleware, async (req, res) => {
  try {
    const { day, exerciseIndex, completed } = req.body;

    const routine = await Routine.findOne({
      where: { userId: req.userId, isActive: true }
    });

    if (!routine) {
      return res.status(404).json({ error: 'No active routine found' });
    }

    const progress = routine.progress || {};
    if (!progress[day]) {
      progress[day] = {};
    }
    progress[day][exerciseIndex] = completed;

    await routine.update({ progress });

    // Calculate completion percentage
    const plan = routine.plan;
    let totalExercises = 0;
    let completedExercises = 0;

    if (plan && plan.weekPlan) {
      plan.weekPlan.forEach(dayPlan => {
        if (dayPlan.exercises) {
          totalExercises += dayPlan.exercises.length;
          const dayProgress = progress[dayPlan.day] || {};
          Object.values(dayProgress).forEach(isCompleted => {
            if (isCompleted) completedExercises++;
          });
        }
      });
    }

    const completionPercentage = totalExercises > 0 
      ? Math.round((completedExercises / totalExercises) * 100) 
      : 0;

    res.json({
      message: 'Progress updated',
      progress,
      completionPercentage
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get routine history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const routines = await Routine.findAll({
      where: { userId: req.userId },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({ routines });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get routine history' });
  }
});

module.exports = router;
