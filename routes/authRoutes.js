const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authController = require('../controllers/authController');
const { loginWithGoogle } = require('../controllers/authController');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '3h';

// Ruta: Login con Google
router.post('/google', loginWithGoogle);

// Registro
router.post('/register', async (req, res) => {
    const {
        username,
        firstName,
        lastName,
        gender,
        birthDate,
        email,
        password
    } = req.body;

    try {
        if (!username || !firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo o el nombre de usuario ya están registrados' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            firstName,
            lastName,
            gender,
            birthDate,
            email,
            password: hashedPassword
        });

                await newUser.save();

                // Generar token
                const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

                // Set cookie httpOnly para web
                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    // Para permitir cookies cross-site en producción (frontend en http://localhost:5173 apuntando al backend en https)
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    maxAge: 3 * 60 * 60 * 1000, // 3 horas
                };
                res.cookie('token', token, cookieOptions);

                res.status(201).json({ message: 'Usuario creado correctamente', token, user: { _id: newUser._id, username: newUser.username, email: newUser.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

                // Set cookie httpOnly
                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    maxAge: 3 * 60 * 60 * 1000, // 3 horas
                };
                res.cookie('token', token, cookieOptions);

        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: { _id: user._id, username: user.username, email: user.email, gender: user.gender }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Reset de contraseña
router.post('/reset-password', async (req, res) => {
    const { username, email, newPassword } = req.body;

    try {
        const user = await User.findOne({ username, email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado con ese correo y nombre' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;

// Endpoint para obtener información del usuario autenticado (desde cookie o token)
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ user });
    } catch (error) {
        console.error('Error en /me:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Endpoint de logout (borra cookie)
router.post('/logout', (req, res) => {
    const cookieOptions = { httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' };
    res.clearCookie('token', cookieOptions);
    return res.json({ message: 'Logged out' });
});
