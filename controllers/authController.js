const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Agrega esto a tu .env

exports.register = async (req, res) => {
  try {
    const {
      username, firstName, lastName, gender, birthDate,
      email, password
    } = req.body;

    if (!username || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Campos requeridos faltantes' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Correo o usuario ya registrados' });
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

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '3h',
    });

    res.status(200).json({ token, userId: user._id, email: user.email });
  } catch (err) {
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// 🔐 Iniciar sesión o registrarse con Google
exports.loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // ✨ Debugging logs
    console.log('📧 Google login request received');
    console.log('📋 Request body:', req.body);
    console.log('🎫 idToken received:', idToken ? 'TOKEN_PRESENT' : 'TOKEN_MISSING');
    console.log('🎫 idToken length:', idToken ? idToken.length : 0);
    console.log('🔑 GOOGLE_CLIENT_ID configured:', process.env.GOOGLE_CLIENT_ID ? 'YES' : 'NO');
    
    if (!idToken) {
      console.error('❌ No idToken provided');
      return res.status(400).json({ msg: 'idToken es requerido' });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub } = payload;
    
    // ✨ More debugging logs
    console.log('✅ Token verified successfully');
    console.log('👤 User payload:', { email, given_name, family_name, sub });

    let user = await User.findOne({ email });

    // Función para detectar género basado en nombre
    const detectGender = (firstName) => {
      const femaleNames = [
        'maria', 'ana', 'carmen', 'isabel', 'laura', 'elena', 'rosa', 'patricia', 
        'cristina', 'sara', 'marta', 'andrea', 'lucia', 'paula', 'sofia', 'daniela',
        'alejandra', 'natalia', 'carolina', 'valeria', 'gabriela', 'fernanda',
        'adriana', 'monica', 'silvia', 'teresa', 'rocio', 'beatriz', 'gloria',
        'maciel', 'marisol', 'esperanza', 'concepcion', 'pilar', 'mercedes'
      ];
      
      const name = (firstName || '').toLowerCase().trim();
      
      // Buscar si algún nombre femenino está contenido en el nombre
      for (const femaleName of femaleNames) {
        if (name.includes(femaleName)) {
          return 'Femenino';
        }
      }
      
      return 'Masculino'; // Por defecto
    };

    // Si no existe, crear usuario automático
    if (!user) {
      console.log('🆕 Creating new user for email:', email);
      const detectedGender = detectGender(given_name);
      console.log('👥 Gender detected for', given_name, ':', detectedGender);
      
      user = new User({
        username: `google_${sub}`,
        firstName: given_name || 'Usuario',
        lastName: family_name || 'Google', // Valor por defecto si no viene family_name
        gender: detectedGender, // ✨ Ahora detectamos el género automáticamente
        email,
        password: await bcrypt.hash(sub, 10), // Valor dummy, ya que se usa Google
      });
      await user.save();
      console.log('✅ New user created with ID:', user._id, 'Gender:', user.gender);
    } else {
      console.log('👋 Existing user found:', user._id);
      
      // Si usuario existente no tiene género, detectarlo y actualizarlo
      if (!user.gender) {
        const detectedGender = detectGender(user.firstName);
        console.log('🔄 Updating existing user gender for', user.firstName, ':', detectedGender);
        user.gender = detectedGender;
        await user.save();
        console.log('✅ Existing user gender updated');
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '3h',
    });

    console.log('🎉 Login successful, sending response for user:', user.email);
    res.status(200).json({
      _id: user._id,        // Para compatibilidad con app
      userId: user._id,     // Campo actual
      id: user._id,         // Campo adicional de compatibilidad
      token,
      email: user.email,
      firstName: user.firstName,
      username: user.username || `google_${sub}`,
      gender: user.gender, // ✨ Enviar género en la respuesta
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ msg: 'Token de Google inválido' });
  }
};
