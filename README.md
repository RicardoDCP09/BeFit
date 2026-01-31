# Be Fit - Ecosistema de Bienestar Holístico

Una aplicación integral que unifica el cuidado físico, nutricional y mental en un solo ecosistema inteligente, impulsado por Google Gemini AI.

## 🚀 Stack Tecnológico

- **Frontend**: Expo (React Native) con TypeScript
- **Backend**: Node.js + Express
- **Base de Datos**: PostgreSQL
- **IA**: Google Gemini 1.5 Flash (Vision + Language)
- **Estado**: Zustand
- **Autenticación**: JWT

## 📱 Módulos

1. **Dashboard** - Resumen de métricas y progreso
2. **Smart Gym** - Rutinas personalizadas generadas por IA
3. **Cocina Inteligente** - Análisis visual de nevera + recetas
4. **Santuario Mental** - Chat terapéutico Adleriano + tips de bienestar

## 🛠️ Instalación

### Requisitos Previos

- Node.js 18+ 
- PostgreSQL instalado y corriendo
- Expo CLI (`npm install -g expo-cli`)

### 1. Configurar Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE befit;
```

### 2. Configurar Backend

```bash
cd server

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env con tus credenciales de PostgreSQL

# Iniciar servidor
npm run dev
```

### 3. Configurar Frontend

```bash
# En la raíz del proyecto
npm install

# Iniciar Expo
npm start
```

## ⚙️ Variables de Entorno (server/.env)

```env
PORT=3001
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/befit
DB_HOST=localhost
DB_PORT=5432
DB_NAME=befit
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secret_seguro
JWT_EXPIRES_IN=7d

# Gemini AI
GEMINI_API_KEY=tu_api_key
```

## 📂 Estructura del Proyecto

```
BeFit/
├── app/                    # Pantallas (Expo Router)
│   ├── (auth)/            # Login, Register
│   ├── (tabs)/            # Dashboard, Gym, Kitchen, Mind
│   └── onboarding/        # Bio-métricas
├── components/            # Componentes reutilizables
├── constants/             # Colores, configuración
├── store/                 # Zustand stores
├── types/                 # TypeScript interfaces
├── utils/                 # API client, cálculos
└── server/                # Backend Express
    ├── routes/            # Endpoints API
    ├── models/            # Modelos Sequelize
    ├── middleware/        # Auth JWT
    └── utils/             # Cliente Gemini
```

## 🔐 API Endpoints

### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### User
- `GET /api/user/profile` - Obtener perfil
- `PUT /api/user/health-profile` - Actualizar bio-métricas

### Gym
- `POST /api/gym/generate` - Generar rutina con IA
- `GET /api/gym/current` - Rutina activa
- `PUT /api/gym/progress` - Actualizar progreso

### Kitchen
- `POST /api/kitchen/analyze` - Analizar imagen de nevera
- `POST /api/kitchen/recipe` - Generar receta
- `POST /api/kitchen/smart-cook` - Análisis + receta en un paso

### Mind
- `POST /api/mind/chat` - Enviar mensaje al chatbot
- `GET /api/mind/chat/today` - Chat de hoy
- `GET /api/mind/tips` - Consejos de bienestar

## 🧮 Cálculos de Salud

- **IMC**: peso / (altura_m)²
- **TMB** (Mifflin-St Jeor): 10×peso + 6.25×altura - 5×edad + (5 hombres / -161 mujeres)
- **TDEE**: TMB × factor de actividad
- **% Grasa**: Fórmula simplificada basada en IMC y edad

## 📄 Licencia

MIT
