/**
 * 🆔 RUTAS RENIEC - Consulta de DNI
 * Integración con API de APIS.net.pe
 * Uso académico - SynapLink
 */

const express = require('express');
const router = express.Router();

// Token de APIS.net.pe (obtener en https://apis.net.pe/)
// Para uso real, configura RENIEC_TOKEN en las variables de entorno de Render
const RENIEC_TOKEN = process.env.RENIEC_TOKEN || 'sk_12151.VhxYe52YZ3nld4pEdEmT9hCDBeYUIgDp';

// Datos de prueba para demostración académica
const DATOS_PRUEBA = {
  '71327445': { nombres: 'MARCO ANTONIO', apellidoPaterno: 'AQUINO', apellidoMaterno: 'CARHUAS' },
  '12345678': { nombres: 'JUAN CARLOS', apellidoPaterno: 'PÉREZ', apellidoMaterno: 'GARCÍA' },
  '87654321': { nombres: 'MARÍA ELENA', apellidoPaterno: 'RODRÍGUEZ', apellidoMaterno: 'LÓPEZ' },
  '11111111': { nombres: 'PEDRO LUIS', apellidoPaterno: 'MARTÍNEZ', apellidoMaterno: 'SILVA' },
};

/**
 * POST /api/reniec/consultar-dni
 * Consulta información de RENIEC por DNI
 */
router.post('/consultar-dni', async (req, res) => {
  try {
    const { dni } = req.body;
    
    // Validar DNI
    if (!dni) {
      return res.status(400).json({
        success: false,
        message: 'El DNI es requerido'
      });
    }
    
    // Validar formato (8 dígitos)
    if (!/^\d{8}$/.test(dni)) {
      return res.status(400).json({
        success: false,
        message: 'El DNI debe tener exactamente 8 dígitos numéricos'
      });
    }
    
    // Si hay token configurado, usar API real
    if (RENIEC_TOKEN) {
      const url = `https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RENIEC_TOKEN}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.nombres) {
        return res.json({
          success: true,
          datos: {
            dni: dni,
            nombres: data.nombres,
            apellidoPaterno: data.apellidoPaterno,
            apellidoMaterno: data.apellidoMaterno,
            nombreCompleto: `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`
          },
          fuente: 'RENIEC (API Real)'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: data.message || 'No se encontraron datos para el DNI ingresado'
        });
      }
    }
    
    // Modo demostración - usar datos de prueba
    const datosPrueba = DATOS_PRUEBA[dni];
    
    if (datosPrueba) {
      return res.json({
        success: true,
        datos: {
          dni: dni,
          nombres: datosPrueba.nombres,
          apellidoPaterno: datosPrueba.apellidoPaterno,
          apellidoMaterno: datosPrueba.apellidoMaterno,
          nombreCompleto: `${datosPrueba.nombres} ${datosPrueba.apellidoPaterno} ${datosPrueba.apellidoMaterno}`
        },
        fuente: 'Datos de Prueba (Académico)',
        nota: 'Para usar datos reales, configura RENIEC_TOKEN en las variables de entorno'
      });
    }
    
    // DNI no encontrado en datos de prueba
    return res.status(404).json({
      success: false,
      message: '📚 Modo Demo: DNI no encontrado. Prueba con: 71327445, 12345678, 87654321 u 11111111',
      modoPrueba: true
    });
    
  } catch (error) {
    console.error('Error consultando RENIEC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar el servicio de RENIEC',
      error: error.message
    });
  }
});

/**
 * GET /api/reniec/info
 * Información sobre el servicio
 */
router.get('/info', (req, res) => {
  res.json({
    servicio: 'Consulta DNI RENIEC',
    descripcion: 'API de consulta de datos personales por DNI',
    fuente: 'APIS.net.pe',
    uso: 'Académico',
    endpoints: {
      consultar: 'POST /api/reniec/consultar-dni',
      body: { dni: '12345678' }
    }
  });
});

module.exports = router;
