# 🤖 Configuración de Gemini AI API Key

## Paso 1: Crear API Key en Google Cloud Console

### 1.1 Acceder al proyecto
- Ve a: https://console.cloud.google.com/welcome?project=synaplink-19c72

### 1.2 Habilitar la API de Gemini
1. En el menú lateral, busca "**APIs y servicios**" → "**Biblioteca**"
2. O ve directo a: https://console.cloud.google.com/apis/library?project=synaplink-19c72
3. Busca "**Generative Language API**" o "**Gemini API**"
4. Click en "**HABILITAR**" (si no está ya habilitada)

### 1.3 Crear la API Key
1. Ve a "**APIs y servicios**" → "**Credenciales**"
2. O directo: https://console.cloud.google.com/apis/credentials?project=synaplink-19c72
3. Click en "**+ CREAR CREDENCIALES**" (arriba)
4. Selecciona "**Clave de API**"
5. Se generará automáticamente

### 1.4 Configurar restricciones (IMPORTANTE para seguridad)
1. Click en la API Key recién creada para editarla
2. Dale un nombre descriptivo: "**SynapLink Backend API**"
3. En "**Restricciones de la aplicación**":
   - Selecciona "**Direcciones IP**" para mayor seguridad
   - O "**Ninguna**" para pruebas rápidas (menos seguro)
4. En "**Restricciones de API**":
   - Selecciona "**Restringir clave**"
   - Marca solo "**Generative Language API**"
5. Click en "**GUARDAR**"
6. **COPIA LA API KEY** (algo como: AIzaSy...)

---

## Paso 2: Configurar en Local (desarrollo)

### 2.1 Actualizar archivo .env
Abre el archivo `.env` en el backend y actualiza la línea:

```env
GEMINI_API_KEY=TU_NUEVA_API_KEY_AQUI
```

### 2.2 Reiniciar servidor local
```bash
# Si está corriendo, detenerlo (Ctrl+C) y reiniciar
npm start
# o
node server.js
```

---

## Paso 3: Configurar en Render (producción)

### 3.1 Acceder al Dashboard de Render
1. Ve a: https://dashboard.render.com/
2. Busca tu servicio "**synaplink-backend**"
3. Click en el servicio

### 3.2 Agregar Variable de Entorno
1. En el menú lateral, click en "**Environment**"
2. Scroll hasta "**Environment Variables**"
3. Click en "**Add Environment Variable**"
4. Agrega:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `TU_NUEVA_API_KEY_AQUI` (la que copiaste de Google Cloud)
5. Click en "**Save Changes**"

### 3.3 Render se redesplegará automáticamente
- Espera 1-2 minutos
- Verifica los logs para asegurarte de que no hay errores

---

## Paso 4: Verificar que funciona

### 4.1 Probar en Local
```bash
# Hacer una petición de prueba
curl -X POST http://localhost:3000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿cómo funciona SynapLink?"}'
```

### 4.2 Probar en Producción
```bash
# Hacer una petición de prueba al backend en Render
curl -X POST https://synaplink-backend.onrender.com/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿cómo funciona SynapLink?"}'
```

### 4.3 Probar desde la Web App
1. Abre la aplicación web
2. Click en el botón del chatbot (SynapBot animado)
3. Escribe un mensaje: "¿Cómo puedo reservar una cabina?"
4. Deberías recibir una respuesta del bot

---

## 🔍 Troubleshooting

### Error: "API key not valid"
- Verifica que copiaste la API Key completa
- Asegúrate de que está habilitada la "Generative Language API"
- Revisa que no tenga restricciones de IP que bloqueen Render

### Error: "Quota exceeded"
- Revisa tu cuota en Google Cloud Console
- Ve a: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas?project=synaplink-19c72

### Error: "CORS issues"
- Esto NO debería pasar porque el frontend llama al backend, no a Google directamente
- Verifica que el frontend esté apuntando a la URL correcta del backend

---

## 📋 Checklist Final

- [ ] API habilitada en Google Cloud Console
- [ ] API Key creada y copiada
- [ ] Restricciones configuradas (solo Generative Language API)
- [ ] Variable `GEMINI_API_KEY` agregada al archivo `.env` local
- [ ] Servidor local reiniciado y probado
- [ ] Variable `GEMINI_API_KEY` agregada en Render Dashboard
- [ ] Render redesplegado automáticamente
- [ ] Chatbot probado desde la web app
- [ ] SynapBot responde correctamente con el GIF animado

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu chatbot debería funcionar perfectamente tanto en desarrollo local como en producción (Render).

**Notas de seguridad:**
- NUNCA subas el archivo `.env` a Git (ya está en `.gitignore`)
- Usa variables de entorno separadas para desarrollo y producción
- Considera rotar las API Keys periódicamente
- Monitorea el uso de la API en Google Cloud Console
