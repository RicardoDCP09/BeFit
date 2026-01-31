# 🚀 Guía de Despliegue - Be Fit

## 1. Deploy Backend en Render

### Paso 1: Crear cuenta en Render
1. Ve a [render.com](https://render.com) y crea una cuenta

### Paso 2: Crear Base de Datos PostgreSQL
1. Dashboard → New → PostgreSQL
2. Nombre: `befit-db`
3. Plan: Free
4. Crear y copiar la **Internal Database URL**

### Paso 3: Crear Web Service
1. Dashboard → New → Web Service
2. Conectar repositorio de GitHub
3. Configurar:
   - **Name**: `befit-api`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Paso 4: Variables de Entorno
En el servicio web, agregar:
```
DATABASE_URL = [URL de PostgreSQL de Render]
JWT_SECRET = [genera una clave segura]
GEMINI_API_KEY = [tu API key de Google Gemini]
NODE_ENV = production
```

### Paso 5: Deploy
- Render desplegará automáticamente
- Copia la URL del servicio (ej: `https://befit-api.onrender.com`)

---

## 2. Deploy Frontend en Netlify

### Paso 1: Crear cuenta en Netlify
1. Ve a [netlify.com](https://netlify.com) y crea una cuenta

### Paso 2: Configurar Variable de Entorno
Antes de deployar, crea un archivo `.env` en la raíz:
```
EXPO_PUBLIC_API_URL=https://befit-api.onrender.com/api
```

### Paso 3: Build Local (Opcional)
```bash
npx expo export --platform web
```

### Paso 4: Deploy
**Opción A - Conectar GitHub:**
1. New Site → Import from Git
2. Seleccionar repositorio
3. Build settings ya están en `netlify.toml`

**Opción B - Drag & Drop:**
1. Ejecutar: `npx expo export --platform web`
2. Arrastrar carpeta `dist/` a Netlify

---

## 3. Generar APK con Expo (EAS Build)

### Paso 1: Instalar EAS CLI
```bash
npm install -g eas-cli
```

### Paso 2: Login en Expo
```bash
eas login
```

### Paso 3: Configurar Proyecto
```bash
eas build:configure
```

### Paso 4: Generar APK
```bash
eas build --platform android --profile preview
```

### Paso 5: Descargar APK
- Ve a [expo.dev](https://expo.dev)
- Dashboard → Builds → Descargar APK

---

## 📱 Compartir APK

Una vez generado el APK:
1. Descarga desde Expo Dashboard
2. Sube a Google Drive, Dropbox, o similar
3. Comparte el link de descarga

---

## 🔧 Variables de Entorno

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=https://tu-backend.onrender.com/api
```

### Backend (server/.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=tu-secreto-jwt
GEMINI_API_KEY=tu-api-key-gemini
PORT=3001
NODE_ENV=production
```

---

## ✅ Checklist de Despliegue

- [ ] Backend desplegado en Render
- [ ] Base de datos PostgreSQL creada
- [ ] Variables de entorno configuradas en Render
- [ ] Frontend desplegado en Netlify
- [ ] `EXPO_PUBLIC_API_URL` apunta al backend
- [ ] APK generado con EAS Build
- [ ] APK compartido para descarga
