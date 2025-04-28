import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, Modal, Alert
} from 'react-native';
import { fetchWithAuth } from '../apiHelpers';
import VideoBackground from '../components/VideoBackground';
import CustomAlert from '../components/CustomAlert';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { PAYPAL_CONFIG } from '../config/payment';
import LoadingSpinner from '../components/LoadingSpinner';

const GEM_PACKAGES = [
  { amount: 9.99, gems: 500 },
  { amount: 9.99, gems: 1100 },
  { amount: 19.99, gems: 2400 },
  { amount: 49.99, gems: 6500 },
];

export default function StoreScreen({ navigation }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
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
      const response = await fetchWithAuth('/perfil/');
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

  useEffect(() => {
    cargarPerfil();
  }, []);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePaymentSuccess = async (response) => {
    try {
      // Actualizar el estado local después de una compra exitosa
      const updatedProfileResponse = await fetchWithAuth('/perfil/');
      if (updatedProfileResponse.ok) {
        const data = await updatedProfileResponse.json();
        setPerfil(data);
      }
      
      Alert.alert('¡Compra exitosa!', `Has adquirido ${selectedPackage.gems} gemas`);
      setSelectedPackage(null);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      Alert.alert('Error', 'Hubo un problema al procesar tu pago');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Error en el pago:', error);
    Alert.alert('Error', 'No se pudo completar el pago');
  };

  return (
    <VideoBackground source={require('../assets/video/fondo_tienda.mp4')}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Tienda de Gemas</Text>

        {loading ? (
          <LoadingSpinner message="Cargando tienda..." />
        ) : (
          <>
            {perfil && (
              <Text style={styles.subtitulo}>Gemas disponibles: {perfil.gemas}</Text>
            )}

            <Text style={styles.seccionTitulo}>Selecciona un paquete de gemas:</Text>

            {GEM_PACKAGES.map((pkg, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tarjeta,
                  selectedPackage === pkg && styles.selectedPackage
                ]}
                onPress={() => handlePackageSelect(pkg)}
              >
                <Image 
                  source={require('../assets/img/gem_packs/pack_50.png')}
                  style={styles.gemIcon}
                  resizeMode="contain"
                />
                <View style={styles.paqueteInfo}>
                  <Text style={styles.cantidad}>{pkg.gems} Gemas</Text>
                  <Text style={styles.precio}>${pkg.amount} USD</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => navigation.navigate('SubscriptionScreen')}
              style={styles.suscripcionBoton}
            >
              <Image
                source={require('../assets/img/icons/subscription_icon.png')}
                style={styles.icono}
              />
              <Text style={styles.suscripcionTexto}>
                {perfil?.tiene_suscripcion
                  ? 'Gestionar suscripción'
                  : 'Suscribirme por $9.99'}
              </Text>
            </TouchableOpacity>

            {selectedPackage && (
              <View style={styles.paymentSection}>
                <Text style={styles.paymentTitle}>Selecciona tu método de pago:</Text>
                
                <PayPalButtons
                  amount={selectedPackage.amount}
                  gemsAmount={selectedPackage.gems}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </VideoBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    paddingBottom: 60
  },
  titulo: {
    fontFamily: 'TarotTitles',
    fontSize: 26,
    color: '#d6af36',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitulo: {
    fontFamily: 'TarotBody',
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  seccionTitulo: {
    fontFamily: 'TarotTitles',
    fontSize: 18,
    color: '#d6af36',
    marginBottom: 15,
  },
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d6af36',
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedPackage: {
    backgroundColor: '#3a3a3a',
    borderWidth: 2,
  },
  gemIcon: {
    width: 40,
    height: 40,
    marginRight: 10
  },
  paqueteInfo: {
    flex: 1
  },
  cantidad: {
    fontFamily: 'TarotTitles',
    fontSize: 18,
    color: '#d6af36',
  },
  precio: {
    fontFamily: 'TarotBody',
    color: '#fff',
    fontSize: 14
  },
  suscripcionBoton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderColor: '#d6af36',
    borderWidth: 2,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  suscripcionTexto: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 16,
    marginLeft: 10,
  },
  icono: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  paymentSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(42, 42, 42, 0.7)',
    borderRadius: 10,
    borderColor: '#d6af36',
    borderWidth: 1
  },
  paymentTitle: {
    color: '#d6af36',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'TarotTitles',
  },
});