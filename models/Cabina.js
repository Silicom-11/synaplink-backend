const mongoose = require('mongoose');

/**
 * 🖥️ MODELO CABINA - Rediseño Completo
 * 
 * Cada cabina pertenece a un cybercafé y tiene su propio estado.
 * Las reservas se manejan en el modelo Reserva por separado.
 * Aquí solo guardamos el estado ACTUAL de la cabina.
 */
const cabinaSchema = new mongoose.Schema({
  // Número de cabina dentro del cybercafé
  numero: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Referencia al cybercafé (relación) - opcional para compatibilidad
  cybercafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cybercafe',
    default: null
  },
  
  // Slug del cybercafé para consultas rápidas
  cybercafeSlug: {
    type: String,
    default: 'silicom-lan-center'
  },
  
  // Estado actual de la cabina
  estado: {
    type: String,
    enum: ['Libre', 'Ocupada', 'Reservada', 'Mantenimiento', 'Fuera de servicio'],
    default: 'Libre'
  },
  
  // Si está ocupada/reservada, referencia a la reserva activa
  reservaActiva: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reserva',
    default: null
  },
  
  // Usuario que tiene la cabina actualmente
  usuarioActual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Horario de la sesión actual
  sesionActual: {
    inicio: { type: Date, default: null },
    fin: { type: Date, default: null }
  },
  
  // Especificaciones de esta cabina específica (si difiere del general)
  specs: {
    procesador: { type: String, default: null },
    gpu: { type: String, default: null },
    ram: { type: String, default: null },
    monitor: { type: String, default: null },
    extras: [{ type: String }]  // ej: "Silla gamer", "Headset premium"
  },
  
  // Ubicación física dentro del local (para el mapa/croquis)
  ubicacion: {
    fila: { type: Number, default: 1 },
    columna: { type: Number, default: 1 },
    zona: { type: String, default: 'general' }  // ej: "zona_gamer", "zona_trabajo", "zona_vip"
  },
  
  // Estadísticas de uso
  estadisticas: {
    totalReservas: { type: Number, default: 0 },
    horasUso: { type: Number, default: 0 },
    ultimoUso: { type: Date, default: null }
  },
  
  // Estado de funcionamiento
  operativa: {
    type: Boolean,
    default: true
  },
  
  // Notas del administrador
  notas: {
    type: String,
    default: ''
  }
  
}, {
  timestamps: true
});

// Índice compuesto único: número + cybercafé
cabinaSchema.index({ numero: 1, cybercafe: 1 }, { unique: true });
cabinaSchema.index({ cybercafeSlug: 1, estado: 1 });
cabinaSchema.index({ reservaActiva: 1 });

/**
 * Verificar y actualizar estado si la sesión expiró
 */
cabinaSchema.methods.verificarExpiracion = async function() {
  const ahora = new Date();
  
  // Si tiene sesión activa y ya expiró
  if (this.sesionActual.fin && ahora > this.sesionActual.fin) {
    // Si estaba Ocupada o Reservada, liberar
    if (this.estado === 'Ocupada' || this.estado === 'Reservada') {
      this.estado = 'Libre';
      this.reservaActiva = null;
      this.usuarioActual = null;
      this.sesionActual.inicio = null;
      this.sesionActual.fin = null;
      
      // Actualizar estadísticas
      if (this.sesionActual.inicio) {
        const duracionHoras = (this.sesionActual.fin - this.sesionActual.inicio) / (1000 * 60 * 60);
        this.estadisticas.horasUso += duracionHoras;
      }
      this.estadisticas.ultimoUso = ahora;
      
      await this.save();
      return true; // Sí expiró y se liberó
    }
  }
  
  return false; // No expiró o no aplicaba
};

/**
 * Ocupar la cabina con una reserva
 */
cabinaSchema.methods.ocupar = async function(reservaId, usuarioId, horaInicio, horaFin) {
  this.estado = 'Reservada';
  this.reservaActiva = reservaId;
  this.usuarioActual = usuarioId;
  this.sesionActual.inicio = horaInicio;
  this.sesionActual.fin = horaFin;
  this.estadisticas.totalReservas += 1;
  
  await this.save();
  return this;
};

/**
 * Liberar la cabina
 */
cabinaSchema.methods.liberar = async function() {
  const inicio = this.sesionActual.inicio;
  const fin = new Date();
  
  this.estado = 'Libre';
  this.reservaActiva = null;
  this.usuarioActual = null;
  this.sesionActual.inicio = null;
  this.sesionActual.fin = null;
  
  // Actualizar estadísticas
  if (inicio) {
    const duracionHoras = (fin - inicio) / (1000 * 60 * 60);
    this.estadisticas.horasUso += duracionHoras;
  }
  this.estadisticas.ultimoUso = fin;
  
  await this.save();
  return this;
};

/**
 * Obtener tiempo restante en minutos
 */
cabinaSchema.methods.tiempoRestante = function() {
  if (!this.sesionActual.fin) return 0;
  
  const ahora = new Date();
  const fin = new Date(this.sesionActual.fin);
  const diferencia = fin - ahora;
  
  return Math.max(0, Math.floor(diferencia / (1000 * 60)));
};

module.exports = mongoose.model('Cabina', cabinaSchema);
