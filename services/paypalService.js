import { fetchWithAuth } from '../apiHelpers';

export const initializePayPalPayment = async (amount, type = 'gems', gemsAmount = 0) => {
  try {
    // Crear orden de pago en el backend
    const response = await fetchWithAuth('/paypal/payment/create/', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        gems_amount: gemsAmount
      }),
    });

    if (!response.ok) {
      throw new Error('Error al crear la orden de pago');
    }

    const data = await response.json();
    // Extract orderID from PayPal response
    const orderID = data.order_id;
    return orderID;

  } catch (error) {
    console.error('Error al inicializar el pago:', error);
    throw error;
  }
};

export const capturePayPalPayment = async (orderID) => {
  try {
    // Backend handles capture via webhook, this just updates the UI
    const response = await fetchWithAuth('/comprar-gemas/', {
      method: 'POST',
      body: JSON.stringify({ 
        cantidad: 0,  // This will be overridden by the webhook based on the payment
        order_id: orderID 
      }),
    });

    if (!response.ok) {
      throw new Error('Error al procesar la compra');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al capturar el pago:', error);
    throw error;
  }
};

export const createSubscription = async (subscriptionId) => {
  try {
    const response = await fetchWithAuth('/paypal/subscription/create/', {
      method: 'POST',
      body: JSON.stringify({ subscription_id: subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Error al crear la suscripción');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear la suscripción:', error);
    throw error;
  }
};

export const cancelSubscription = async () => {
  try {
    // Use the standard endpoint that works for both payment providers
    const response = await fetchWithAuth('/cancelar-suscripcion/', {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Error al cancelar la suscripción');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al cancelar la suscripción:', error);
    throw error;
  }
}; 