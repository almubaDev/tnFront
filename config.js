// API URLs
const DEV_API_URL = 'http://192.168.0.5:8000/api';
const PROD_API_URL = 'https://tarotnautica.forgeapp.cl/api';

// PayPal Configuration
export const PAYPAL_CLIENT_ID = 'ARN_0c5kwagyFzXN1WKhOXNhfQtVcbe2MaoX2uGe_bPvPjQHlpkDcnKUAv41_oL66oY-7dpDdhrbEqVrZ';

// API Configuration
export const API_URL = process.env.NODE_ENV === 'development' ? DEV_API_URL : PROD_API_URL;

// App Version
export const APP_VERSION = '1.0.0';

// Note: For Expo, configure the IP address in app.json for development
