import React from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Alert } from 'react-native';
import { initializePayPalPayment, capturePayPalPayment } from '../services/paypalService';

const PayPalButtonsComponent = ({ amount, gemsAmount, onSuccess, onError }) => {
    const [{ isPending }] = usePayPalScriptReducer();

    const createOrder = async () => {
        try {
            const orderId = await initializePayPalPayment(amount, 'gems', gemsAmount);
            return orderId;
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la orden de PayPal');
            if (onError) {
                onError(error);
            }
            throw error;
        }
    };

    const onApprove = async (data) => {
        try {
            // The actual capture happens via webhook on the backend
            // This is just to update the UI after approval
            const response = await capturePayPalPayment(data.orderID);
            if (onSuccess) {
                onSuccess(response);
            }
            Alert.alert('¡Éxito!', 'El pago se ha completado correctamente');
        } catch (error) {
            Alert.alert('Error', 'No se pudo completar el pago');
            if (onError) {
                onError(error);
            }
        }
    };

    if (isPending) {
        return null;
    }

    return (
        <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => {
                Alert.alert('Error', 'Hubo un error con PayPal');
                if (onError) {
                    onError(err);
                }
            }}
            style={{
                layout: 'horizontal',
                color: 'gold',
                shape: 'rect',
                label: 'pay'
            }}
        />
    );
};

export default PayPalButtonsComponent; 