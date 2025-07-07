const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; // Render define PORT automáticamente

// Middleware y rutas
app.use(express.json());

// Aquí deberías tener tus rutas como:
// app.use('/api', require('./routes/userRoutes'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB Atlas');

    // Solo escucha después de conectarse exitosamente
    app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  })
  .catch(err => console.error(err));

