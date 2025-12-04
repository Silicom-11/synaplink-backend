const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const {
      username, firstName, lastName, gender, birthDate,
      email, password
    } = req.body;

    if (!username || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Campos requeridos faltantes' });
    }

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Correo o usuario ya registrados' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      perfil: {
        nombre: firstName,
        apellido: lastName,
        nombreCompleto: `${firstName} ${lastName}`,
        genero: gender || 'Prefiero no decir',
        fechaNacimiento: birthDate || null
      },
      puntos: { actuales: 0, totalesGanados: 0, totalesCanjeados: 0 },
      estadisticas: { totalReservas: 0 }
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Obtener nombre de estructura nueva o vieja
    const firstName = user.perfil?.nombre || user.firstName || 'Usuario';
    const lastName = user.perfil?.apellido || user.lastName || '';
    const gender = user.perfil?.genero || user.gender || 'Masculino';

    res.status(200).json({ 
      token, 
      userId: user._id, 
      _id: user._id,
      email: user.email,
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      puntos: user.puntos?.actuales || 0
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// 🔐 Iniciar sesión o registrarse con Google
exports.loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    console.log('📧 Google login request received');
    console.log('🎫 idToken received:', idToken ? 'TOKEN_PRESENT' : 'TOKEN_MISSING');
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
    const { email, given_name, family_name, sub, picture } = payload;
    
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
      for (const femaleName of femaleNames) {
        if (name.includes(femaleName)) {
          return 'Femenino';
        }
      }
      return 'Masculino';
    };

    // Si no existe, crear usuario con estructura nueva
    if (!user) {
      console.log('🆕 Creating new user for email:', email);
      const detectedGender = detectGender(given_name);
      
      user = new User({
        username: `google_${sub}`.toLowerCase(),
        email: email.toLowerCase(),
        googleId: sub,
        perfil: {
          nombre: given_name || 'Usuario',
          apellido: family_name || 'Google',
          nombreCompleto: `${given_name || 'Usuario'} ${family_name || 'Google'}`,
          genero: detectedGender,
          avatar: picture || ''
        },
        puntos: { actuales: 0, totalesGanados: 0, totalesCanjeados: 0 },
        estadisticas: { totalReservas: 0 }
      });
      await user.save();
      console.log('✅ New user created with ID:', user._id);
    } else {
      console.log('👋 Existing user found:', user._id);
      
      // Migrar usuario viejo a estructura nueva si es necesario
      let needsSave = false;
      
      // Si tiene estructura vieja (firstName/lastName), migrar a nueva (perfil.nombre/apellido)
      if (user.firstName && !user.perfil?.nombre) {
        user.perfil = user.perfil || {};
        user.perfil.nombre = user.firstName;
        user.perfil.apellido = user.lastName || 'Usuario';
        user.perfil.nombreCompleto = `${user.firstName} ${user.lastName || ''}`.trim();
        user.perfil.genero = user.gender || detectGender(user.firstName);
        user.perfil.avatar = picture || user.perfil?.avatar || '';
        needsSave = true;
        console.log('🔄 Migrating user to new schema');
      }
      
      // Agregar googleId si no lo tiene
      if (!user.googleId) {
        user.googleId = sub;
        needsSave = true;
      }
      
      if (needsSave) {
        // Usar updateOne para evitar validaciones del schema completo
        await User.updateOne(
          { _id: user._id },
          { 
            $set: {
              googleId: sub,
              'perfil.nombre': user.perfil?.nombre || user.firstName || given_name || 'Usuario',
              'perfil.apellido': user.perfil?.apellido || user.lastName || family_name || 'Usuario',
              'perfil.nombreCompleto': `${user.perfil?.nombre || user.firstName || given_name || 'Usuario'} ${user.perfil?.apellido || user.lastName || family_name || ''}`.trim(),
              'perfil.genero': user.perfil?.genero || user.gender || detectGender(given_name),
              'perfil.avatar': picture || user.perfil?.avatar || ''
            }
          }
        );
        // Recargar usuario
        user = await User.findById(user._id);
        console.log('✅ User migrated successfully');
      }
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Obtener nombre para compatibilidad
    const firstName = user.perfil?.nombre || user.firstName || given_name || 'Usuario';
    const lastName = user.perfil?.apellido || user.lastName || family_name || '';
    const gender = user.perfil?.genero || user.gender || 'Masculino';

    console.log('🎉 Login successful for:', user.email);
    res.status(200).json({
      _id: user._id,
      userId: user._id,
      id: user._id,
      token,
      email: user.email,
      firstName: firstName,
      lastName: lastName,
      username: user.username,
      gender: gender,
      puntos: user.puntos?.actuales || 0
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ msg: 'Token de Google inválido' });
  }
};
