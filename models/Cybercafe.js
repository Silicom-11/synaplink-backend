const mongoose = require('mongoose');

/**
 * 🏢 MODELO CYBERCAFE
 * Cada cybercafé tiene su propia configuración de cabinas y horarios
 */
const cybercafeSchema = new mongoose.Schema({
  // Identificador único legible
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // Información básica
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  
  descripcion: {
    type: String,
    default: ''
  },
  
  // Ubicación
  direccion: {
    calle: { type: String, required: true },
    distrito: { type: String, required: true },
    ciudad: { type: String, default: 'Huancayo' },
    region: { type: String, default: 'Junín' },
    referencia: { type: String, default: '' },
    coordenadas: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    }
  },
  
  // Configuración de cabinas
  totalCabinas: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  
  // Especificaciones de las PCs (para mostrar al usuario)
  specs: {
    procesador: { type: String, default: 'Intel Core i5' },
    gpu: { type: String, default: 'GTX 1650' },
    ram: { type: String, default: '16GB' },
    monitor: { type: String, default: '24" 144Hz' },
    perifericos: { type: String, default: 'Teclado y mouse gamer' }
  },
  
  // Horarios de atención
  horario: {
    lunesViernes: {
      apertura: { type: String, default: '09:00' },
      cierre: { type: String, default: '23:00' }
    },
    sabado: {
      apertura: { type: String, default: '09:00' },
      cierre: { type: String, default: '23:00' }
    },
    domingo: {
      apertura: { type: String, default: '10:00' },
      cierre: { type: String, default: '22:00' }
    }
  },
  
  // Servicios adicionales
  servicios: [{
    type: String,
    enum: ['wifi', 'impresion', 'escaneo', 'snacks', 'bebidas', 'aire_acondicionado', 'estacionamiento']
  }],
  
  // Contacto
  contacto: {
    telefono: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  
  // Estado del local
  activo: {
    type: Boolean,
    default: true
  },
  
  // Imagen del local
  imagenUrl: {
    type: String,
    default: ''
  },
  
  // Rating promedio (de 1 a 5)
  rating: {
    promedio: { type: Number, default: 5, min: 1, max: 5 },
    totalReseñas: { type: Number, default: 0 }
  }
  
}, {
  timestamps: true
});

// Índices para búsquedas rápidas
cybercafeSchema.index({ slug: 1 });
cybercafeSchema.index({ activo: 1 });
cybercafeSchema.index({ 'direccion.ciudad': 1 });

// Virtual para dirección completa
cybercafeSchema.virtual('direccionCompleta').get(function() {
  return `${this.direccion.calle}, ${this.direccion.distrito}, ${this.direccion.ciudad}`;
});

// Método para verificar si está abierto
cybercafeSchema.methods.estaAbierto = function() {
  const ahora = new Date();
  const dia = ahora.getDay(); // 0 = domingo
  const hora = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');
  
  let horarioDia;
  if (dia === 0) {
    horarioDia = this.horario.domingo;
  } else if (dia === 6) {
    horarioDia = this.horario.sabado;
  } else {
    horarioDia = this.horario.lunesViernes;
  }
  
  return hora >= horarioDia.apertura && hora <= horarioDia.cierre;
};

module.exports = mongoose.model('Cybercafe', cybercafeSchema);
