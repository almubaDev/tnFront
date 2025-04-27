import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import { globalStyles } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/video/fondo_bienvenida.mp4')}
        style={StyleSheet.absoluteFill}
        shouldPlay
        isLooping
        resizeMode="cover"
        isMuted
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Tarotnautica</Text>
        <Text style={globalStyles.subtitle}>
          Nuestro Motor Náutica abre un portal místico donde el antiguo arte del tarot se entrelaza con el mundo digital. 
        </Text>
        <TouchableOpacity 
          style={[styles.button, styles.loginButton]} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonTextLog}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.registerButton]} 
          onPress={() => navigation.navigate('Registro')}
        >
          <Text style={styles.buttonText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'TarotTitles',
    fontSize: 34,
    color: '#d6af36',
    marginBottom: 30,
    marginTop: 60,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 15,
    minWidth: 200,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#d6af36',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  buttonText: {
    color: '#d6af36',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'TarotBody',
  },

  buttonTextLog: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'TarotBody',
  },
});