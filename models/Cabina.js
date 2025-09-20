const mongoose = require('mongoose');

const cabinaSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true,
    unique: true
  },
  estado: {
    type: String,
    enum: ['Libre', 'Ocupado', 'Reservado'],
    default: 'Libre'
  },
  cybercafe: {
    type: String,
    required: true,
    default: 'Silicom Lan Center'
  },
  reservadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  horaInicio: {
    type: Date,
    default: null
  },
  horaFin: {
    type: Date,
    default: null
  },
  ultimaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware para actualizar automáticamente el timestamp
cabinaSchema.pre('save', function(next) {
  this.ultimaActualizacion = new Date();
  next();
});

// Método para verificar si la reserva ha expirado
cabinaSchema.methods.verificarExpiracion = function() {
  if (this.estado === 'Ocupado' && this.horaFin && new Date() > this.horaFin) {
    this.estado = 'Libre';
    this.reservadoPor = null;
    this.horaInicio = null;
    this.horaFin = null;
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Cabina', cabinaSchema);