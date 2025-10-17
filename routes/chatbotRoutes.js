const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// GET /api/chatbot/models - Listar modelos disponibles
router.get('/models', chatbotController.listModels);

// POST /api/chatbot/message - Enviar mensaje al chatbot
router.post('/message', chatbotController.sendMessage);

module.exports = router;
