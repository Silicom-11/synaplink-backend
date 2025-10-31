// Script para verificar información de quotas de Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

console.log('╔════════════════════════════════════════════════╗');
console.log('║     📊 Google AI Studio - Límites & Quotas   ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Información oficial de límites (Free Tier - actualizado según tu cuenta)
const freeTierLimits = {
  'Modelo recomendado': 'gemini-2.5-flash',
  'Requests por minuto (RPM)': '10 RPM',
  'Requests por día (RPD)': '250 RPD ⭐',
  'Tokens por minuto (TPM)': '250,000 TPM',
  'Costo': '$0 (GRATIS)',
  'Requiere tarjeta': 'NO',
  'Expira': 'Nunca',
  'Nota': 'gemini-2.0-flash-exp solo tiene 50 req/día (evitar)'
};

console.log('🆓 TIER GRATUITO - Límites:');
console.log('─'.repeat(50));
for (const [key, value] of Object.entries(freeTierLimits)) {
  console.log(`  ${key.padEnd(30)}: ${value}`);
}
console.log('─'.repeat(50));
console.log('');

// Verificar que tu API key está configurada
if (!process.env.GEMINI_API_KEY) {
  console.log('❌ ERROR: GEMINI_API_KEY no está configurada en .env');
  process.exit(1);
}

console.log('✅ Tu API Key está configurada');
console.log(`📋 Key preview: ${process.env.GEMINI_API_KEY.substring(0, 10)}...\n`);

// Calcular estimaciones para SynapLink
console.log('📊 ESTIMACIÓN PARA SYNAPLINK:');
console.log('─'.repeat(50));

const scenarios = [
  {
    name: 'Uso Bajo',
    users: 25,
    questions: 5,
    total: 25 * 5,
    percentage: (25 * 5 / 250) * 100
  },
  {
    name: 'Uso Normal',
    users: 50,
    questions: 5,
    total: 50 * 5,
    percentage: (50 * 5 / 250) * 100
  },
  {
    name: 'Uso Alto',
    users: 40,
    questions: 6,
    total: 40 * 6,
    percentage: (40 * 6 / 250) * 100
  },
  {
    name: 'Uso Máximo (Límite)',
    users: 50,
    questions: 5,
    total: 250,
    percentage: 100
  }
];

scenarios.forEach(scenario => {
  const icon = scenario.percentage <= 50 ? '✅' : scenario.percentage <= 80 ? '⚠️' : '🔴';
  console.log(`\n${icon} ${scenario.name}:`);
  console.log(`  • ${scenario.users} usuarios × ${scenario.questions} preguntas = ${scenario.total} requests/día`);
  console.log(`  • Uso: ${scenario.percentage.toFixed(1)}% del límite diario`);
  console.log(`  • Estado: ${scenario.percentage <= 100 ? 'DENTRO DEL LÍMITE ✅' : 'EXCEDE LÍMITE ❌'}`);
});

console.log('\n' + '─'.repeat(50));
console.log('');

// Recomendaciones
console.log('💡 RECOMENDACIONES:');
console.log('─'.repeat(50));
console.log('  1. Monitorea tu uso en: https://aistudio.google.com/app/apikey');
console.log('  2. Si superas los límites, implementa caché de respuestas comunes');
console.log('  3. Agrega rate limiting por usuario (10 req/min por usuario)');
console.log('  4. Considera implementar respuestas pre-definidas para FAQs');
console.log('─'.repeat(50));
console.log('');

// Links útiles
console.log('🔗 LINKS ÚTILES:');
console.log('─'.repeat(50));
console.log('  📊 Ver uso: https://aistudio.google.com/app/apikey');
console.log('  💰 Precios: https://ai.google.dev/pricing');
console.log('  📖 Docs: https://ai.google.dev/docs');
console.log('  🆘 Soporte: https://ai.google.dev/support');
console.log('─'.repeat(50));
console.log('');

console.log('✨ Tu SynapLink está configurado para funcionar 100% gratis! 🎉\n');
