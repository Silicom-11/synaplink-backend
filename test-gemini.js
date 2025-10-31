// Script de verificación para probar que la migración funcionó correctamente

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiAPI() {
  console.log('🧪 Iniciando prueba de Gemini API...\n');

  // Verificar que la API key existe
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY no está definida en .env');
    console.log('📝 Por favor agrega tu API key en el archivo .env');
    process.exit(1);
  }

  console.log('✅ GEMINI_API_KEY encontrada en .env');
  console.log(`📋 Key preview: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);
  console.log('');

  try {
    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ GoogleGenerativeAI inicializado correctamente');

    // Configurar modelo - usando gemini-2.5-flash (mejor límite: 250 req/día)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    console.log('✅ Modelo gemini-2.5-flash configurado');
    console.log('');

    // Enviar mensaje de prueba
    console.log('📤 Enviando mensaje de prueba...');
    const result = await model.generateContent('Di "Hola, SynapLink funciona correctamente" en una línea');
    const response = await result.response;
    const text = response.text();

    console.log('');
    console.log('📨 Respuesta recibida:');
    console.log('─'.repeat(50));
    console.log(text);
    console.log('─'.repeat(50));
    console.log('');

    // Verificaciones
    console.log('✅ PRUEBA EXITOSA - La migración funcionó correctamente!');
    console.log('');
    console.log('🎉 Próximos pasos:');
    console.log('   1. Actualiza esta misma API key en Render (variables de entorno)');
    console.log('   2. Reinicia el servicio en Render');
    console.log('   3. Prueba el chatbot desde tu app móvil y web');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ERROR AL PROBAR LA API:');
    console.error('─'.repeat(50));
    console.error('Tipo:', error.constructor.name);
    console.error('Mensaje:', error.message);
    if (error.status) {
      console.error('Status:', error.status);
    }
    console.error('─'.repeat(50));
    console.error('');

    // Mensajes de ayuda según el error
    if (error.message.includes('API key not valid')) {
      console.log('💡 SOLUCIÓN:');
      console.log('   - Verifica que copiaste la API key completa de Google AI Studio');
      console.log('   - Debe empezar con "AIza..."');
      console.log('   - No debe tener espacios al inicio o final');
      console.log('   - Obtén una nueva en: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('quota') || error.message.includes('429')) {
      console.log('💡 SOLUCIÓN:');
      console.log('   - Has alcanzado el límite de requests (60/min o 1500/día)');
      console.log('   - Espera unos minutos e intenta de nuevo');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      console.log('💡 SOLUCIÓN:');
      console.log('   - Verifica tu conexión a internet');
      console.log('   - Intenta de nuevo en unos segundos');
    }

    console.log('');
    process.exit(1);
  }
}

// Ejecutar prueba
console.log('╔════════════════════════════════════════════════╗');
console.log('║  🧪 Test de Migración Google AI Studio       ║');
console.log('║     SynapLink Backend                         ║');
console.log('╚════════════════════════════════════════════════╝');
console.log('');

testGeminiAPI();
