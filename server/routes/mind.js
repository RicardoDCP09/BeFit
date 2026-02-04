const express = require('express');
const authMiddleware = require('../middleware/auth');
const { ChatHistory, User } = require('../models');
const { chatTherapist, generateWellnessTips } = require('../utils/gemini');

const router = express.Router();

// Send chat message
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, mood } = req.body;

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
        messages: [],
        mood: mood || null
      });
    } else if (mood && !chatSession.mood) {
      // Update mood if provided and not already set
      await chatSession.update({ mood });
    }

    // Add user message to history
    const messages = [...(chatSession.messages || [])];
    messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Get AI response with mood context
    const aiResponse = await chatTherapist(messages, user.name, chatSession.mood);

    // Add AI response to history
    messages.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });

    // Update chat session - use changed() to force Sequelize to detect JSONB changes
    chatSession.messages = messages;
    chatSession.changed('messages', true);
    await chatSession.save();

    res.json({
      message: 'Message sent',
      response: aiResponse,
      sessionId: chatSession.id,
      quickReplies: generateQuickReplies(aiResponse)
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Generate contextual quick replies based on AI response
function generateQuickReplies(aiResponse) {
  const lowerResponse = aiResponse.toLowerCase();

  // Default quick replies
  const defaultReplies = ['Cuéntame más', 'Gracias por escucharme', '¿Qué me recomiendas?'];

  // Contextual replies based on response content
  if (lowerResponse.includes('pregunt') || lowerResponse.includes('?')) {
    return ['Sí, es así', 'No exactamente', 'Déjame pensarlo'];
  }
  if (lowerResponse.includes('ejercicio') || lowerResponse.includes('respiración') || lowerResponse.includes('técnica')) {
    return ['Quiero intentarlo', 'Dame otra opción', '¿Cómo funciona?'];
  }
  if (lowerResponse.includes('meta') || lowerResponse.includes('objetivo') || lowerResponse.includes('propósito')) {
    return ['Tengo una meta en mente', 'No estoy seguro/a', 'Ayúdame a definirla'];
  }

  return defaultReplies;
}

// Get chat history for today
router.get('/chat/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const chatSession = await ChatHistory.findOne({
      where: { userId: req.userId, sessionDate: today }
    });

    res.json({
      messages: chatSession ? chatSession.messages : [],
      sessionId: chatSession ? chatSession.id : null,
      mood: chatSession ? chatSession.mood : null
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
