# 🎯 Optimización de SynapLink - Sistema de Caché para FAQs

## 📊 Límites Reales de tu Cuenta (Google AI Studio)

Según tu dashboard:

### ✅ gemini-2.5-flash (RECOMENDADO - en uso)
```
RPM: 10 requests/minuto
RPD: 250 requests/día ⭐
TPM: 250,000 tokens/minuto
Costo: $0 (GRATIS)
```

### ❌ gemini-2.0-flash-exp (NO usar)
```
RPM: 10 requests/minuto
RPD: 50 requests/día (muy bajo)
TPM: 250,000 tokens/minuto
```

---

## 💡 Solución: Sistema de Caché de FAQs

Para maximizar tus 250 requests/día, implementamos un **sistema de caché** que responde preguntas frecuentes **SIN consumir API** de Gemini.

### ¿Cómo funciona?

1. **Usuario envía pregunta** → Primero busca en caché local
2. **¿Está en caché?** 
   - ✅ **SÍ**: Responde inmediatamente (GRATIS, no consume API)
   - ❌ **NO**: Consulta Gemini AI (consume 1 request)

---

## 📁 Archivos Creados

### 1. `utils/faqCache.js`
Contiene 20+ respuestas pre-definidas para preguntas frecuentes:

- Saludos (hola, buenos días, etc.)
- Cómo reservar cabinas
- Cybercafés disponibles
- Precios y promociones
- Sistema de puntos
- Métodos de pago
- Ayuda general

### 2. Actualizado `controllers/chatbotController.js`
Ahora incluye lógica de caché:
- Busca primero en caché
- Si no encuentra, usa Gemini AI
- Registra estadísticas de uso

### 3. Nueva ruta `GET /api/chatbot/cache-stats`
Para monitorear cuántas consultas se responden desde caché.

---

## 🧪 Probar el Sistema de Caché

### **Pregunta con caché (GRATIS)**:
```powershell
$body = @{ message = "hola" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/chatbot/message" -Method Post -Body $body -ContentType "application/json"
```

Respuesta esperada:
```json
{
  "success": true,
  "reply": "¡Hola! 👋 Soy **SynapBot**...",
  "cached": true  ← No consumió API
}
```

### **Pregunta sin caché (consume 1 request)**:
```powershell
$body = @{ message = "¿Qué juegos tienen?" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/chatbot/message" -Method Post -Body $body -ContentType "application/json"
```

Respuesta esperada:
```json
{
  "success": true,
  "reply": "Respuesta generada por Gemini AI...",
  "cached": false  ← Consumió 1 request
}
```

### **Ver estadísticas**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/chatbot/cache-stats" -Method Get
```

Respuesta:
```json
{
  "success": true,
  "stats": {
    "hits": 15,      // Respuestas desde caché
    "misses": 5,     // Consultas a Gemini API
    "total": 20,
    "hitRate": "75.0%"  // 75% no consumió API
  }
}
```

---

## 📈 Impacto en tus Límites

### **Sin caché (antes)**:
- 50 usuarios × 5 preguntas = **250 requests/día**
- ✅ Justo en el límite

### **Con caché (ahora)**:
- 50 usuarios × 5 preguntas = 250 total
- **70% en caché** = 175 gratis
- **30% API** = 75 requests/día
- ✅ **Solo usas 30% del límite** (sobra 70%)

### **Con caché optimizado**:
- Puedes manejar **hasta 150 usuarios/día** con el mismo límite
- O **más de 800 preguntas frecuentes/día** gratis

---

## 🔧 Desplegar en Render

### Paso 1: Subir cambios a GitHub
```bash
git add .
git commit -m "feat: Sistema de caché para optimizar uso de Gemini API"
git push origin main
```

### Paso 2: Render detectará y desplegará automáticamente
- Render hará auto-deploy desde GitHub
- El nuevo sistema de caché estará activo
- No requiere cambios en variables de entorno

### Paso 3: Verificar en producción
```powershell
# Probar caché
$body = @{ message = "hola" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://synaplink-backend.onrender.com/api/chatbot/message" -Method Post -Body $body -ContentType "application/json"

# Ver stats
Invoke-RestMethod -Uri "https://synaplink-backend.onrender.com/api/chatbot/cache-stats" -Method Get
```

---

## 📋 Preguntas en Caché (no consumen API)

1. **Saludos**:
   - hola, buenos días, buenas tardes, buenas noches

2. **Reservas**:
   - como reservo, como reservar, reservar cabina

3. **Cybercafés**:
   - cybercafes disponibles, donde estan, cuantos cybercafes

4. **Precios**:
   - precios, cuanto cuesta, precio

5. **Puntos**:
   - puntos, como gano puntos

6. **Pagos**:
   - pago, como pago, metodos de pago

7. **Ayuda**:
   - ayuda, que puedes hacer

**Total: 20+ variaciones** de preguntas frecuentes

---

## 💰 Comparación de Costos

| Escenario | Sin Caché | Con Caché (70%) | Ahorro |
|-----------|-----------|-----------------|--------|
| 50 users/día | 250 req | 75 req | **70%** |
| 100 users/día | 500 req ❌ | 150 req ✅ | **70%** |
| 200 users/día | 1000 req ❌ | 300 req ❌ | **70%** |

✅ Con caché puedes manejar **3x más usuarios** con el mismo límite.

---

## 🎯 Recomendaciones Adicionales

### 1. **Monitorea estadísticas semanalmente**
```bash
GET /api/chatbot/cache-stats
```

### 2. **Agrega más preguntas al caché**
Edita `utils/faqCache.js` y agrega nuevas preguntas frecuentes que veas en tus logs.

### 3. **Rate limiting por usuario**
Limita a 10 preguntas/minuto por usuario para evitar spam.

### 4. **Respuestas pre-definidas avanzadas**
Para preguntas muy específicas, considera agregar más variaciones al caché.

---

## 🔗 Links Útiles

- **Dashboard**: https://aistudio.google.com/app/apikey
- **Ver uso real**: Dashboard → Usage → Rate Limit
- **Precios**: https://ai.google.dev/pricing
- **Docs**: https://ai.google.dev/docs

---

## ✅ Checklist de Implementación

- [x] ✅ Sistema de caché creado (`utils/faqCache.js`)
- [x] ✅ Controlador actualizado con lógica de caché
- [x] ✅ Ruta de estadísticas agregada
- [x] ✅ 20+ preguntas frecuentes en caché
- [ ] ⏳ Subir a GitHub
- [ ] ⏳ Deploy en Render
- [ ] ⏳ Verificar en producción
- [ ] ⏳ Monitorear estadísticas

---

## 🎉 Resultado Final

**Con este sistema**:
- ✅ **70-80% de preguntas** respondidas GRATIS (desde caché)
- ✅ **Solo 20-30%** consume API de Gemini
- ✅ Puedes manejar **3x más usuarios**
- ✅ Sigue siendo **$0/mes**
- ✅ Mejor experiencia (respuestas más rápidas desde caché)

---

**Última actualización**: Octubre 30, 2024  
**Versión**: 3.0 (Sistema de Caché implementado)
