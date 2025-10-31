// Caché de respuestas frecuentes para ahorrar requests de API
// Esto reduce el uso de Gemini API para preguntas comunes

const FAQ_CACHE = {
  // Preguntas sobre reservas
  'como reservo': '¡Hola! 👋 Para reservar una cabina desde la web:\n\n1. Click en "Cybercafés" en el menú lateral 🎮\n2. Selecciona uno de los tres cybercafés disponibles\n3. Click en "Ver Cabinas Disponibles"\n4. Verás el estado en tiempo real (verde=libre 🟢, rojo=ocupado 🔴)\n5. Click en una cabina libre\n6. Elige duración (1h, 2h o 3h)\n7. ¡Confirma tu reserva! 🎉',
  
  'como reservar': '¡Hola! 👋 Para reservar una cabina desde la web:\n\n1. Click en "Cybercafés" en el menú lateral 🎮\n2. Selecciona uno de los tres cybercafés disponibles\n3. Click en "Ver Cabinas Disponibles"\n4. Verás el estado en tiempo real (verde=libre 🟢, rojo=ocupado 🔴)\n5. Click en una cabina libre\n6. Elige duración (1h, 2h o 3h)\n7. ¡Confirma tu reserva! 🎉',
  
  'reservar cabina': '¡Hola! 👋 Para reservar una cabina desde la web:\n\n1. Click en "Cybercafés" en el menú lateral 🎮\n2. Selecciona uno de los tres cybercafés disponibles\n3. Click en "Ver Cabinas Disponibles"\n4. Verás el estado en tiempo real (verde=libre 🟢, rojo=ocupado 🔴)\n5. Click en una cabina libre\n6. Elige duración (1h, 2h o 3h)\n7. ¡Confirma tu reserva! 🎉',

  // Preguntas sobre cybercafés
  'cybercafes disponibles': '📍 Tenemos 3 cybercafés disponibles:\n\n1. **Silicom Lan Center** - Av. Real 1234, Huancayo, Junín\n2. **Linux Cybercafé** - Jr. Tecnología 456, El Tambo\n3. **ShadowLAN** - Av. Gamer Pro 789, Chilca\n\n¡Todos con cabinas gaming de alta gama! 🎮',
  
  'donde estan': '📍 Nuestros 3 cybercafés están en:\n\n1. **Silicom Lan Center** - Av. Real 1234, Huancayo, Junín\n2. **Linux Cybercafé** - Jr. Tecnología 456, El Tambo\n3. **ShadowLAN** - Av. Gamer Pro 789, Chilca',
  
  'cuantos cybercafes': 'Actualmente tenemos **3 cybercafés** disponibles en SynapLink 🎮',

  // Preguntas sobre precios
  'precios': '💰 Nuestros precios por cabina:\n\n• **S/2** - 1 hora (ganas 2 puntos) 🥤 1 vaso Pepsi\n• **S/5** - 2 horas (ganas 6 puntos) 🥤 1 Pepsi 500ml\n• **S/10** - 3 horas (ganas 12 puntos) 🥤 1 Pepsi 1L + Cuates',
  
  'cuanto cuesta': '💰 Nuestros precios por cabina:\n\n• **S/2** - 1 hora (ganas 2 puntos) 🥤 1 vaso Pepsi\n• **S/5** - 2 horas (ganas 6 puntos) 🥤 1 Pepsi 500ml\n• **S/10** - 3 horas (ganas 12 puntos) 🥤 1 Pepsi 1L + Cuates',
  
  'precio': '💰 Nuestros precios por cabina:\n\n• **S/2** - 1 hora (ganas 2 puntos) 🥤 1 vaso Pepsi\n• **S/5** - 2 horas (ganas 6 puntos) 🥤 1 Pepsi 500ml\n• **S/10** - 3 horas (ganas 12 puntos) 🥤 1 Pepsi 1L + Cuates',

  // Preguntas sobre puntos
  'puntos': '⭐ Sistema de puntos de SynapLink:\n\n• S/2 (1h) = **2 puntos**\n• S/5 (2h) = **6 puntos**\n• S/10 (3h) = **12 puntos**\n\nLos puntos se multiplican por cantidad de cabinas reservadas. ¡Acumúlalos! 🎯',
  
  'como gano puntos': '⭐ Ganas puntos automáticamente con cada reserva:\n\n• S/2 (1h) = **2 puntos**\n• S/5 (2h) = **6 puntos**\n• S/10 (3h) = **12 puntos**\n\n¡Entre más reservas, más puntos! 🎉',

  // Preguntas sobre pagos
  'pago': '💳 El pago se realiza al llegar al cybercafé escaneando un código QR con **Yape**. ¡Es rápido y seguro! 📱',
  
  'como pago': '💳 El pago se realiza al llegar al cybercafé escaneando un código QR con **Yape**. ¡Es rápido y seguro! 📱',
  
  'metodos de pago': '💳 Aceptamos pago con **Yape** mediante código QR al llegar al cybercafé. Rápido, fácil y seguro 📱✨',

  // Saludos
  'hola': '¡Hola! 👋 Soy **SynapBot**, tu asistente virtual de SynapLink. ¿En qué puedo ayudarte hoy? 🤖\n\nPuedo ayudarte con:\n• Reservar cabinas 🎮\n• Info de cybercafés 📍\n• Precios y promociones 💰\n• Sistema de puntos ⭐',
  
  'buenos dias': '¡Buenos días! ☀️ Soy **SynapBot**. ¿Cómo puedo ayudarte hoy con tus reservas de cabinas? 🎮',
  
  'buenas tardes': '¡Buenas tardes! 🌆 Soy **SynapBot**. ¿En qué puedo asistirte? 🎮',
  
  'buenas noches': '¡Buenas noches! 🌙 Soy **SynapBot**. ¿Cómo puedo ayudarte? 🎮',

  // Ayuda general
  'ayuda': '🆘 **¿En qué puedo ayudarte?**\n\nPuedo asistirte con:\n• 🎮 Reservar cabinas\n• 📍 Ubicación de cybercafés\n• 💰 Precios y promociones\n• ⭐ Sistema de puntos\n• 📋 Ver tus reservas\n• 👤 Gestión de perfil\n\n¿Sobre qué tema quieres saber más?',
  
  'que puedes hacer': '🤖 **Soy SynapBot** y puedo ayudarte con:\n\n• 🎮 Reservar cabinas paso a paso\n• 📍 Info de los 3 cybercafés\n• 💰 Precios (S/2, S/5, S/10)\n• ⭐ Sistema de puntos y beneficios\n• 📋 Consultar tus reservas\n• 💳 Métodos de pago (Yape)\n\n¿Qué necesitas saber?'
};

// Función para buscar respuesta en caché
function findCachedResponse(message) {
  const normalizedMessage = message.toLowerCase().trim();
  
  // Buscar coincidencia exacta o parcial
  for (const [key, response] of Object.entries(FAQ_CACHE)) {
    if (normalizedMessage.includes(key)) {
      return response;
    }
  }
  
  return null; // No hay respuesta en caché
}

// Estadísticas de caché
let cacheStats = {
  hits: 0,
  misses: 0,
  total: 0
};

function getCacheStats() {
  const hitRate = cacheStats.total > 0 
    ? ((cacheStats.hits / cacheStats.total) * 100).toFixed(1) 
    : 0;
  
  return {
    ...cacheStats,
    hitRate: `${hitRate}%`
  };
}

function recordCacheHit(isHit) {
  cacheStats.total++;
  if (isHit) {
    cacheStats.hits++;
  } else {
    cacheStats.misses++;
  }
}

module.exports = {
  findCachedResponse,
  getCacheStats,
  recordCacheHit,
  FAQ_CACHE
};
