// routes/reservasRoutes.js
const express = require('express');
const router = express.Router();

// Ruta de prueba para ver si funciona
router.get('/', (req, res) => {
  res.json({ msg: 'Ruta de reservas funcionando' });
});

module.exports = router;