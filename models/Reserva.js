const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cabinas: [
    {
      id: Number,
      estado: { type: String, default: 'Reservado' }
    }
  ],
  fecha: {
    type: String, // puede ser tipo Date si prefieres
    required: true
  },
  horaInicio: {
    type: String,
    required: true
  },
  horaSalida: {
    type: String,
    required: true
  },
  precio: {
    type: String,
    required: true
  },
  puntosGanados: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reserva', reservaSchema);
