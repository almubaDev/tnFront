import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { fetchWithAuth } from '../apiHelpers';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';
import { sessionEvents } from '../App';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [tiposTirada, setTiposTirada] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  
  // Estados para alertas personalizadas
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

  const loadData = async () => {
    try {
      // Cargar perfil
      const profileResponse = await fetchWithAuth('/perfil/');
      
      // Cargar tipos de tirada
      const tiposTiradaResponse = await fetchWithAuth('/listar-tipos-tirada/');
      
      // Check for auth reset event
      if (profileResponse.authReset || tiposTiradaResponse.authReset) {
        console.log('Auth reset detected in ProfileScreen');
        sessionEvents.emit('authReset');
        return;
      }
      
      if (profileResponse.ok && tiposTiradaResponse.ok) {
        const profileData = await profileResponse.json();
        const tiposTiradaData = await tiposTiradaResponse.json();
        
        setProfile(profileData);
        setTiposTirada(tiposTiradaData);
      } else if (profileResponse.status === 401 || tiposTiradaResponse.status === 401) {
        // Handle session expiration
        showAlert(
          'Sesión expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [{
            text: 'Aceptar',
            onPress: async () => {
              setAlertVisible(false);
              await AsyncStorage.removeItem('access');
              await AsyncStorage.removeItem('refresh');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          }]
        );
      } else {
        console.error('Error al cargar datos:', 
          profileResponse.status, tiposTiradaResponse.status);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );
  
  const handleLogout = async () => {
    showAlert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar tu sesión?",
      [
        {
          text: "Cancelar",
          onPress: () => setAlertVisible(false)
        },
        {
          text: "Cerrar Sesión",
          onPress: async () => {
            setAlertVisible(false);
            try {
              // Eliminar tokens de sesión
              await AsyncStorage.removeItem('access');
              await AsyncStorage.removeItem('refresh');
              // Navegar a pantalla de bienvenida
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/video/fondo_perfil.mp4')}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay}>
        <Text style={globalStyles.title}>Información del Consultante</Text>
        {loading ? (
          <ActivityIndicator color="#d6af36" size="large" />
        ) : profile ? (
          <View style={styles.card}>
            <View style={styles.gemsContainer}>
              <Image 
                source={require('../assets/img/gem_packs/pack_50.png')} 
                style={styles.gemImage}
                resizeMode="contain" 
              />
              <View style={styles.gemsTextContainer}>
                <Text style={globalStyles.label}>Gemas:</Text>
                <Text style={globalStyles.value}>{profile.gemas}</Text>
              </View>
            </View>

            <Text style={globalStyles.label}>Suscripción:</Text>
            <Text style={globalStyles.value}>{profile.tiene_suscripcion ? 'Activa' : 'Inactiva'}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MotorNauticaScreen')}
              style={styles.button}
            >
              <Text style={styles.buttonText}>¿Qué es el Motor Náutica?</Text>
            </TouchableOpacity>
            
            {/* Botón de cerrar sesión */}
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.error}>No se pudo cargar el perfil</Text>
        )}
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
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    borderColor: '#d6af36',
    borderWidth: 1.5,
  },
  gemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  gemImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  gemsTextContainer: {
    flex: 1,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#d6af36',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center'
  },
  buttonText: {
    color: '#000',
    fontFamily: 'TarotTitles',
  },
  logoutButton: {
    marginTop: 25,
    backgroundColor: 'rgba(139, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  logoutButtonText: {
    color: '#fff',
    fontFamily: 'TarotTitles',
  },
  error: {
    color: '#ffffff',
    fontFamily: 'TarotBody',
    marginTop: 20,
  }
});
