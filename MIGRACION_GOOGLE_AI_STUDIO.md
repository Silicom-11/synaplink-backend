# 🚀 Migración a Google AI Studio (GRATUITO)

## ✅ Cambios Realizados

### 1. **chatbotController.js**
- ✅ Removida API key hardcodeada
- ✅ Ahora usa `process.env.GEMINI_API_KEY`
- ✅ Compatible con Google AI Studio (gratis)

### 2. **.env**
- ⚠️ Necesitas actualizar `GEMINI_API_KEY` con la nueva key

---

## 📝 **Pasos para Completar la Migración**

### **PASO 1: Obtener Nueva API Key de Google AI Studio**

1. Ve a: https://aistudio.google.com/app/apikey
2. Inicia sesión con tu Gmail (puedes usar el mismo o uno nuevo)
3. Click en **"Create API Key"**
4. Selecciona **"Create API key in new project"**
5. Copia la API key que te genere (empieza con `AIza...`)

### **PASO 2: Actualizar .env**

Abre tu archivo `.env` y reemplaza esta línea:

```env
# ANTES (API key vieja de Google Cloud)
GEMINI_API_KEY=AIzaSyCnShbp50cLI5USb_HHjGuk3YLkBNnZ8C4

# DESPUÉS (nueva API key de Google AI Studio - GRATIS)
GEMINI_API_KEY=TU_NUEVA_API_KEY_AQUI
```

### **PASO 3: Actualizar .env en Render**

1. Ve a tu dashboard de Render: https://dashboard.render.com/
2. Selecciona tu servicio `synaplink-backend`
3. Ve a **Environment** → **Environment Variables**
4. Encuentra `GEMINI_API_KEY` y actualízalo con la nueva key
5. Click en **Save Changes**
6. Render reiniciará automáticamente tu backend

### **PASO 4: Verificar que Funciona**

```bash
# Localmente
npm start

# Prueba el chatbot
curl -X POST http://localhost:3000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola SynapBot"}'
```

---

## 🎁 **Ventajas de Google AI Studio (vs Google Cloud)**

| Característica | Google Cloud | Google AI Studio |
|----------------|--------------|------------------|
| **Costo** | Requiere tarjeta después de trial | ✅ **GRATIS PARA SIEMPRE** |
| **Límites** | Flexible (pagas por uso) | 60 requests/minuto, 1500/día |
| **Setup** | Complejo (proyectos, billing) | ✅ **1 click, sin tarjeta** |
| **API** | Misma | ✅ **Misma (idéntica)** |
| **Para Estudiantes** | ❌ Requiere tarjeta | ✅ **PERFECTO** |

---

## 🔐 **Sobre Google OAuth (Login con Google)**

### **Opción A: Seguir usando Google Cloud OAuth (RECOMENDADO)**

- ✅ Tu `GOOGLE_CLIENT_ID` actual seguirá funcionando
- ✅ OAuth **NO requiere billing activo**
- ✅ Es gratuito incluso sin trial
- ✅ No necesitas hacer nada aquí

**Por qué funciona:**
- Google OAuth es parte de Google Identity Platform
- Es 100% gratuito para autenticación básica
- No depende de tu prueba gratuita de GCP
- Solo pagas si usas features avanzadas (Identity-Aware Proxy, etc.)

### **Opción B: Migrar a Firebase Auth (alternativa)**

Si prefieres tener todo en un solo lugar:

1. Ve a: https://console.firebase.google.com/
2. Crea un proyecto nuevo (gratis)
3. Habilita Authentication → Google Sign-In
4. Obtienes nuevo `clientId`
5. Actualizas `.env` y Render

**Pros Firebase:**
- Todo en un dashboard
- Más fácil de gestionar
- También 100% gratis

**Contras:**
- Requiere cambiar código de OAuth
- Tienes que migrar usuarios

---

## ⚠️ **¿Qué hacer con Google Cloud?**

### **NO ELIMINES NADA TODAVÍA**

**Opción 1: Dejarlo como está (RECOMENDADO)**
- No actualices a billing
- OAuth seguirá funcionando
- Proyectos quedan suspendidos pero no eliminados
- Puedes reactivar en el futuro si necesitas

**Opción 2: Actualizar solo para OAuth**
- Si quieres "limpiar" la advertencia
- Agregar tarjeta pero **deshabilitar APIs de Gemini**
- Solo dejar OAuth activo (gratis)
- Costo: $0/mes (OAuth es gratis)

**Opción 3: Eliminar después de migrar**
- Espera 1 semana con la nueva API funcionando
- Verifica que todo corre bien
- Exporta cualquier configuración importante
- Luego sí, elimina los proyectos de GCP

---

## 🧪 **Testing**

### **Test Local:**

```bash
cd synaplink-backend
npm start
```

En otra terminal:
```bash
curl -X POST http://localhost:3000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cómo reservo una cabina?"}'
```

Deberías ver la respuesta de SynapBot.

### **Test en Producción (Render):**

```bash
curl -X POST https://synaplink-backend.onrender.com/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola"}'
```

---

## 📊 **Límites de Google AI Studio (Tier Gratuito)**

- ✅ **60 requests por minuto** (más que suficiente para tu app)
- ✅ **1,500 requests por día** (aprox. 45,000/mes)
- ✅ **Sin costo**
- ✅ **Sin tarjeta requerida**
- ✅ **Para siempre** (no expira)

**¿Es suficiente para SynapLink?**
- Si tienes 100 usuarios activos/día
- Cada uno hace 10 preguntas al chatbot
- Total: 1,000 requests/día
- ✅ **Sobra espacio** (límite 1,500)

---

## 🆘 **Troubleshooting**

### Error: "API key not valid"
- Verifica que copiaste la key completa
- Debe empezar con `AIza...`
- No debe tener espacios al inicio/final

### Error: "quota exceeded"
- Llegaste al límite de 60 req/min o 1,500/día
- Espera unos minutos
- Considera implementar rate limiting en tu backend

### El chatbot no responde
- Verifica que Render tenga la nueva `GEMINI_API_KEY`
- Revisa los logs en Render dashboard
- Prueba localmente primero

---

## 📚 **Recursos**

- Google AI Studio: https://aistudio.google.com/
- Documentación Gemini API: https://ai.google.dev/docs
- Límites y Quotas: https://ai.google.dev/pricing
- Render Dashboard: https://dashboard.render.com/

---

## ✅ **Checklist de Migración**

- [ ] Obtener nueva API key de Google AI Studio
- [ ] Actualizar `.env` localmente
- [ ] Probar localmente (`npm start`)
- [ ] Actualizar variables de entorno en Render
- [ ] Esperar que Render reinicie (1-2 min)
- [ ] Probar en producción
- [ ] Verificar que app móvil funciona
- [ ] Verificar que web funciona
- [ ] ✅ ¡Migración completada!

---

## 💡 **Recomendación Final**

1. **Hoy**: Migra Gemini a Google AI Studio (gratis)
2. **OAuth**: Déjalo como está (ya es gratis)
3. **Google Cloud**: No actualices, no elimines aún
4. **Render**: Actualiza variables de entorno
5. **En 1 semana**: Si todo funciona, elimina proyectos de GCP

**Total costo después de migración: $0/mes** 🎉

---

¿Preguntas? Revisa el troubleshooting o contacta a soporte.
