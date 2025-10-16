const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// POST /api/chatbot/message - Enviar mensaje al chatbot
router.post('/message', chatbotController.sendMessage);

module.exports = router;
