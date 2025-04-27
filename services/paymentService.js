import { fetchWithAuth } from '../apiHelpers';

export const createPayPalOrder = async (amount) => {
  try {
    const response = await fetchWithAuth('/crear-orden-paypal/', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
    
    if (!response.ok) {
      throw new Error('Error al crear la orden de PayPal');
    }
    
    const data = await response.json();
    return data.orderId;
  } catch (error) {
    console.error('Error en createPayPalOrder:', error);
    throw error;
  }
};

export const processPayPalPayment = async (orderId) => {
  try {
    const response = await fetchWithAuth('/procesar-pago-paypal/', {
      method: 'POST',
      body: JSON.stringify({ orderId })
    });
    
    if (!response.ok) {
      throw new Error('Error al procesar el pago de PayPal');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en processPayPalPayment:', error);
    throw error;
  }
}; 