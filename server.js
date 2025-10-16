const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'autocabina_db',
})
  .then(() => console.log('✅ Conectado a MongoDB Atlas correctamente'))
  .catch((err) => console.error('❌ Error de conexión a MongoDB:', err));

// CORS - permitir credenciales (cookies) desde el frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/reservas', require('./routes/reservasRoutes'));

app.use('/api/chatbot', require('./routes/chatbotRoutes'));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Esto va al final, después de todas tus rutas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});