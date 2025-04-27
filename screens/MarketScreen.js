import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchWithAuth } from '../apiHelpers';
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

export default function MarketScreen() {
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

  // Cargar perfil cuando se monta el componente
  useEffect(() => {
    cargarPerfil();
  }, []);

  // Actualizar perfil cada vez que la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      cargarPerfil();
      return () => {
        // Cleanup si es necesario
      };
    }, [])
  );

  const verificarAccesoPociones = () => {
    if (!perfil) return;
    
    if (perfil.tiene_suscripcion) {
      navigation.navigate('SubmenuPociones');
    } else {
      showAlert(
        "Acceso Restringido", 
        "Las pociones místicas son exclusivas para usuarios con suscripción activa.",
        [
          { text: "Cancelar", onPress: () => setAlertVisible(false) },
          { text: "Ver Suscripción", onPress: () => {
            setAlertVisible(false);
            navigation.navigate('SubscriptionScreen');
          }}
        ]
      );
    }
  };

  const opciones = [
    {
      titulo: 'Hechizos de Amor',
      icono: require('../assets/img/icons/potions/amor_icon.png'),
      destino: 'HechizosAmor',
    },
    {
      titulo: 'Hechizos de Dinero',
      icono: require('../assets/img/icons/potions/dinero_icon.png'),
      destino: 'HechizosDinero',
    },
    {
      titulo: 'Hechizos Misceláneos',
      icono: require('../assets/img/icons/potions/magia_icon.png'),
      destino: 'HechizosMiscelaneo',
    },
    {
      titulo: 'Pociones',
      icono: require('../assets/img/icons/potions/pocion_icon.png'),
      accion: verificarAccesoPociones,
      requiereSuscripcion: true
    },
  ];

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/img/backgrounds/fondo_mercado.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={styles.titulo}>Mercado Esotérico</Text>

        <View style={styles.grid}>
          {opciones.map((opcion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.carta,
                opcion.requiereSuscripcion && !perfil?.tiene_suscripcion && styles.cartaRestringida
              ]}
              onPress={() => {
                if (opcion.accion) {
                  opcion.accion();
                } else {
                  navigation.navigate(opcion.destino);
                }
              }}
            >
              <Image source={opcion.icono} style={styles.icono} />
              <Text style={styles.texto}>{opcion.titulo}</Text>
              {opcion.requiereSuscripcion && !perfil?.tiene_suscripcion && (
                <Image 
                  source={require('../assets/img/icons/locked_icon.png')} 
                  style={styles.iconoLock}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
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
  container: { flex: 1 },
  overlay: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  titulo: {
    fontSize: 28,
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    marginBottom: 30,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    gap: 24,
  },
  carta: {
    backgroundColor: 'rgba(28,28,30,0.8)',
    borderRadius: 16,
    alignItems: 'center',
    width: width * 0.4,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#d6af36',
    position: 'relative',
  },
  cartaRestringida: {
    opacity: 0.7,
    borderColor: '#555',
  },
  icono: {
    width: 60,
    height: 60,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  texto: {
    fontFamily: 'TarotBody',
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  iconoLock: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
  }
});