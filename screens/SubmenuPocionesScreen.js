import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { fetchWithAuth } from '../apiHelpers';
import { globalStyles } from '../styles/globalStyles';
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

export default function SubmenuPocionesScreen() {
  const navigation = useNavigation();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const response = await fetchWithAuth('/api/perfil/');
        if (response.ok) {
          const data = await response.json();
          setPerfil(data);
        }
      } catch (error) {
        console.error('Error al obtener perfil:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, []);

  // Verificar si el usuario tiene suscripción para acceder a las pociones
  const verificarAcceso = (destino) => {
    if (!perfil) return;
    
    if (perfil.tiene_suscripcion) {
      navigation.navigate(destino);
    } else {
      // Si no tiene suscripción, mostrar mensaje y redirigir a pantalla de suscripción
      showAlert("Acceso Restringido", "Las pociones místicas solo están disponibles para usuarios con suscripción activa.", [
        { 
          text: "Aceptar", 
          onPress: () => {
            setAlertVisible(false);
            navigation.navigate('SubscriptionScreen');
          }
        }
      ]);
    }
  };

  const opciones = [
    {
      titulo: 'Pociones de Amor',
      icono: require('../assets/img/icons/potions/bottles/amor_posion.png'),
      destino: 'PocionesAmor',
    },
    {
      titulo: 'Pociones de Dinero',
      icono: require('../assets/img/icons/potions/bottles/dinero_posion.png'),
      destino: 'PocionesDinero',
    },
    {
      titulo: 'Pociones Misceláneas',
      icono: require('../assets/img/icons/potions/bottles/miscelaneo_posion.png'),
      destino: 'PocionesMiscelaneo',
    },
  ];

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/video/fondo_posion_menu.mp4')}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay}>
        <Text style={styles.titulo}>Laboratario de Pociones</Text>
        <Text style={styles.subtitulo}>Elixires mágicos para cada necesidad</Text>

        <View style={styles.iconContainer}>
          {opciones.map((opcion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconButton}
              onPress={() => verificarAcceso(opcion.destino)}
            >
              <Image source={opcion.icono} style={styles.iconImage} />
              <Text style={styles.iconText}>{opcion.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    padding: 20,
  },
  titulo: {
    fontFamily: 'TarotTitles',
    fontSize: 30,
    color: '#d6af36',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitulo: {
    fontFamily: 'TarotBody',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 15,
    width: width * 0.8,
    borderColor: '#d6af36',
    borderWidth: 1,
  },
  iconImage: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  iconText: {
    fontFamily: 'TarotTitles',
    fontSize: 18,
    color: '#d6af36',
    textAlign: 'center',
  }
});