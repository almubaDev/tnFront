import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

// Componente para manejar la instalación de PWA en diferentes plataformas
const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    // Verificar si es iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               window.navigator.standalone === true;
    
    // Para dispositivos iOS, mostrar instrucciones personalizadas
    if (isIOS && !isInStandaloneMode) {
      // Verificar si ya hemos mostrado el prompt recientemente
      const lastPrompt = localStorage.getItem('iosPwaPromptShown');
      const now = new Date().getTime();
      
      if (!lastPrompt || (now - parseInt(lastPrompt, 10) > 7 * 24 * 60 * 60 * 1000)) {
        // Mostrar después de 5 segundos para dar tiempo a que el usuario vea la interfaz
        setTimeout(() => {
          setShowIOSPrompt(true);
          localStorage.setItem('iosPwaPromptShown', now);
        }, 5000);
      }
    }
    
    // Para Chrome y otros navegadores compatibles
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
      
      // Guardar el evento para usarlo después
      console.log('Evento beforeinstallprompt capturado');
    });
    
    // Detectar si ya está instalada
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalada correctamente');
      setShowInstallButton(false);
      setInstallPrompt(null);
      // Podríamos mostrar un mensaje de confirmación aquí
    });
    
    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!installPrompt) return;
    
    // Mostrar el prompt de instalación
    installPrompt.prompt();
    
    // Esperar por la respuesta del usuario
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuario aceptó la instalación');
      } else {
        console.log('Usuario rechazó la instalación');
      }
      
      // Resetear el evento - solo se puede usar una vez
      setInstallPrompt(null);
      setShowInstallButton(false);
    });
  };
  
  const closeIOSPrompt = () => {
    setShowIOSPrompt(false);
  };
  
  // Si no estamos en web o no hay nada que mostrar, no renderizar nada
  if (Platform.OS !== 'web' || (!showInstallButton && !showIOSPrompt)) {
    return null;
  }
  
  return (
    <>
      {/* Botón de instalación estándar para Chrome y otros */}
      {showInstallButton && (
        <TouchableOpacity
          style={styles.installButton}
          onPress={handleInstallClick}
        >
          <Text style={styles.installButtonText}>Instalar App</Text>
        </TouchableOpacity>
      )}
      
      {/* Prompt personalizado para iOS */}
      {showIOSPrompt && (
        <View style={styles.iosPromptContainer}>
          <View style={styles.iosPromptContent}>
            <Text style={styles.iosPromptTitle}>Instala TarotNautica</Text>
            <Text style={styles.iosPromptText}>
              Para instalar esta app en tu iPhone:
            </Text>
            <View style={styles.iosInstructions}>
              <Text style={styles.iosStep}>1. Toca el ícono de compartir</Text>
              <Text style={styles.iosSymbol}>↑</Text>
              <Text style={styles.iosStep}>2. Desplázate y selecciona "Agregar a pantalla de inicio"</Text>
            </View>
            <TouchableOpacity 
              style={styles.iosCloseButton}
              onPress={closeIOSPrompt}
            >
              <Text style={styles.iosCloseText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  installButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#d6af36',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  installButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iosPromptContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1001,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iosPromptContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: '#d6af36',
  },
  iosPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 15,
    textAlign: 'center',
  },
  iosPromptText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  iosInstructions: {
    marginTop: 10,
    paddingBottom: 15,
  },
  iosStep: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  iosSymbol: {
    fontSize: 20,
    color: '#d6af36',
    textAlign: 'center',
    marginVertical: 5,
  },
  iosCloseButton: {
    backgroundColor: '#d6af36',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 10,
  },
  iosCloseText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PWAInstallPrompt;