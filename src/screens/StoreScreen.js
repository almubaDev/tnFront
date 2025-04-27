import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import VideoBackground from '../components/VideoBackground';
import { PAYPAL_CONFIG } from '../config/payment';

export default function StoreScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [selectedGems, setSelectedGems] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [{ isPending }] = usePayPalScriptReducer();

  const cargarPerfil = async () => {   
    // ... existing code ...
  };

  return (
    <VideoBackground source={require('../assets/video/fondo_tienda.mp4')}>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <View style={styles.content}>
            <Text style={styles.securityText}>
              Tu pago será procesado de forma segura por PayPal, líder mundial en procesamiento de pagos.
            </Text>
            <PayPalButtons
              style={{ layout: "horizontal" }}
              disabled={processingPayment}
              forceReRender={[selectedGems]}
              fundingSource="paypal"
              createOrder={(data, actions) => {
                // ... existing PayPal code ...
              }}
              onApprove={async (data, actions) => {
                // ... existing PayPal code ...
              }}
            />
          </View>
        )}
      </ScrollView>
    </VideoBackground>
  );
} 