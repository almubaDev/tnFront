// app.config.js
export default ({ config }) => {
    return {
      ...config,
      
      // Configuración de la barra de estado de Android
      androidStatusBar: {
        hidden: true,
        translucent: true,
        backgroundColor: '#000000',
      },
      
      // Configuraciones específicas para Android
      android: {
        ...(config.android || {}),
        softwareKeyboardLayoutMode: 'pan',
        navigationBarColor: '#000000',
        navigationBarHidden: true,
      },
      
      // Configuraciones específicas para iOS
      ios: {
        ...(config.ios || {}),
        requireFullScreen: true,
      },
    };
  };