// routes/reservasRoutes.js
const express = require('express');
const router = express.Router();
const Cabina = require('../models/Cabina');
const Reserva = require('../models/Reserva');
const User = require('../models/User');

// Inicializar cabinas (solo ejecutar una vez)
router.post('/inicializar-cabinas', async (req, res) => {
  try {
    // Verificar si ya existen cabinas
    const cabinasExistentes = await Cabina.countDocuments();
    if (cabinasExistentes > 0) {
      return res.json({ message: 'Las cabinas ya están inicializadas', cabinas: cabinasExistentes });
    }

    // Crear 8 cabinas por defecto
    const cabinasData = [];
    for (let i = 1; i <= 8; i++) {
      cabinasData.push({
        numero: i,
        estado: 'Libre',
        cybercafe: 'Silicom Lan Center'
      });
    }

    await Cabina.insertMany(cabinasData);
    res.json({ message: 'Cabinas inicializadas correctamente', total: 8 });
  } catch (error) {
    console.error('Error al inicializar cabinas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener estado de todas las cabinas
router.get('/cabinas', async (req, res) => {
  try {
    // Verificar y actualizar cabinas expiradas antes de devolver el estado
    const cabinas = await Cabina.find().sort({ numero: 1 });
    
    // Verificar expiraciones
    await Promise.all(cabinas.map(cabina => cabina.verificarExpiracion()));
    
    // Obtener cabinas actualizadas
    const cabinasActualizadas = await Cabina.find().sort({ numero: 1 }).populate('reservadoPor', 'username firstName');
    
    res.json({
      success: true,
      cabinas: cabinasActualizadas
    });
  } catch (error) {
    console.error('Error al obtener cabinas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener cabinas disponibles (solo libres)
router.get('/cabinas-disponibles', async (req, res) => {
  try {
    const cabinasLibres = await Cabina.find({ estado: 'Libre' }).sort({ numero: 1 });
    res.json({
      success: true,
      disponibles: cabinasLibres.length,
      cabinas: cabinasLibres
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reservar cabinas temporalmente (mientras se procesa el pago)
router.post('/reservar-temporal', async (req, res) => {
  try {
    const { userId, cabinas, fechaInicio, fechaFin, precio } = req.body;
    
    // Verificar que el usuario existe
    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que las cabinas estén disponibles
    const cabinasDisponibles = await Cabina.find({ 
      numero: { $in: cabinas },
      estado: 'Libre' 
    });

    if (cabinasDisponibles.length !== cabinas.length) {
      return res.status(400).json({ 
        error: 'Una o más cabinas ya no están disponibles',
        disponibles: cabinasDisponibles.map(c => c.numero)
      });
    }

    // Reservar temporalmente las cabinas
    await Cabina.updateMany(
      { numero: { $in: cabinas } },
      { 
        estado: 'Reservado',
        reservadoPor: userId,
        horaInicio: new Date(fechaInicio),
        horaFin: new Date(fechaFin)
      }
    );

    res.json({
      success: true,
      message: 'Cabinas reservadas temporalmente',
      cabinasReservadas: cabinas
    });
  } catch (error) {
    console.error('Error al reservar cabinas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear reserva completa (después del pago)
router.post('/crear-reserva', async (req, res) => {
  try {
    const { 
      userId, 
      cabinas, 
      fechaInicio, 
      fechaFin, 
      precio, 
      duracionMinutos,
      codigoQR,
      transaccionId 
    } = req.body;

    // Calcular puntos
    const puntosBase = {
      'S/1': 1, 'S/2': 2, 'S/5': 6, 'S/10': 12
    };
    const puntosGanados = puntosBase[precio] * cabinas.length;

    // Crear la reserva
    const nuevaReserva = new Reserva({
      usuario: userId,
      cabinas,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      precio,
      duracionMinutos,
      puntosGanados,
      estado: 'Pagado',
      codigoQR,
      transaccionId
    });

    await nuevaReserva.save();

    // Actualizar estado de cabinas a 'Ocupado'
    await Cabina.updateMany(
      { numero: { $in: cabinas } },
      { estado: 'Ocupado' }
    );

    // Actualizar puntos del usuario
    await User.findByIdAndUpdate(userId, { 
      $inc: { puntos: puntosGanados }
    });

    res.json({
      success: true,
      reserva: nuevaReserva,
      message: 'Reserva creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener reservas del usuario
router.get('/mis-reservas/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reservas = await Reserva.find({ usuario: userId })
      .populate('usuario', 'username firstName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reservas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liberar cabinas (cuando termina la reserva)
router.post('/liberar-cabinas', async (req, res) => {
  try {
    const { cabinas } = req.body;
    
    await Cabina.updateMany(
      { numero: { $in: cabinas } },
      { 
        estado: 'Libre',
        reservadoPor: null,
        horaInicio: null,
        horaFin: null
      }
    );

    res.json({
      success: true,
      message: 'Cabinas liberadas correctamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Limpiar y reinicializar cabinas (solo para desarrollo)
router.post('/limpiar-cabinas', async (req, res) => {
  try {
    // Eliminar todas las cabinas
    const deleted = await Cabina.deleteMany({});
    console.log(`🗑️ Eliminadas ${deleted.deletedCount} cabinas`);

    // Crear 8 cabinas limpias
    const cabinasData = [];
    for (let i = 1; i <= 8; i++) {
      cabinasData.push({
        numero: i,
        estado: 'Libre',
        cybercafe: 'Silicom Lan Center'
      });
    }

    const nuevasCabinas = await Cabina.insertMany(cabinasData);
    res.json({ 
      message: 'Base de datos limpiada y reinicializada', 
      eliminadas: deleted.deletedCount,
      creadas: nuevasCabinas.length 
    });
  } catch (error) {
    console.error('Error al limpiar cabinas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;