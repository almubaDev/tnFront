import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Video } from 'expo-av';
import { globalStyles } from '../styles/globalStyles';
import { API_URL } from '../config';
import CustomAlert from '../components/CustomAlert';

export default function RegistroScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
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

  const validarFormulario = () => {
    let errores = {};
    let esValido = true;

    if (!email.trim()) {
      errores.email = 'El correo electrónico es obligatorio';
      esValido = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errores.email = 'El correo electrónico no es válido';
      esValido = false;
    }

    if (!password.trim()) {
      errores.password = 'La contraseña es obligatoria';
      esValido = false;
    } else if (password.length < 8) {
      errores.password = 'La contraseña debe tener al menos 8 caracteres';
      esValido = false;
    }

    if (password !== password2) {
      errores.password2 = 'Las contraseñas no coinciden';
      esValido = false;
    }

    setErrors(errores);
    return esValido;
  };

  const handleRegistro = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/registro/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email,
          username: email,  // 🔥 Importantísimo: agregar username igual a email
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert(
          'Registro exitoso',
          'Tu cuenta ha sido creada con éxito. Ahora puedes iniciar sesión.',
          [{ 
            text: 'OK', 
            onPress: () => {
              setAlertVisible(false);
              navigation.navigate('Login');
            }
          }]
        );
      } else {
        // Manejar errores del servidor
        let mensajeError = 'Error durante el registro';
        
        if (data.email) {
          mensajeError = data.email[0];
        } else if (data.password) {
          mensajeError = data.password[0];
        } else if (data.non_field_errors) {
          mensajeError = data.non_field_errors[0];
        }
        
        showAlert('Error', mensajeError);
      }
    } catch (error) {
      console.error('Error durante el registro:', error);
      showAlert('Error', 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
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
      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={globalStyles.brand}>Tarotnautica</Text>
        <Text style={styles.subtitle}>Registro de Usuario</Text>

        <Text style={globalStyles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="usuario@correo.com"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={globalStyles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#aaa"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <Text style={globalStyles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#aaa"
          secureTextEntry
          onChangeText={setPassword2}
          value={password2}
        />
        {errors.password2 && <Text style={styles.errorText}>{errors.password2}</Text>}

        <TouchableOpacity 
          style={[globalStyles.button, loading && styles.buttonDisabled]} 
          onPress={handleRegistro}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            ¿Ya tienes una cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
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
  container: { 
    flex: 1 
  },
  overlay: {
    flexGrow: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  subtitle: {
    fontFamily: 'TarotTitles',
    fontSize: 22,
    color: '#d6af36',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontFamily: 'TarotBody',
  },
  errorText: {
    color: '#ff6b6b',
    fontFamily: 'TarotBody',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 15,
    paddingLeft: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginLink: {
    marginTop: 20,
    alignSelf: 'center',
  },
  loginLinkText: {
    color: '#d6af36',
    fontFamily: 'TarotBody',
    textDecorationLine: 'underline',
  },
});