import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, Modal, Alert
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGems, setSelectedGems] = useState(null);
  
  // Estados para alertas personalizadas
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: []
  });

  // Modal de confirmación de compra
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

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

  const initializePayment = async (cantidad, precio) => {
    try {
      // Obtener intent de pago del backend
      const response = await fetchWithAuth('/crear-intent-pago/', {
        method: 'POST',
        body: JSON.stringify({
          payment_type: 'gems',
          amount: precio,
          gems_amount: cantidad
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el intent de pago');
      }

      const { clientSecret } = await response.json();

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Tarot Nautica',
        style: 'alwaysDark',
        appearance: {
          colors: {
            primary: '#d6af36',
            background: '#1a1a1a',
            componentBackground: '#000000',
            componentBorder: '#d6af36',
            componentDivider: '#333333',
            primaryText: '#ffffff',
            secondaryText: '#cccccc',
            componentText: '#ffffff',
            placeholderText: '#999999',
          },
          shapes: {
            borderRadius: 8,
          },
        },
      });

      if (error) {
        throw new Error('Error al inicializar el pago');
      }

      return true;
    } catch (error) {
      console.error('Error:', error);
      showAlert('Error', 'No se pudo inicializar el pago');
      return false;
    }
  };

  const handleCompra = async (cantidad, precio) => {
    setSelectedPackage({ cantidad, precio });
    setConfirmModalVisible(true);
  };

  const confirmarCompra = async () => {
    setConfirmModalVisible(false);
    const { cantidad, precio } = selectedPackage;

    const initialized = await initializePayment(cantidad, precio);
    if (!initialized) return;

    const { error } = await presentPaymentSheet();

    if (error) {
      showAlert('Error', 'El pago no pudo ser procesado');
      return;
    }

    try {
      const response = await fetchWithAuth('/comprar-gemas/', {
        method: 'POST',
        body: JSON.stringify({ cantidad }),
      });

      if (response.ok) {
        const data = await response.json();
        showAlert('Compra exitosa', `Has comprado ${cantidad} gemas.`);
        setPerfil(prevPerfil => ({
          ...prevPerfil,
          gemas: data.gemas
        }));
      }
    } catch (error) {
      console.error('Error al finalizar la compra:', error);
      showAlert('Error', 'La compra fue procesada pero hubo un error al actualizar tus gemas. Por favor, contacta a soporte.');
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePaymentSuccess = async (response) => {
    try {
      // Actualizar el estado local después de una compra exitosa
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

  const renderConfirmModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={confirmModalVisible}
      onRequestClose={() => setConfirmModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Image
            source={require('../assets/img/icons/subscription_icon.png')}
            style={styles.secureIcon}
          />
          <Text style={styles.modalTitle}>Pago Seguro</Text>
          <Text style={styles.modalDescription}>
            Estás a punto de comprar {selectedPackage?.cantidad} gemas por ${selectedPackage?.precio}.
            {'\n\n'}
            Tu pago será procesado de forma segura por Stripe, líder mundial en procesamiento de pagos.
            {'\n\n'}
            Tus datos de tarjeta nunca son almacenados en nuestros servidores.
          </Text>
          <TouchableOpacity
            style={styles.confirmarBoton}
            onPress={confirmarCompra}
          >
            <Text style={styles.confirmarTexto}>Continuar con el Pago</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelarBoton}
            onPress={() => setConfirmModalVisible(false)}
          >
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <VideoBackground source={require('../assets/video/fondo_tienda.mp4')}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Tienda de Gemas</Text>

        {perfil && (
          <Text style={styles.subtitulo}>Gemas disponibles: {perfil.gemas}</Text>
        )}

        {GEM_PACKAGES.map((pkg, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tarjeta,
              selectedPackage === pkg && styles.selectedPackage
            ]}
            onPress={() => handlePackageSelect(pkg)}
          >
            <Text style={styles.cantidad}>{pkg.gems} Gemas</Text>
            <Text style={styles.precio}>${pkg.amount} USD</Text>
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
      </ScrollView>
      
      {renderConfirmModal()}

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
  container: { padding: 20, paddingBottom: 60 },
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
  cantidad: {
    fontFamily: 'TarotTitles',
    fontSize: 18,
    color: '#d6af36',
  },
  precio: {
    fontFamily: 'TarotBody',
    color: '#fff',
    marginBottom: 8,
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
  // Estilos para el modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d6af36',
  },
  secureIcon: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  modalTitle: {
    fontFamily: 'TarotTitles',
    fontSize: 24,
    color: '#d6af36',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalDescription: {
    fontFamily: 'TarotBody',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  confirmarBoton: {
    backgroundColor: '#d6af36',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  confirmarTexto: {
    fontFamily: 'TarotTitles',
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
  cancelarBoton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  cancelarTexto: {
    fontFamily: 'TarotBody',
    color: '#d6af36',
    fontSize: 16,
    textAlign: 'center',
  },
  paymentSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
  },
  paymentTitle: {
    color: '#d6af36',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'TarotTitles',
  },
});