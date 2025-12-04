const mongoose = require('mongoose');

/**
 * 📋 MODELO RESERVA - Rediseño Completo
 * 
 * Sistema de reservas profesional con:
 * - Múltiples cabinas por reserva
 * - Sistema de puntos y beneficios
 * - Estados claros del ciclo de vida
 * - Historial completo
 */

// Precios y beneficios del sistema
const PLANES_PRECIO = {
  'S/1': {
    duracionMinutos: 30,
    puntosBase: 1,
    beneficio: '1 snack pequeño',
    beneficioEmoji: '🍪'
  },
  'S/2': {
    duracionMinutos: 60,
    puntosBase: 2,
    beneficio: '1 vaso Pepsi (250ml)',
    beneficioEmoji: '🥤'
  },
  'S/5': {
    duracionMinutos: 180,
    puntosBase: 6,
    beneficio: '1 Pepsi (500ml)',
    beneficioEmoji: '🥤'
  }
};

const reservaSchema = new mongoose.Schema({
  // Código único de reserva (para mostrar al usuario)
  codigo: {
    type: String,
    unique: true,
    uppercase: true
  },
  
  // Usuario que hace la reserva
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Cybercafé donde se hace la reserva
  cybercafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cybercafe',
    required: true
  },
  
  // Slug del cybercafé para consultas rápidas
  cybercafeSlug: {
    type: String,
    required: true
  },
  
  // Nombre del cybercafé (denormalizado para consultas rápidas)
  cybercafeNombre: {
    type: String,
    required: true
  },
  
  // Array de cabinas reservadas (PUEDE SER MÚLTIPLES!)
  cabinas: [{
    numero: { type: Number, required: true },
    cabinaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cabina' }
  }],
  
  // Cantidad de cabinas (calculado)
  cantidadCabinas: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Plan de precio seleccionado
  plan: {
    type: String,
    required: true,
    enum: ['S/1', 'S/2', 'S/5']
  },
  
  // Detalles del precio
  precio: {
    unitario: { type: Number, required: true },  // Precio por cabina
    total: { type: Number, required: true },      // Precio total (unitario * cabinas)
    moneda: { type: String, default: 'PEN' }
  },
  
  // Duración
  duracion: {
    minutos: { type: Number, required: true },
    texto: { type: String }  // ej: "30 min", "1 hora", "3 horas"
  },
  
  // Horarios
  horario: {
    fechaReserva: { type: Date, default: Date.now },  // Cuándo se hizo la reserva
    inicio: { type: Date, required: true },            // Cuándo empieza la sesión
    fin: { type: Date, required: true },               // Cuándo termina la sesión
    inicioReal: { type: Date, default: null },         // Cuándo realmente empezó (check-in)
    finReal: { type: Date, default: null }             // Cuándo realmente terminó
  },
  
  // Sistema de puntos
  puntos: {
    base: { type: Number, required: true },           // Puntos por el plan
    porCabina: { type: Number, required: true },      // base * cantidadCabinas
    bonus: { type: Number, default: 0 },              // Puntos extra (promociones)
    total: { type: Number, required: true },          // porCabina + bonus
    otorgados: { type: Boolean, default: false }      // Si ya se sumaron al usuario
  },
  
  // Beneficios
  beneficio: {
    descripcion: { type: String },
    emoji: { type: String },
    canjeado: { type: Boolean, default: false }
  },
  
  // Estado del ciclo de vida
  estado: {
    type: String,
    enum: [
      'Pendiente',    // Recién creada, esperando confirmación/pago
      'Confirmada',   // Pagada y confirmada, esperando hora de inicio
      'Activa',       // En uso actualmente
      'Completada',   // Terminada exitosamente
      'Cancelada',    // Cancelada por el usuario
      'Expirada',     // No se presentó el usuario
      'Extendida'     // Se extendió el tiempo
    ],
    default: 'Pendiente'
  },
  
  // Historial de cambios de estado
  historialEstados: [{
    estado: { type: String },
    fecha: { type: Date, default: Date.now },
    motivo: { type: String, default: '' }
  }],
  
  // Método de pago
  pago: {
    metodo: {
      type: String,
      enum: ['Yape', 'Plin', 'Efectivo', 'Tarjeta', 'Puntos'],
      default: 'Yape'
    },
    confirmado: { type: Boolean, default: false },
    transaccionId: { type: String, default: null },
    fechaPago: { type: Date, default: null }
  },
  
  // Código QR para check-in
  qr: {
    codigo: { type: String },
    escaneado: { type: Boolean, default: false },
    fechaEscaneo: { type: Date, default: null }
  },
  
  // Extensiones de tiempo
  extensiones: [{
    plan: { type: String },
    duracionMinutos: { type: Number },
    precioAdicional: { type: Number },
    puntosAdicionales: { type: Number },
    fecha: { type: Date, default: Date.now }
  }],
  
  // Notas y comentarios
  notas: {
    usuario: { type: String, default: '' },
    admin: { type: String, default: '' }
  },
  
  // Calificación post-servicio
  calificacion: {
    estrellas: { type: Number, min: 1, max: 5, default: null },
    comentario: { type: String, default: '' },
    fecha: { type: Date, default: null }
  }
  
}, {
  timestamps: true
});

// Índices para consultas eficientes
reservaSchema.index({ usuario: 1, estado: 1 });
reservaSchema.index({ cybercafe: 1, estado: 1 });
reservaSchema.index({ cybercafeSlug: 1, 'horario.inicio': 1 });
reservaSchema.index({ codigo: 1 });
reservaSchema.index({ 'horario.inicio': 1, 'horario.fin': 1 });
reservaSchema.index({ estado: 1, 'horario.fin': 1 });

// Generar código único antes de guardar
reservaSchema.pre('save', async function(next) {
  if (!this.codigo) {
    // Generar código: SL + fecha + random (ej: SL041224A7B3)
    const fecha = new Date();
    const fechaStr = fecha.getDate().toString().padStart(2, '0') +
                     (fecha.getMonth() + 1).toString().padStart(2, '0') +
                     fecha.getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.codigo = `SL${fechaStr}${random}`;
  }
  
  // Agregar estado inicial al historial
  if (this.isNew) {
    this.historialEstados.push({
      estado: this.estado,
      fecha: new Date(),
      motivo: 'Reserva creada'
    });
  }
  
  next();
});

/**
 * Cambiar estado y registrar en historial
 */
reservaSchema.methods.cambiarEstado = async function(nuevoEstado, motivo = '') {
  const estadoAnterior = this.estado;
  this.estado = nuevoEstado;
  
  this.historialEstados.push({
    estado: nuevoEstado,
    fecha: new Date(),
    motivo: motivo || `Cambio de ${estadoAnterior} a ${nuevoEstado}`
  });
  
  await this.save();
  return this;
};

/**
 * Verificar si la reserva está activa en este momento
 */
reservaSchema.methods.estaActiva = function() {
  const ahora = new Date();
  return this.estado === 'Activa' && 
         ahora >= this.horario.inicio && 
         ahora <= this.horario.fin;
};

/**
 * Verificar si la reserva expiró
 */
reservaSchema.methods.haExpirado = function() {
  const ahora = new Date();
  return ahora > this.horario.fin && 
         !['Completada', 'Cancelada', 'Expirada'].includes(this.estado);
};

/**
 * Obtener tiempo restante en minutos
 */
reservaSchema.methods.tiempoRestante = function() {
  if (this.estado !== 'Activa') return 0;
  
  const ahora = new Date();
  const fin = new Date(this.horario.fin);
  const diferencia = fin - ahora;
  
  return Math.max(0, Math.floor(diferencia / (1000 * 60)));
};

/**
 * Calcular puntos totales
 */
reservaSchema.methods.calcularPuntos = function() {
  const planInfo = PLANES_PRECIO[this.plan];
  if (!planInfo) return 0;
  
  return planInfo.puntosBase * this.cantidadCabinas;
};

/**
 * Extender tiempo de la reserva
 */
reservaSchema.methods.extenderTiempo = async function(planExtension) {
  const planInfo = PLANES_PRECIO[planExtension];
  if (!planInfo) throw new Error('Plan de extensión no válido');
  
  // Calcular nueva hora de fin
  const nuevaHoraFin = new Date(this.horario.fin.getTime() + planInfo.duracionMinutos * 60000);
  
  // Registrar extensión
  this.extensiones.push({
    plan: planExtension,
    duracionMinutos: planInfo.duracionMinutos,
    precioAdicional: parseInt(planExtension.replace('S/', '')),
    puntosAdicionales: planInfo.puntosBase * this.cantidadCabinas,
    fecha: new Date()
  });
  
  // Actualizar hora de fin
  this.horario.fin = nuevaHoraFin;
  
  // Actualizar puntos
  this.puntos.total += planInfo.puntosBase * this.cantidadCabinas;
  
  // Cambiar estado a Extendida
  await this.cambiarEstado('Extendida', `Tiempo extendido +${planInfo.duracionMinutos} minutos`);
  
  // Volver a estado Activa para continuar el uso
  this.estado = 'Activa';
  
  await this.save();
  return this;
};

// Exportar el modelo y la configuración de precios
module.exports = mongoose.model('Reserva', reservaSchema);
module.exports.PLANES_PRECIO = PLANES_PRECIO;
