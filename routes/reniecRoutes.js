/**
 * 🆔 RUTAS RENIEC - Consulta de DNI
 * Integración con API de APIS.net.pe
 * Uso académico - SynapLink
 */

const express = require('express');
const router = express.Router();

// Token de APIS.net.pe (obtener en https://apis.net.pe/)
const RENIEC_TOKEN = process.env.RENIEC_TOKEN || 'apis-token-14255.pS0U1VtE5oHuWwi39cqkgaslKJ6rnXLB';

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
    
    // Consultar API de RENIEC
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
      // Éxito - datos encontrados
      res.json({
        success: true,
        datos: {
          dni: dni,
          nombres: data.nombres,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          nombreCompleto: `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`
        }
      });
    } else {
      // No se encontraron datos
      res.status(404).json({
        success: false,
        message: data.message || 'No se encontraron datos para el DNI ingresado'
      });
    }
    
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
