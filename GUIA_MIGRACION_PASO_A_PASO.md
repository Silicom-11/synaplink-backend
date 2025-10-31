# 🎯 Guía Paso a Paso - Migración a Google AI Studio

## ¿Por qué esta migración?

Tu prueba gratuita de Google Cloud Platform terminó, pero **NO NECESITAS PAGAR NADA**.
Google ofrece **Google AI Studio** que es 100% GRATUITO y funciona exactamente igual.

---

## 📋 PASO 1: Obtener Nueva API Key (5 minutos)

### 1.1 Abrir Google AI Studio
- 🌐 Ve a: https://aistudio.google.com/app/apikey
- 🔐 Inicia sesión con tu Gmail (puedes usar el mismo u otro nuevo)

### 1.2 Crear API Key
1. Click en el botón azul **"Create API Key"**
2. Selecciona **"Create API key in new project"**
   - NO selecciones tus proyectos viejos de GCP
   - Esto crea un proyecto nuevo y gratuito
3. ¡Listo! Tu API key aparecerá en pantalla

### 1.3 Copiar la API Key
- ✅ Debe empezar con: `AIza...`
- ✅ Tiene aprox. 39 caracteres
- ⚠️ Guárdala en un lugar seguro (es como una contraseña)

**Ejemplo de API key válida:**
```
AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567
```

---

## 📝 PASO 2: Actualizar .env Local (2 minutos)

### 2.1 Abrir el archivo .env
```bash
cd d:\projects\synaplink\synaplink-backend
code .env
# o abre .env con cualquier editor de texto
```

### 2.2 Encontrar esta línea:
```env
GEMINI_API_KEY=AIzaSyCnShbp50cLI5USb_HHjGuk3YLkBNnZ8C4
```

### 2.3 Reemplazar con tu nueva API key:
```env
GEMINI_API_KEY=TU_NUEVA_API_KEY_AQUI
```

**Ejemplo:**
```env
# ANTES (vieja de Google Cloud)
GEMINI_API_KEY=AIzaSyCnShbp50cLI5USb_HHjGuk3YLkBNnZ8C4

# DESPUÉS (nueva de Google AI Studio - GRATIS)
GEMINI_API_KEY=AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567
```

### 2.4 Guardar el archivo
- `Ctrl + S` en VS Code
- O guardar normalmente

---

## 🧪 PASO 3: Probar Localmente (3 minutos)

### 3.1 Instalar dependencias (si no lo has hecho)
```bash
cd d:\projects\synaplink\synaplink-backend
npm install
```

### 3.2 Ejecutar script de prueba
```bash
node test-gemini.js
```

### 3.3 Resultado esperado:
```
╔════════════════════════════════════════════════╗
║  🧪 Test de Migración Google AI Studio       ║
║     SynapLink Backend                         ║
╚════════════════════════════════════════════════╝

🧪 Iniciando prueba de Gemini API...

✅ GEMINI_API_KEY encontrada en .env
📋 Key preview: AIzaSyABC...

✅ GoogleGenerativeAI inicializado correctamente
✅ Modelo gemini-2.0-flash-exp configurado

📤 Enviando mensaje de prueba...

📨 Respuesta recibida:
──────────────────────────────────────────────────
Hola, SynapLink funciona correctamente
──────────────────────────────────────────────────

✅ PRUEBA EXITOSA - La migración funcionó correctamente!
```

### 3.4 Si hay errores:
- ❌ **"API key not valid"**: Verifica que copiaste bien la key
- ❌ **"quota exceeded"**: Espera 1 minuto (límite de requests)
- ❌ **"ENOTFOUND"**: Verifica tu conexión a internet

---

## 🚀 PASO 4: Actualizar Render (5 minutos)

### 4.1 Ir a Render Dashboard
1. 🌐 Ve a: https://dashboard.render.com/
2. 🔐 Inicia sesión con tu cuenta de Render

### 4.2 Seleccionar tu servicio
1. Click en **"synaplink-backend"** (o como se llame tu servicio)
2. Deberías ver el dashboard del servicio

### 4.3 Ir a Environment Variables
1. En el menú lateral, click en **"Environment"**
2. Verás una lista de variables de entorno

### 4.4 Actualizar GEMINI_API_KEY
1. Busca la variable `GEMINI_API_KEY`
2. Click en el ícono de **editar** (lápiz)
3. Borra el valor viejo
4. Pega tu nueva API key de Google AI Studio
5. Click en **"Save Changes"**

### 4.5 Esperar reinicio automático
- ⏳ Render reiniciará tu servicio automáticamente
- ⏱️ Toma aprox. 1-2 minutos
- ✅ Verás el estado cambiar a **"Live"**

---

## ✅ PASO 5: Verificar que Todo Funciona (5 minutos)

### 5.1 Probar desde la App Móvil
1. Abre SynapLink en tu celular
2. Ve al chatbot (SynapBot)
3. Escribe: "Hola, ¿cómo reservo una cabina?"
4. ✅ Deberías recibir respuesta del bot

### 5.2 Probar desde la Web
1. Abre: https://synaplink-web.vercel.app (o tu URL)
2. Inicia sesión
3. Abre el chatbot flotante (botón con GIF)
4. Escribe un mensaje
5. ✅ Deberías recibir respuesta del bot

### 5.3 Probar con CURL (opcional)
```bash
curl -X POST https://synaplink-backend.onrender.com/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Hola SynapBot\"}"
```

Deberías ver:
```json
{
  "success": true,
  "reply": "¡Hola! Soy SynapBot 🤖..."
}
```

---

## 🎉 ¡MIGRACIÓN COMPLETADA!

### ✅ Checklist Final:
- [x] Nueva API key de Google AI Studio obtenida
- [x] `.env` local actualizado
- [x] Prueba local exitosa
- [x] Render actualizado con nueva key
- [x] App móvil funcionando
- [x] Web funcionando

---

## 📊 ¿Qué cambió?

| Antes (Google Cloud) | Después (Google AI Studio) |
|---------------------|----------------------------|
| Requiere tarjeta después del trial | ✅ Gratis para siempre |
| Límite según tu plan | ✅ 60 req/min, 1500/día |
| Billing complejo | ✅ Sin billing, sin tarjeta |
| Costo mensual potencial | ✅ $0/mes garantizado |
| Mismo código | ✅ Mismo código (sin cambios) |

---

## 🔐 Sobre Google OAuth (Login con Google)

### ¿Necesito cambiar algo del login con Google?

**NO** 🎉

- Tu `GOOGLE_CLIENT_ID` actual seguirá funcionando
- Google OAuth es **GRATIS** incluso sin prueba gratuita
- No depende del billing de Google Cloud
- Déjalo como está, no toques nada

---

## ⚠️ ¿Qué hago con mi Google Cloud Platform?

### Opción Recomendada: NO HAGAS NADA

1. **No actualices a billing** (no agregues tarjeta)
2. **No elimines proyectos** (todavía)
3. **Déjalo suspendido** por ahora
4. **En 1 semana**: Si todo funciona bien, puedes eliminar los proyectos

### ¿Por qué esperar?
- Por si necesitas recuperar alguna configuración
- Para asegurar que la migración fue exitosa
- OAuth seguirá funcionando aunque esté suspendido

---

## 🆘 Troubleshooting

### "API key not valid"
```
❌ Error: API key not valid. Please pass a valid API key.
```
**Solución:**
- Verifica que copiaste la key completa de Google AI Studio
- Debe empezar con `AIza...`
- No debe tener espacios al inicio o final
- Obtén una nueva en: https://aistudio.google.com/app/apikey

### "429 Too Many Requests"
```
❌ Error: 429 Resource exhausted
```
**Solución:**
- Llegaste al límite de 60 requests por minuto
- Espera 1 minuto e intenta de nuevo
- Considera implementar rate limiting en tu backend

### El chatbot no responde en Render
```
❌ El bot no responde después de actualizar Render
```
**Solución:**
1. Ve a Render dashboard
2. Ve a **"Logs"** de tu servicio
3. Busca errores relacionados con Gemini
4. Verifica que `GEMINI_API_KEY` esté bien configurada
5. Reinicia manualmente el servicio

### Error de conexión local
```
❌ Error: connect ECONNREFUSED
```
**Solución:**
- Verifica que MongoDB esté conectado
- Revisa tu `MONGODB_URI` en .env
- Intenta: `node server.js` para ver más detalles

---

## 📚 Recursos Útiles

- 🌐 Google AI Studio: https://aistudio.google.com/
- 📖 Documentación Gemini: https://ai.google.dev/docs
- 💰 Límites y Pricing: https://ai.google.dev/pricing
- 🚀 Render Dashboard: https://dashboard.render.com/
- 📞 Soporte SynapLink: [Tu email/contacto]

---

## 💡 Consejos Pro

### 1. Guarda tu API key en un lugar seguro
- Usa un gestor de contraseñas (LastPass, 1Password, etc.)
- No la compartas públicamente
- No la subas a GitHub (ya está en .gitignore)

### 2. Monitorea el uso
- Ve a: https://aistudio.google.com/app/apikey
- Click en tu API key
- Verás estadísticas de uso en tiempo real

### 3. Implementa rate limiting
```javascript
// En tu backend, agrega:
const rateLimit = require('express-rate-limit');

const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // 10 requests por IP por minuto
  message: 'Demasiadas consultas, intenta en 1 minuto'
});

app.use('/api/chatbot', chatbotLimiter);
```

### 4. Caché de respuestas comunes
```javascript
// Cachea preguntas frecuentes para ahorrar requests
const cache = new Map();

if (cache.has(message)) {
  return res.json({ reply: cache.get(message) });
}

// Si no está en cache, llama a Gemini
const reply = await callGemini(message);
cache.set(message, reply);
```

---

## 🎓 Para Estudiantes

**Esto es perfecto para proyectos estudiantiles:**
- ✅ 100% gratis
- ✅ Sin tarjeta de crédito
- ✅ Límites generosos (1500 req/día)
- ✅ Tecnología de punta (Gemini 2.0)
- ✅ Ideal para portfolios y demos

**Si tienes preguntas:**
- Abre un issue en GitHub
- Contacta a tu profesor/mentor
- Revisa la documentación oficial

---

## ✨ ¡Éxito en tu Proyecto!

Tu SynapLink ahora funciona con:
- ✅ Gemini AI **GRATIS** (Google AI Studio)
- ✅ Google OAuth **GRATIS** (sigue funcionando)
- ✅ MongoDB Atlas **GRATIS** (tier gratuito)
- ✅ Render **GRATIS** (tier gratuito)
- ✅ Vercel **GRATIS** (tier gratuito)

**Total: $0/mes** 🎉

¡A programar sin preocupaciones! 🚀
