const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// GET /api/chatbot/models - Listar modelos disponibles
router.get('/models', chatbotController.listModels);

// POST /api/chatbot/message - Enviar mensaje al chatbot
router.post('/message', chatbotController.sendMessage);

// GET /api/chatbot/cache-stats - Ver estadísticas de caché
router.get('/cache-stats', chatbotController.getCacheStats);

module.exports = router;
