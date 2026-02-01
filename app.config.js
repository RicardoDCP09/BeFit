export default {
  expo: {
    name: "Be Fit",
    slug: "befit",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/BetFit-FavIcon-Naranja.png",
    scheme: "befit",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/Befit_Fondo_Blanco.png",
      resizeMode: "contain",
      backgroundColor: "#FF9800"
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Be Fit necesita acceso a la cámara para escanear tu nevera y generar recetas personalizadas.",
        NSPhotoLibraryUsageDescription: "Be Fit necesita acceso a tus fotos para analizar ingredientes."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/Befit_Sin_Fondo.png",
        backgroundColor: "#FF9800"
      },
      permissions: ["android.permission.CAMERA"],
      edgeToEdgeEnabled: true,
      package: "com.befit.app"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/BetFit-FavIcon-Naranja.png",
      name: "Be Fit - Tu Ecosistema de Bienestar"
    },
    plugins: [
      "expo-router",
      "expo-audio",
      [
        "expo-camera",
        {
          cameraPermission: "Be Fit necesita acceso a la cámara para escanear tu nevera."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Be Fit necesita acceso a tus fotos para analizar ingredientes."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || null,
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
