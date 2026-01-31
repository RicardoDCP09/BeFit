const express = require('express');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const { WeightHistory, HealthProfile, Routine, ChatHistory } = require('../models');

const router = express.Router();

// Get weight history
router.get('/weight-history', authMiddleware, async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    const history = await WeightHistory.findAll({
      where: { userId: req.userId },
      order: [['date', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      history: history.reverse().map(h => ({
        date: h.date,
        weight: parseFloat(h.weight),
        notes: h.notes
      }))
    });
  } catch (error) {
    console.error('Get weight history error:', error);
    res.status(500).json({ error: 'Failed to get weight history' });
  }
});

// Add weight entry
router.post('/weight', authMiddleware, async (req, res) => {
  try {
    const { weight, date, notes } = req.body;

    if (!weight || weight < 20 || weight > 500) {
      return res.status(400).json({ error: 'Invalid weight value' });
    }

    const entryDate = date || new Date().toISOString().split('T')[0];

    // Upsert - update if exists for same date, create if not
    const [entry, created] = await WeightHistory.upsert({
      userId: req.userId,
      weight,
      date: entryDate,
      notes
    }, {
      returning: true
    });

    // Also update current weight in health profile
    await HealthProfile.update(
      { weight },
      { where: { userId: req.userId } }
    );

    res.json({
      message: created ? 'Weight entry created' : 'Weight entry updated',
      entry: {
        date: entry.date,
        weight: parseFloat(entry.weight),
        notes: entry.notes
      }
    });
  } catch (error) {
    console.error('Add weight error:', error);
    res.status(500).json({ error: 'Failed to add weight entry' });
  }
});

// Get user statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Count completed routines (where progress has completed exercises)
    const routines = await Routine.findAll({
      where: { userId: req.userId }
    });

    let totalWorkouts = 0;
    let streakDays = 0;

    routines.forEach(routine => {
      if (routine.progress) {
        const days = Object.keys(routine.progress);
        days.forEach(day => {
          const exercises = routine.progress[day];
          const completed = Object.values(exercises).filter(Boolean).length;
          if (completed > 0) totalWorkouts++;
        });
      }
    });

    // Count chat sessions (unique days with messages)
    const chatDays = await ChatHistory.count({
      where: { userId: req.userId },
      distinct: true,
      col: 'session_date'
    });

    // Calculate streak (consecutive days with activity)
    const recentWeights = await WeightHistory.findAll({
      where: { userId: req.userId },
      order: [['date', 'DESC']],
      limit: 30
    });

    if (recentWeights.length > 0) {
      const today = new Date();
      let currentDate = new Date(recentWeights[0].date);

      // Check if most recent entry is today or yesterday
      const daysDiff = Math.floor((today - currentDate) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        streakDays = 1;
        for (let i = 1; i < recentWeights.length; i++) {
          const prevDate = new Date(recentWeights[i].date);
          const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            streakDays++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    // Get weight change
    let weightChange = null;
    if (recentWeights.length >= 2) {
      const latest = parseFloat(recentWeights[0].weight);
      const oldest = parseFloat(recentWeights[recentWeights.length - 1].weight);
      weightChange = latest - oldest;
    }

    res.json({
      streakDays,
      totalWorkouts,
      totalChatSessions: chatDays,
      totalWeightEntries: recentWeights.length,
      weightChange
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get achievements
router.get('/achievements', authMiddleware, async (req, res) => {
  try {
    const routines = await Routine.count({ where: { userId: req.userId } });
    const weightEntries = await WeightHistory.count({ where: { userId: req.userId } });
    const chatSessions = await ChatHistory.count({
      where: { userId: req.userId },
      distinct: true,
      col: 'session_date'
    });

    const achievements = [
      {
        id: 'first_workout',
        title: 'Primera Rutina',
        description: 'Completa tu primera rutina de ejercicios',
        icon: 'trophy',
        progress: Math.min(routines, 1),
        target: 1,
        unlockedAt: routines >= 1 ? new Date().toISOString() : null
      },
      {
        id: 'week_streak',
        title: 'Semana Perfecta',
        description: 'Registra tu peso 7 días seguidos',
        icon: 'fire',
        progress: Math.min(weightEntries, 7),
        target: 7,
        unlockedAt: weightEntries >= 7 ? new Date().toISOString() : null
      },
      {
        id: 'mindful_week',
        title: 'Mente Clara',
        description: 'Usa el diario mental 7 días',
        icon: 'leaf',
        progress: Math.min(chatSessions, 7),
        target: 7,
        unlockedAt: chatSessions >= 7 ? new Date().toISOString() : null
      },
      {
        id: 'weight_tracker',
        title: 'Constancia',
        description: 'Registra tu peso 10 veces',
        icon: 'line-chart',
        progress: Math.min(weightEntries, 10),
        target: 10,
        unlockedAt: weightEntries >= 10 ? new Date().toISOString() : null
      },
      {
        id: 'routine_master',
        title: 'Maestro del Gym',
        description: 'Genera 5 rutinas de ejercicios',
        icon: 'heartbeat',
        progress: Math.min(routines, 5),
        target: 5,
        unlockedAt: routines >= 5 ? new Date().toISOString() : null
      }
    ];

    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

module.exports = router;
