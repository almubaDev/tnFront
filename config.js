import AsyncStorage from '@react-native-async-storage/async-storage';

// API URLs
const DEV_API_URL = 'http://192.168.0.5:8000/api';
const PROD_API_URL = 'https://tarotnautica.forgeapp.cl/api';

// Función para obtener la URL de la API
export const getApiUrl = async () => {
  try {
    // Intentar obtener una URL personalizada del almacenamiento
    const customUrl = await AsyncStorage.getItem('api_url');
    if (customUrl) return customUrl;
  } catch (error) {
    console.error('Error getting custom API URL:', error);
  }
  
  // Usar la URL predeterminada
  return process.env.NODE_ENV === 'development' ? DEV_API_URL : PROD_API_URL;
};

// Por compatibilidad con el código existente
export const API_URL = process.env.NODE_ENV === 'development' ? DEV_API_URL : PROD_API_URL;

// PayPal Configuration
export const PAYPAL_CLIENT_ID = 'ARN_0c5kwagyFzXN1WKhOXNhfQtVcbe2MaoX2uGe_bPvPjQHlpkDcnKUAv41_oL66oY-7dpDdhrbEqVrZ';

// App Version
export const APP_VERSION = '1.0.0';