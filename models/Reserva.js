const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cabinas: [{
    type: Number,
    required: true
  }],
  cybercafe: {
    type: String,
    required: true,
    default: 'Silicom Lan Center'
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  precio: {
    type: String,
    required: true,
    enum: ['S/1', 'S/2', 'S/5', 'S/10']
  },
  duracionMinutos: {
    type: Number,
    required: true
  },
  puntosGanados: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'Pagado', 'Activo', 'Completado', 'Cancelado'],
    default: 'Pendiente'
  },
  codigoQR: {
    type: String,
    default: null
  },
  metodoPago: {
    type: String,
    enum: ['Yape', 'Efectivo', 'Tarjeta'],
    default: 'Yape'
  },
  transaccionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Método para calcular puntos basado en duración y cantidad de cabinas
reservaSchema.methods.calcularPuntos = function() {
  const puntosBase = {
    'S/1': 1,   // 30 min
    'S/2': 2,   // 60 min  
    'S/5': 6,   // 180 min
    'S/10': 12  // 360 min
  };
  
  return puntosBase[this.precio] * this.cabinas.length;
};

// Método para verificar si la reserva está activa
reservaSchema.methods.estaActiva = function() {
  const ahora = new Date();
  return this.estado === 'Activo' && ahora >= this.fechaInicio && ahora <= this.fechaFin;
};

module.exports = mongoose.model('Reserva', reservaSchema);