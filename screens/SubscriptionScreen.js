import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import VideoBackground from '../components/VideoBackground';
import { PAYPAL_CONFIG } from '../config/payment';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SubscriptionScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [{ isPending }] = usePayPalScriptReducer();

  return (
    <VideoBackground source={require('../assets/video/fondo_tienda.mp4')}>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <View style={styles.content}>
            {/* Contenido de suscripción */}
            <PayPalButtons
              style={{ layout: "horizontal" }}
              disabled={processingPayment}
              forceReRender={[selectedPlan]}
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

const styles = StyleSheet.create({
  container: { 
    padding: 20,
    minHeight: '100%',
    justifyContent: 'center',
  },
  content: {
    // ... existing styles ...
  },
  // ... rest of the existing styles ...
});
