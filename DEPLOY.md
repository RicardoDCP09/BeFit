# 🚀 Guía de Despliegue - Be Fit

## 1. Deploy Backend en Render

### Paso 1: Crear cuenta en Render
1. Ve a [render.com](https://render.com) y crea una cuenta gratuita

### Paso 2: Crear Base de Datos PostgreSQL
1. Dashboard → **New** → **PostgreSQL**
2. Configurar:
   - **Name**: `befit-db`
   - **Region**: Oregon (US West) - o la más cercana
   - **Plan**: Free
3. Click en **Create Database**
4. Espera a que se cree (~2 minutos)
5. Copia la **External Database URL** (la necesitarás después)

### Paso 3: Crear Web Service
1. Dashboard → **New** → **Web Service**
2. Selecciona **Build and deploy from a Git repository**
3. Conecta tu cuenta de GitHub y selecciona el repositorio
4. Configurar:
   - **Name**: `befit-api`
   - **Region**: Igual que la base de datos
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Paso 4: Variables de Entorno
En la sección **Environment**, agregar estas variables:
```
DATABASE_URL = [External Database URL de PostgreSQL]
JWT_SECRET = befit-secret-key-2024-production
GEMINI_API_KEY = [tu API key de Google AI Studio]
GROQ_API_KEY = [tu API key de Groq - opcional]
NODE_ENV = production
PORT = 3001
```

> 💡 **Obtener API Keys:**
> - Gemini: https://aistudio.google.com/app/apikey
> - Groq (gratis, mejor para chat): https://console.groq.com/keys

### Paso 5: Deploy
1. Click en **Create Web Service**
2. Render desplegará automáticamente (~5-10 minutos)
3. Una vez desplegado, copia la URL (ej: `https://befit-api.onrender.com`)

---

## 2. Deploy Frontend en Netlify (Web)

### Paso 1: Crear cuenta en Netlify
1. Ve a [netlify.com](https://netlify.com) y crea una cuenta

### Paso 2: Configurar Variable de Entorno Local
Crea un archivo `.env` en la raíz del proyecto:
```
EXPO_PUBLIC_API_URL=https://befit-api.onrender.com/api
```

### Paso 3: Deploy
**Opción A - Conectar GitHub (Recomendado):**
1. **Add new site** → **Import an existing project**
2. Selecciona GitHub y el repositorio
3. Build settings (ya configurados en `netlify.toml`):
   - Build command: `npx expo export --platform web`
   - Publish directory: `dist`
4. En **Environment variables**, agregar:
   - `EXPO_PUBLIC_API_URL` = `https://befit-api.onrender.com/api`
5. Click **Deploy site**

**Opción B - Manual:**
```bash
# En la raíz del proyecto
npx expo export --platform web
# Arrastra la carpeta 'dist/' a Netlify
```

---

## 3. Generar APK con Expo (EAS Build)

### Requisitos Previos
- Cuenta en [expo.dev](https://expo.dev) (gratis)
- Node.js instalado

### Paso 1: Instalar EAS CLI
```bash
npm install -g eas-cli
```

### Paso 2: Login en Expo
```bash
eas login
```
Ingresa tu email y contraseña de Expo.

### Paso 3: Configurar Proyecto en Expo
```bash
eas build:configure
```
Esto creará/actualizará `eas.json`. Selecciona **All** cuando pregunte las plataformas.

### Paso 4: Obtener Project ID
1. Ve a [expo.dev](https://expo.dev)
2. Click en **Create a project**
3. Nombre: `befit`
4. Copia el **Project ID** (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
5. Actualiza `app.config.js` línea 60:
```javascript
eas: {
  projectId: "TU-PROJECT-ID-AQUI"
}
```

### Paso 5: Configurar URL del Backend para el APK
Crea/edita el archivo `.env` en la raíz:
```
EXPO_PUBLIC_API_URL=https://befit-api.onrender.com/api
```

### Paso 6: Generar APK
```bash
eas build --platform android --profile preview
```

> ⏱️ **Tiempo estimado**: 10-20 minutos (se construye en los servidores de Expo)

Durante el build:
- Selecciona **Yes** si pregunta crear un nuevo Android Keystore
- Espera a que termine el build

### Paso 7: Descargar APK
1. Cuando termine, verás un link de descarga en la terminal
2. O ve a [expo.dev](https://expo.dev) → Tu proyecto → **Builds**
3. Click en el build más reciente → **Download**

---

## 📱 Compartir APK

### Opción 1: Link Directo de Expo
- El link de descarga de Expo funciona por 30 días
- Compártelo directamente

### Opción 2: Subir a la Nube
1. Descarga el APK
2. Sube a Google Drive, Dropbox, o OneDrive
3. Genera un link de descarga público
4. Comparte el link

### Opción 3: Distribución Interna (Recomendado)
```bash
eas build --platform android --profile preview --auto-submit
```
Esto permite distribuir a testers registrados en Expo.

---

## 🔧 Variables de Entorno - Resumen

### Frontend (.env en raíz)
```
EXPO_PUBLIC_API_URL=https://tu-backend.onrender.com/api
```

### Backend (server/.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=tu-secreto-jwt-seguro
GEMINI_API_KEY=tu-api-key-gemini
GROQ_API_KEY=tu-api-key-groq
PORT=3001
NODE_ENV=production
```

---

## 🐛 Solución de Problemas

### El APK no conecta al backend
1. Verifica que `EXPO_PUBLIC_API_URL` esté configurado antes del build
2. La URL debe terminar en `/api`
3. El backend debe estar corriendo en Render

### Error "eas: command not found"
```bash
npm install -g eas-cli
```

### Error de Keystore
Selecciona "Generate new keystore" cuando EAS lo pregunte.

### Build falla
1. Revisa los logs en expo.dev
2. Asegúrate de tener la última versión de dependencias:
```bash
npm install
```

### Backend en Render se "duerme"
El plan gratuito de Render duerme el servicio después de 15 min de inactividad.
- Primera request después de dormir tarda ~30 segundos
- Considera usar un servicio de ping como UptimeRobot (gratis)

---

## ✅ Checklist de Despliegue

### Backend
- [ ] Cuenta creada en Render
- [ ] Base de datos PostgreSQL creada
- [ ] Web Service creado con root directory `server`
- [ ] Variables de entorno configuradas (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY)
- [ ] Backend desplegado y funcionando
- [ ] URL del backend copiada

### Frontend Web (Opcional)
- [ ] Cuenta creada en Netlify
- [ ] Variable EXPO_PUBLIC_API_URL configurada
- [ ] Sitio desplegado

### APK Android
- [ ] Cuenta creada en expo.dev
- [ ] EAS CLI instalado (`npm install -g eas-cli`)
- [ ] Login en EAS (`eas login`)
- [ ] Project ID configurado en app.config.js
- [ ] Variable EXPO_PUBLIC_API_URL en .env
- [ ] Build ejecutado (`eas build --platform android --profile preview`)
- [ ] APK descargado
- [ ] APK compartido para distribución
