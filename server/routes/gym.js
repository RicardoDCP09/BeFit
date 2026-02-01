const express = require('express');
const authMiddleware = require('../middleware/auth');
const { Routine, HealthProfile, WorkoutSession } = require('../models');
const { generateRoutine } = require('../utils/gemini');
const { Op } = require('sequelize');

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
      return res.json({ routine: null, message: 'No active routine found' });
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

// ==================== WORKOUT SESSION ENDPOINTS ====================

// Start a new workout session
router.post('/session/start', authMiddleware, async (req, res) => {
  try {
    const { routineId, dayName, restTimeUsed } = req.body;

    // Verify routine exists and belongs to user
    const routine = await Routine.findOne({
      where: { id: routineId, userId: req.userId }
    });

    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    // Create new session
    const session = await WorkoutSession.create({
      userId: req.userId,
      routineId,
      dayName,
      startTime: new Date(),
      restTimeUsed: restTimeUsed || 60,
      exercisesCompleted: 0,
      exerciseData: [],
      isCompleted: false
    });

    res.json({
      message: 'Workout session started',
      session
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start workout session' });
  }
});

// Complete a workout session
router.put('/session/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { exerciseData, exercisesCompleted } = req.body;

    const session = await WorkoutSession.findOne({
      where: { id, userId: req.userId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const endTime = new Date();
    const totalDuration = Math.round((endTime - new Date(session.startTime)) / 1000);

    await session.update({
      endTime,
      totalDuration,
      exercisesCompleted: exercisesCompleted || 0,
      exerciseData: exerciseData || [],
      isCompleted: true
    });

    res.json({
      message: 'Workout session completed',
      session
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ error: 'Failed to complete workout session' });
  }
});

// Get workout session history
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const sessions = await WorkoutSession.findAll({
      where: { userId: req.userId, isCompleted: true },
      order: [['start_time', 'DESC']],
      limit: parseInt(limit),
      include: [{
        model: Routine,
        attributes: ['id', 'weekStart']
      }]
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get workout sessions' });
  }
});

// Get workout session statistics
router.get('/sessions/stats', authMiddleware, async (req, res) => {
  try {
    // Get all completed sessions
    const allSessions = await WorkoutSession.findAll({
      where: { userId: req.userId, isCompleted: true }
    });

    // Calculate this week's sessions
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekSessions = await WorkoutSession.count({
      where: {
        userId: req.userId,
        isCompleted: true,
        startTime: { [Op.gte]: startOfWeek }
      }
    });

    // Calculate this month's sessions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthSessions = await WorkoutSession.count({
      where: {
        userId: req.userId,
        isCompleted: true,
        startTime: { [Op.gte]: startOfMonth }
      }
    });

    // Calculate totals
    const totalSessions = allSessions.length;
    const totalTime = allSessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
    const totalExercises = allSessions.reduce((sum, s) => sum + (s.exercisesCompleted || 0), 0);
    const avgSessionDuration = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;

    res.json({
      stats: {
        totalSessions,
        totalTime,
        avgSessionDuration,
        exercisesCompleted: totalExercises,
        thisWeek: thisWeekSessions,
        thisMonth: thisMonthSessions
      }
    });
  } catch (error) {
    console.error('Get session stats error:', error);
    res.status(500).json({ error: 'Failed to get session statistics' });
  }
});

module.exports = router;
