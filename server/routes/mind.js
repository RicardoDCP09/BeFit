const express = require('express');
const authMiddleware = require('../middleware/auth');
const { ChatHistory, User } = require('../models');
const { chatTherapist, generateWellnessTips } = require('../utils/gemini');

const router = express.Router();

// Send chat message
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const user = await User.findByPk(req.userId);
    const today = new Date().toISOString().split('T')[0];

    // Get or create today's chat session
    let chatSession = await ChatHistory.findOne({
      where: { userId: req.userId, sessionDate: today }
    });

    if (!chatSession) {
      chatSession = await ChatHistory.create({
        userId: req.userId,
        sessionDate: today,
        messages: []
      });
    }

    // Add user message to history
    const messages = chatSession.messages || [];
    messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Get AI response
    const aiResponse = await chatTherapist(messages, user.name);

    // Add AI response to history
    messages.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });

    // Update chat session
    await chatSession.update({ messages });

    res.json({
      message: 'Message sent',
      response: aiResponse,
      sessionId: chatSession.id
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get chat history for today
router.get('/chat/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const chatSession = await ChatHistory.findOne({
      where: { userId: req.userId, sessionDate: today }
    });

    res.json({
      messages: chatSession ? chatSession.messages : [],
      sessionId: chatSession ? chatSession.id : null
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Get chat history (all sessions)
router.get('/chat/history', authMiddleware, async (req, res) => {
  try {
    const sessions = await ChatHistory.findAll({
      where: { userId: req.userId },
      order: [['session_date', 'DESC']],
      limit: 30
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Get wellness tips
router.get('/tips', authMiddleware, async (req, res) => {
  try {
    const { mood } = req.query;

    const tips = await generateWellnessTips(mood || 'neutral');

    res.json(tips);
  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({ error: 'Failed to get wellness tips' });
  }
});

// Update mood
router.put('/mood', authMiddleware, async (req, res) => {
  try {
    const { mood } = req.body;
    const today = new Date().toISOString().split('T')[0];

    let chatSession = await ChatHistory.findOne({
      where: { userId: req.userId, sessionDate: today }
    });

    if (!chatSession) {
      chatSession = await ChatHistory.create({
        userId: req.userId,
        sessionDate: today,
        messages: [],
        mood
      });
    } else {
      await chatSession.update({ mood });
    }

    res.json({ message: 'Mood updated', mood });
  } catch (error) {
    console.error('Update mood error:', error);
    res.status(500).json({ error: 'Failed to update mood' });
  }
});

module.exports = router;
