export default {
  expo: {
    name: "Be Fit",
    slug: "befit",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "befit",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#4CAF50"
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
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#4CAF50"
      },
      permissions: ["android.permission.CAMERA"],
      edgeToEdgeEnabled: true,
      package: "com.befit.app"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      name: "Be Fit - Tu Ecosistema de Bienestar"
    },
    plugins: [
      "expo-router",
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
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api",
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
