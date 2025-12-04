const mongoose = require('mongoose');

/**
 * 👤 MODELO USER - Mejorado
 * 
 * Sistema de usuarios con:
 * - Sistema de puntos y niveles
 * - Historial de actividad
 * - Preferencias
 */

// Niveles del sistema de puntos
const NIVELES = {
  BRONCE: { min: 0, max: 49, nombre: 'Bronce', emoji: '🥉', descuento: 0 },
  PLATA: { min: 50, max: 199, nombre: 'Plata', emoji: '🥈', descuento: 5 },
  ORO: { min: 200, max: 499, nombre: 'Oro', emoji: '🥇', descuento: 10 },
  PLATINO: { min: 500, max: 999, nombre: 'Platino', emoji: '💎', descuento: 15 },
  DIAMANTE: { min: 1000, max: Infinity, nombre: 'Diamante', emoji: '👑', descuento: 20 }
};

const userSchema = new mongoose.Schema({
  // Información básica
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  password: {
    type: String,
    required: function() {
      // Solo requerido si no es login con Google
      return !this.googleId;
    }
  },
  
  // Perfil
  perfil: {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    nombreCompleto: { type: String },
    genero: { 
      type: String, 
      enum: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'],
      default: 'Prefiero no decir'
    },
    fechaNacimiento: { type: Date, default: null },
    telefono: { type: String, default: '' },
    avatar: { type: String, default: '' }
  },
  
  // Autenticación con Google
  googleId: {
    type: String,
    default: null,
    sparse: true
  },
  
  // Sistema de puntos
  puntos: {
    actuales: { type: Number, default: 0 },
    totalesGanados: { type: Number, default: 0 },
    totalesCanjeados: { type: Number, default: 0 }
  },
  
  // Estadísticas de uso
  estadisticas: {
    totalReservas: { type: Number, default: 0 },
    reservasCompletadas: { type: Number, default: 0 },
    reservasCanceladas: { type: Number, default: 0 },
    horasTotales: { type: Number, default: 0 },
    dineroGastado: { type: Number, default: 0 },
    cybercafeFavorito: { type: String, default: null },
    ultimaReserva: { type: Date, default: null }
  },
  
  // Preferencias
  preferencias: {
    notificaciones: { type: Boolean, default: true },
    recordatorios: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
    cybercafePreferido: { type: mongoose.Schema.Types.ObjectId, ref: 'Cybercafe', default: null }
  },
  
  // Descuentos y promociones activas
  descuentos: [{
    codigo: { type: String },
    porcentaje: { type: Number },
    expira: { type: Date },
    usado: { type: Boolean, default: false }
  }],
  
  // Estado de la cuenta
  estado: {
    activo: { type: Boolean, default: true },
    verificado: { type: Boolean, default: false },
    fechaVerificacion: { type: Date, default: null },
    suspendido: { type: Boolean, default: false },
    motivoSuspension: { type: String, default: '' }
  },
  
  // Tokens de recuperación/verificación
  tokens: {
    verificacion: { type: String, default: null },
    recuperacion: { type: String, default: null },
    expiracionRecuperacion: { type: Date, default: null }
  }
  
}, {
  timestamps: true
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ 'puntos.actuales': -1 });

// Virtual para nombre completo
userSchema.pre('save', function(next) {
  if (this.perfil.nombre && this.perfil.apellido) {
    this.perfil.nombreCompleto = `${this.perfil.nombre} ${this.perfil.apellido}`;
  }
  next();
});

/**
 * Obtener nivel actual basado en puntos
 */
userSchema.methods.getNivel = function() {
  const puntos = this.puntos.actuales;
  
  for (const [key, nivel] of Object.entries(NIVELES)) {
    if (puntos >= nivel.min && puntos <= nivel.max) {
      return {
        codigo: key,
        ...nivel,
        puntosActuales: puntos,
        puntosParaSiguiente: nivel.max === Infinity ? null : nivel.max - puntos + 1
      };
    }
  }
  
  return NIVELES.BRONCE;
};

/**
 * Agregar puntos al usuario
 */
userSchema.methods.agregarPuntos = async function(cantidad, motivo = 'Reserva') {
  this.puntos.actuales += cantidad;
  this.puntos.totalesGanados += cantidad;
  
  await this.save();
  return this.puntos.actuales;
};

/**
 * Canjear puntos
 */
userSchema.methods.canjearPuntos = async function(cantidad) {
  if (cantidad > this.puntos.actuales) {
    throw new Error('Puntos insuficientes');
  }
  
  this.puntos.actuales -= cantidad;
  this.puntos.totalesCanjeados += cantidad;
  
  await this.save();
  return this.puntos.actuales;
};

/**
 * Actualizar estadísticas después de una reserva
 */
userSchema.methods.registrarReserva = async function(reserva, completada = false) {
  this.estadisticas.totalReservas += 1;
  
  if (completada) {
    this.estadisticas.reservasCompletadas += 1;
    this.estadisticas.horasTotales += reserva.duracion.minutos / 60;
    this.estadisticas.dineroGastado += reserva.precio.total;
  }
  
  this.estadisticas.ultimaReserva = new Date();
  
  await this.save();
  return this;
};

// Exportar modelo y niveles
module.exports = mongoose.model('User', userSchema);
module.exports.NIVELES = NIVELES;
