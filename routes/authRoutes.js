const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'El usuario ya existe' });

    // Crea nuevo usuario
    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: 'Registro exitoso' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica si el usuario existe
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

    // Genera token JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
