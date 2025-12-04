/**
 * 🎮 RUTAS DE RESERVAS - Sistema Completo SynapLink
 * 
 * Endpoints para gestión de reservas, cabinas y cybercafés
 * Creado por Marc Aquino - Silicom 2025
 */

const express = require('express');
const router = express.Router();
const Cabina = require('../models/Cabina');
const Reserva = require('../models/Reserva');
const { PLANES_PRECIO } = require('../models/Reserva');
const Cybercafe = require('../models/Cybercafe');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════
// 🏢 CYBERCAFÉS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/reservas/cybercafes
 * Obtener todos los cybercafés activos
 */
router.get('/cybercafes', async (req, res) => {
  try {
    const cybercafes = await Cybercafe.find({ activo: true })
      .select('-__v')
      .sort({ 'rating.promedio': -1 });
    
    // Para cada cybercafé, contar cabinas libres
    const cybercafesConDisponibilidad = await Promise.all(
      cybercafes.map(async (cafe) => {
        const cabinasLibres = await Cabina.countDocuments({
          cybercafe: cafe._id,
          estado: 'Libre',
          operativa: true
        });
        
        const totalCabinas = await Cabina.countDocuments({
          cybercafe: cafe._id,
          operativa: true
        });
        
        return {
          ...cafe.toObject(),
          cabinasDisponibles: cabinasLibres,
          totalCabinas: totalCabinas,
          estaAbierto: cafe.estaAbierto()
        };
      })
    );
    
    res.json({
      success: true,
      cybercafes: cybercafesConDisponibilidad
    });
  } catch (error) {
    console.error('Error al obtener cybercafés:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reservas/inicializar-cybercafes
 * Crear los cybercafés iniciales (ejecutar una vez)
 */
router.post('/inicializar-cybercafes', async (req, res) => {
  try {
    const existentes = await Cybercafe.countDocuments();
    if (existentes > 0) {
      return res.json({ 
        message: 'Los cybercafés ya están inicializados',
        total: existentes
      });
    }
    
    const cybercafes = [
      {
        slug: 'silicom-lan-center',
        nombre: 'Silicom Lan Center',
        descripcion: 'El mejor cybercafé gaming de Huancayo. PCs de alta gama para la mejor experiencia.',
        direccion: {
          calle: 'Av. Real 1234',
          distrito: 'Huancayo',
          ciudad: 'Huancayo',
          region: 'Junín',
          referencia: 'Frente al parque central'
        },
        totalCabinas: 8,
        specs: {
          procesador: 'Intel Core i7-12700K',
          gpu: 'NVIDIA RTX 3070',
          ram: '32GB DDR5',
          monitor: '27" 165Hz IPS',
          perifericos: 'Teclado mecánico RGB + Mouse Logitech G502'
        },
        servicios: ['wifi', 'snacks', 'bebidas', 'aire_acondicionado'],
        contacto: {
          telefono: '064-123456',
          whatsapp: '951234567'
        }
      },
      {
        slug: 'linux-cybercafe',
        nombre: 'Linux Cybercafé',
        descripcion: 'Ambiente tranquilo para trabajo y estudio. Ideal para programadores.',
        direccion: {
          calle: 'Jr. Tecnología 456',
          distrito: 'El Tambo',
          ciudad: 'Huancayo',
          region: 'Junín',
          referencia: 'A una cuadra de la plaza'
        },
        totalCabinas: 6,
        specs: {
          procesador: 'AMD Ryzen 5 5600X',
          gpu: 'NVIDIA GTX 1660 Super',
          ram: '16GB DDR4',
          monitor: '24" 144Hz',
          perifericos: 'Teclado y mouse estándar'
        },
        servicios: ['wifi', 'impresion', 'escaneo', 'snacks'],
        contacto: {
          whatsapp: '952345678'
        }
      },
      {
        slug: 'shadowlan',
        nombre: 'ShadowLAN',
        descripcion: '¡El templo gamer! Torneos semanales y las mejores specs de la ciudad.',
        direccion: {
          calle: 'Av. Gamer Pro 789',
          distrito: 'Chilca',
          ciudad: 'Huancayo',
          region: 'Junín',
          referencia: 'Centro comercial Gamer Zone'
        },
        totalCabinas: 10,
        specs: {
          procesador: 'Intel Core i9-13900K',
          gpu: 'NVIDIA RTX 4080',
          ram: '64GB DDR5',
          monitor: '32" 240Hz OLED',
          perifericos: 'Setup profesional esports'
        },
        servicios: ['wifi', 'snacks', 'bebidas', 'aire_acondicionado', 'estacionamiento'],
        contacto: {
          whatsapp: '953456789'
        }
      }
    ];
    
    const creados = await Cybercafe.insertMany(cybercafes);
    
    // Crear cabinas para cada cybercafé
    for (const cafe of creados) {
      const cabinasData = [];
      for (let i = 1; i <= cafe.totalCabinas; i++) {
        cabinasData.push({
          numero: i,
          cybercafe: cafe._id,
          cybercafeSlug: cafe.slug,
          estado: 'Libre',
          ubicacion: {
            fila: Math.ceil(i / 4),
            columna: ((i - 1) % 4) + 1
          }
        });
      }
      await Cabina.insertMany(cabinasData);
    }
    
    res.json({
      success: true,
      message: 'Cybercafés y cabinas inicializados',
      cybercafes: creados.length,
      cabinasCreadas: creados.reduce((acc, c) => acc + c.totalCabinas, 0)
    });
  } catch (error) {
    console.error('Error al inicializar:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// 🖥️ CABINAS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/reservas/cabinas
 * Obtener todas las cabinas (con filtro opcional por cybercafé)
 */
router.get('/cabinas', async (req, res) => {
  try {
    const { cybercafe } = req.query;
    
    let filtro = { operativa: true };
    if (cybercafe) {
      filtro.cybercafeSlug = cybercafe;
    }
    
    // Primero verificar expiraciones
    const cabinas = await Cabina.find(filtro).sort({ numero: 1 });
    
    // Verificar expiraciones en paralelo
    await Promise.all(cabinas.map(c => c.verificarExpiracion()));
    
    // Obtener cabinas actualizadas con datos poblados
    const cabinasActualizadas = await Cabina.find(filtro)
      .populate('usuarioActual', 'username perfil.nombre')
      .populate('cybercafe', 'nombre slug')
      .sort({ numero: 1 });
    
    // Formatear respuesta (compatible con app anterior)
    const cabinasFormateadas = cabinasActualizadas.map(c => ({
      _id: c._id,
      numero: c.numero,
      estado: c.estado === 'Reservada' ? 'Reservado' : c.estado, // Compatibilidad
      cybercafe: c.cybercafe?.nombre || 'Silicom Lan Center',
      cybercafeSlug: c.cybercafeSlug,
      horaInicio: c.sesionActual?.inicio,
      horaFin: c.sesionActual?.fin,
      tiempoRestante: c.tiempoRestante ? c.tiempoRestante() : 0,
      reservadoPor: c.usuarioActual ? c.usuarioActual._id : null
    }));
    
    res.json({
      success: true,
      cabinas: cabinasFormateadas,
      total: cabinasFormateadas.length,
      libres: cabinasFormateadas.filter(c => c.estado === 'Libre').length
    });
  } catch (error) {
    console.error('Error al obtener cabinas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reservas/cabinas/:cybercafeSlug
 * Obtener cabinas de un cybercafé específico
 */
router.get('/cabinas/:cybercafeSlug', async (req, res) => {
  try {
    const { cybercafeSlug } = req.params;
    
    const cabinas = await Cabina.find({ 
      cybercafeSlug,
      operativa: true 
    }).sort({ numero: 1 });
    
    // Verificar expiraciones
    await Promise.all(cabinas.map(c => c.verificarExpiracion()));
    
    // Obtener actualizadas
    const cabinasActualizadas = await Cabina.find({ 
      cybercafeSlug,
      operativa: true 
    })
      .populate('usuarioActual', 'username perfil.nombre')
      .sort({ numero: 1 });
    
    const cybercafe = await Cybercafe.findOne({ slug: cybercafeSlug });
    
    res.json({
      success: true,
      cybercafe: cybercafe ? {
        nombre: cybercafe.nombre,
        slug: cybercafe.slug,
        direccion: cybercafe.direccion,
        specs: cybercafe.specs,
        estaAbierto: cybercafe.estaAbierto()
      } : null,
      cabinas: cabinasActualizadas.map(c => ({
        _id: c._id,
        numero: c.numero,
        estado: c.estado,
        horaInicio: c.sesionActual?.inicio,
        horaFin: c.sesionActual?.fin,
        tiempoRestante: c.tiempoRestante ? c.tiempoRestante() : 0
      })),
      resumen: {
        total: cabinasActualizadas.length,
        libres: cabinasActualizadas.filter(c => c.estado === 'Libre').length,
        ocupadas: cabinasActualizadas.filter(c => c.estado === 'Ocupada' || c.estado === 'Reservada').length
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reservas/cabinas-disponibles
 * Obtener cabinas libres (compatibilidad)
 */
router.get('/cabinas-disponibles', async (req, res) => {
  try {
    const cabinasLibres = await Cabina.find({ 
      estado: 'Libre',
      operativa: true 
    }).sort({ numero: 1 });
    
    res.json({
      success: true,
      disponibles: cabinasLibres.length,
      cabinas: cabinasLibres.map(c => ({
        _id: c._id,
        numero: c.numero,
        estado: c.estado,
        cybercafe: c.cybercafeSlug
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// 📋 RESERVAS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/reservas/planes
 * Obtener planes de precios disponibles
 */
router.get('/planes', (req, res) => {
  const planes = Object.entries(PLANES_PRECIO).map(([precio, info]) => ({
    precio,
    precioNumero: parseInt(precio.replace('S/', '')),
    ...info
  }));
  
  res.json({
    success: true,
    planes,
    metodosPago: ['Yape', 'Plin', 'Efectivo']
  });
});

/**
 * POST /api/reservas/crear
 * Crear una nueva reserva (NUEVO ENDPOINT)
 */
router.post('/crear', authMiddleware, async (req, res) => {
  try {
    const { 
      userId, 
      cabinas,           // Array de números de cabina [1, 2, 3]
      cybercafeSlug = 'silicom-lan-center',
      plan,              // "S/1", "S/2", "S/5"
      metodoPago = 'Yape'
    } = req.body;
    
    // Validaciones
    if (!userId || !cabinas || !cabinas.length || !plan) {
      return res.status(400).json({
        error: 'Faltan datos requeridos',
        requeridos: ['userId', 'cabinas', 'plan']
      });
    }
    
    // Validar plan
    const planInfo = PLANES_PRECIO[plan];
    if (!planInfo) {
      return res.status(400).json({
        error: 'Plan no válido',
        planesDisponibles: Object.keys(PLANES_PRECIO)
      });
    }
    
    // Obtener o crear cybercafé default
    let cybercafe = await Cybercafe.findOne({ slug: cybercafeSlug });
    
    // Si no existe, crear datos básicos
    if (!cybercafe) {
      // Buscar cualquier cybercafe existente
      cybercafe = await Cybercafe.findOne({});
    }
    
    // Verificar usuario
    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Buscar cabinas por número
    let cabinasDB;
    if (cybercafe) {
      cabinasDB = await Cabina.find({
        cybercafe: cybercafe._id,
        numero: { $in: cabinas },
        estado: 'Libre',
        operativa: true
      });
    } else {
      // Fallback: buscar por número solo
      cabinasDB = await Cabina.find({
        numero: { $in: cabinas },
        estado: 'Libre'
      });
    }
    
    if (cabinasDB.length !== cabinas.length) {
      const disponibles = cabinasDB.map(c => c.numero);
      const noDisponibles = cabinas.filter(n => !disponibles.includes(n));
      
      return res.status(400).json({
        error: 'Algunas cabinas no están disponibles',
        solicitadas: cabinas,
        disponibles,
        noDisponibles
      });
    }
    
    // Calcular horarios
    const ahora = new Date();
    const horaFin = new Date(ahora.getTime() + planInfo.duracionMinutos * 60000);
    
    // Calcular precios y puntos
    const cantidadCabinas = cabinas.length;
    const precioUnitario = parseInt(plan.replace('S/', ''));
    const precioTotal = precioUnitario * cantidadCabinas;
    const puntosBase = planInfo.puntosBase;
    const puntosTotal = puntosBase * cantidadCabinas;
    
    // Crear la reserva
    const nuevaReserva = new Reserva({
      usuario: userId,
      cybercafe: cybercafe?._id,
      cybercafeSlug: cybercafe?.slug || 'silicom-lan-center',
      cybercafeNombre: cybercafe?.nombre || 'Silicom Lan Center',
      cabinas: cabinasDB.map(c => ({
        numero: c.numero,
        cabinaId: c._id
      })),
      cantidadCabinas,
      plan,
      precio: {
        unitario: precioUnitario,
        total: precioTotal
      },
      duracion: {
        minutos: planInfo.duracionMinutos,
        texto: planInfo.duracionMinutos >= 60 
          ? `${planInfo.duracionMinutos / 60} hora${planInfo.duracionMinutos >= 120 ? 's' : ''}`
          : `${planInfo.duracionMinutos} min`
      },
      horario: {
        inicio: ahora,
        fin: horaFin
      },
      puntos: {
        base: puntosBase,
        porCabina: puntosTotal,
        bonus: 0,
        total: puntosTotal,
        otorgados: true
      },
      beneficio: {
        descripcion: planInfo.beneficio,
        emoji: planInfo.beneficioEmoji
      },
      estado: 'Activa',
      pago: {
        metodo: metodoPago,
        confirmado: true,
        fechaPago: ahora
      }
    });
    
    await nuevaReserva.save();
    
    // Actualizar estado de las cabinas
    for (const cabina of cabinasDB) {
      cabina.estado = 'Reservada';
      cabina.reservaActiva = nuevaReserva._id;
      cabina.usuarioActual = userId;
      cabina.sesionActual = {
        inicio: ahora,
        fin: horaFin
      };
      cabina.estadisticas.totalReservas += 1;
      await cabina.save();
    }
    
    // Agregar puntos al usuario
    if (usuario.puntos && typeof usuario.puntos.actuales === 'number') {
      usuario.puntos.actuales += puntosTotal;
      usuario.puntos.totalesGanados += puntosTotal;
    } else {
      // Compatibilidad con modelo antiguo
      usuario.points = (usuario.points || 0) + puntosTotal;
    }
    await usuario.save();
    
    res.json({
      success: true,
      message: '¡Reserva creada exitosamente!',
      reserva: {
        codigo: nuevaReserva.codigo,
        cabinas: cabinas,
        cybercafe: cybercafe?.nombre || 'Silicom Lan Center',
        plan,
        duracion: nuevaReserva.duracion.texto,
        horario: {
          inicio: ahora,
          fin: horaFin
        },
        precio: {
          unitario: precioUnitario,
          total: precioTotal,
          moneda: 'S/'
        },
        puntos: {
          ganados: puntosTotal
        },
        beneficio: planInfo.beneficio
      },
      cabinasReservadas: cabinas
    });
    
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reservas/reservar-temporal
 * Endpoint de COMPATIBILIDAD con app anterior
 */
router.post('/reservar-temporal', authMiddleware, async (req, res) => {
  try {
    const { userId, cabinas, precio, duracionMinutos, fechaInicio, fechaFin } = req.body;
    
    // Mapear precio a plan
    const mapeoPrecios = {
      'S/1': 'S/1',
      'S/2': 'S/2', 
      'S/5': 'S/5',
      'S/10': 'S/5'
    };
    
    const plan = mapeoPrecios[precio] || 'S/2';
    const planInfo = PLANES_PRECIO[plan];
    
    // Verificar usuario
    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Buscar cabinas
    let cabinasDB = await Cabina.find({
      numero: { $in: cabinas },
      estado: 'Libre'
    });
    
    // Si no hay cabinas en el nuevo modelo, buscar en formato legacy o crearlas
    if (cabinasDB.length === 0) {
      // Crear cabinas básicas si no existen
      for (const num of cabinas) {
        let cabina = await Cabina.findOne({ numero: num });
        if (!cabina) {
          cabina = new Cabina({
            numero: num,
            cybercafeSlug: 'silicom-lan-center',
            estado: 'Libre',
            operativa: true
          });
          await cabina.save();
        }
        if (cabina.estado === 'Libre') {
          cabinasDB.push(cabina);
        }
      }
    }
    
    if (cabinasDB.length !== cabinas.length) {
      return res.status(400).json({
        error: 'Una o más cabinas ya no están disponibles',
        disponibles: cabinasDB.map(c => c.numero)
      });
    }
    
    // Calcular horarios
    const ahora = fechaInicio ? new Date(fechaInicio) : new Date();
    const horaFin = fechaFin ? new Date(fechaFin) : new Date(ahora.getTime() + (duracionMinutos || planInfo.duracionMinutos) * 60000);
    
    // Calcular puntos
    const puntosGanados = planInfo.puntosBase * cabinas.length;
    
    // Actualizar cabinas
    for (const cabina of cabinasDB) {
      cabina.estado = 'Reservada';
      cabina.usuarioActual = userId;
      cabina.sesionActual = {
        inicio: ahora,
        fin: horaFin
      };
      await cabina.save();
    }
    
    // Actualizar puntos del usuario
    if (usuario.puntos && typeof usuario.puntos.actuales === 'number') {
      usuario.puntos.actuales += puntosGanados;
    } else {
      usuario.points = (usuario.points || 0) + puntosGanados;
    }
    await usuario.save();
    
    res.json({
      success: true,
      message: 'Reserva creada exitosamente',
      reserva: {
        cabinas,
        horaInicio: ahora,
        horaFin,
        precio: plan,
        puntosGanados
      },
      cabinasReservadas: cabinas
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reservas/mis-reservas/:userId
 * Obtener reservas del usuario
 */
router.get('/mis-reservas/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reservas = await Reserva.find({ usuario: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Verificar si alguna reserva activa expiró
    for (const reserva of reservas) {
      if (reserva.haExpirado && reserva.haExpirado()) {
        reserva.estado = 'Completada';
        await reserva.save();
        
        // Liberar cabinas
        if (reserva.cabinas && reserva.cabinas.length > 0) {
          const cabinasIds = reserva.cabinas.map(c => c.cabinaId).filter(id => id);
          if (cabinasIds.length > 0) {
            await Cabina.updateMany(
              { _id: { $in: cabinasIds } },
              {
                estado: 'Libre',
                reservaActiva: null,
                usuarioActual: null,
                'sesionActual.inicio': null,
                'sesionActual.fin': null
              }
            );
          }
        }
      }
    }
    
    res.json({
      success: true,
      reservas
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reservas/liberar-cabinas
 * Liberar cabinas (compatibilidad)
 */
router.post('/liberar-cabinas', authMiddleware, async (req, res) => {
  try {
    const { cabinas } = req.body;
    
    await Cabina.updateMany(
      { numero: { $in: cabinas } },
      {
        estado: 'Libre',
        reservaActiva: null,
        usuarioActual: null,
        'sesionActual.inicio': null,
        'sesionActual.fin': null
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

// ═══════════════════════════════════════════════════════════
// 🔧 UTILIDADES / ADMIN
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/reservas/limpiar-expiradas
 * Limpiar reservas expiradas
 */
router.post('/limpiar-expiradas', async (req, res) => {
  try {
    const ahora = new Date();
    
    // Actualizar cabinas expiradas
    const resultado = await Cabina.updateMany(
      {
        'sesionActual.fin': { $lt: ahora },
        estado: { $in: ['Reservada', 'Ocupada'] }
      },
      {
        estado: 'Libre',
        reservaActiva: null,
        usuarioActual: null,
        'sesionActual.inicio': null,
        'sesionActual.fin': null
      }
    );
    
    res.json({
      success: true,
      message: 'Limpieza completada',
      cabinasLiberadas: resultado.modifiedCount
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reservas/inicializar-cabinas
 * Inicializar cabinas (compatibilidad)
 */
router.post('/inicializar-cabinas', async (req, res) => {
  try {
    const existentes = await Cabina.countDocuments();
    if (existentes > 0) {
      return res.json({ 
        message: 'Las cabinas ya están inicializadas', 
        cabinas: existentes 
      });
    }
    
    // Crear 8 cabinas básicas
    const cabinasData = [];
    for (let i = 1; i <= 8; i++) {
      cabinasData.push({
        numero: i,
        cybercafeSlug: 'silicom-lan-center',
        estado: 'Libre',
        operativa: true,
        ubicacion: {
          fila: Math.ceil(i / 4),
          columna: ((i - 1) % 4) + 1
        }
      });
    }
    
    await Cabina.insertMany(cabinasData);
    res.json({ 
      message: 'Cabinas inicializadas correctamente', 
      total: 8 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reservas/limpiar-cabinas
 * Limpiar y reinicializar cabinas
 */
router.post('/limpiar-cabinas', async (req, res) => {
  try {
    await Cabina.deleteMany({});
    
    const cabinasData = [];
    for (let i = 1; i <= 8; i++) {
      cabinasData.push({
        numero: i,
        cybercafeSlug: 'silicom-lan-center',
        estado: 'Libre',
        operativa: true
      });
    }
    
    await Cabina.insertMany(cabinasData);
    
    res.json({ 
      message: 'Cabinas reinicializadas',
      creadas: 8
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
