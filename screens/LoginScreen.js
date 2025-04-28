import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Video } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../styles/globalStyles';
import { API_URL } from '../config';
import CustomAlert from '../components/CustomAlert';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para alerta personalizada
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: []
  });

  // Función para mostrar alertas personalizadas
  const showAlert = (title, message, buttons = [{ text: 'Aceptar', onPress: () => setAlertVisible(false) }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Datos incompletos', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Credenciales inválidas');
      }

      const data = await response.json();
      
      // Guardar tokens de forma segura
      await AsyncStorage.setItem('access', data.access);
      await AsyncStorage.setItem('refresh', data.refresh);
      
      // Guardar hora de inicio de sesión para token refresh
      await AsyncStorage.setItem('lastLogin', Date.now().toString());
      
      // Navegar a la pantalla principal
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      showAlert('Error de inicio de sesión', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/video/fondo_login.mp4')}
        style={StyleSheet.absoluteFill}
        shouldPlay
        isLooping
        resizeMode="cover"
        isMuted
      />
      <View style={styles.overlay}>
        <Text style={globalStyles.brand}>Tarotnautica</Text>

        <Text style={globalStyles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="usuario@correo.com"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
        />

        <Text style={globalStyles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#aaa"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity 
          style={[globalStyles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={globalStyles.buttonText}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
      
      {/* Alerta Personalizada */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    fontFamily: 'TarotBody',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#d6af36',
    fontFamily: 'TarotBody',
    textDecorationLine: 'underline',
  },
});