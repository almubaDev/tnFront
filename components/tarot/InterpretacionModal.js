import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';

const InterpretacionModal = ({ tirada, visible, onClose }) => {
  const [interpretacionCargando, setInterpretacionCargando] = useState(false);
  const [errorInterpretacion, setErrorInterpretacion] = useState(false);
  
  useEffect(() => {
    if (visible && tirada) {
      // Verificar si hay alguna interpretación disponible
      if (!tirada.interpretacion && !tirada.interpretacion_general) {
        // Debug para indicar que no hay interpretación disponible
        console.log("Interpretación no disponible para la tirada:", JSON.stringify(tirada));
        setErrorInterpretacion(true);
      } else {
        setErrorInterpretacion(false);
      }
    }
  }, [visible, tirada]);
  
  if (!tirada) return null;
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalInterpretacionContent}>
          <Text style={styles.interpretacionTitulo}>Interpretación de tu Tirada</Text>
          <Text style={styles.interpretacionPregunta}>"{tirada?.pregunta || ''}"</Text>
          
          {interpretacionCargando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#d6af36" />
              <Text style={styles.loadingText}>Cargando interpretación...</Text>
            </View>
          ) : (
            <ScrollView style={styles.interpretacionScroll}>
              {/* Interpretación general */}
              <View style={styles.seccionInterpretacion}>
                <Text style={styles.seccionTitulo}>Interpretación General</Text>
                {errorInterpretacion ? (
                  <Text style={styles.errorText}>
                    No se pudo cargar la interpretación. Verifica la conexión con el servidor 
                    o si tu plan de suscripción incluye interpretaciones.
                  </Text>
                ) : (
                  <Text style={styles.seccionTexto}>{tirada?.interpretacion || tirada?.interpretacion_general || 'Sin interpretación disponible'}</Text>
                )}
              </View>
              
              {/* Interpretación específica de cada carta */}
              <View style={styles.seccionInterpretacion}>
                <Text style={styles.seccionTitulo}>Cartas y sus Significados</Text>
                {tirada?.cartas && tirada.cartas.length > 0 ? (
                  tirada.cartas.map((carta, index) => (
                    <View key={index} style={styles.cartaInterpretacion}>
                      <Text style={styles.cartaNombre}>
                        {carta?.carta_nombre || 'Carta'} 
                        {carta?.invertida ? ' (Invertida)' : ''}
                      </Text>
                      <Text style={styles.cartaSignificado}>{carta?.significado || 'Sin significado disponible'}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.sinDatos}>No hay cartas disponibles</Text>
                )}
              </View>
              
              {/* Consejos */}
              {tirada?.consejos && (
                <View style={styles.seccionInterpretacion}>
                  <Text style={styles.seccionTitulo}>Consejos</Text>
                  <Text style={styles.seccionTexto}>{tirada.consejos}</Text>
                </View>
              )}
            </ScrollView>
          )}
          
          <TouchableOpacity
            style={styles.cerrarButton}
            onPress={onClose}
          >
            <Text style={styles.cerrarButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalInterpretacionContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#1f1f2f',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  interpretacionTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d6af36',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'TarotTitles',
  },
  interpretacionPregunta: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'TarotBody',
  },
  interpretacionScroll: {
    maxHeight: 400,
  },
  seccionInterpretacion: {
    marginBottom: 20,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 10,
    fontFamily: 'TarotTitles',
  },
  seccionTexto: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 22,
    fontFamily: 'TarotBody',
  },
  cartaInterpretacion: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(214, 175, 54, 0.1)',
    borderRadius: 5,
  },
  cartaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 5,
    fontFamily: 'TarotTitles',
  },
  cartaSignificado: {
    fontSize: 15,
    color: '#e0e0e0',
    lineHeight: 20,
    fontFamily: 'TarotBody',
  },
  sinDatos: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    fontFamily: 'TarotBody',
  },
  cerrarButton: {
    backgroundColor: '#d6af36',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
    alignSelf: 'center',
  },
  cerrarButtonText: {
    color: '#1f1f2f',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TarotBody',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#d6af36',
    fontSize: 16,
    fontFamily: 'TarotBody',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    lineHeight: 22,
    fontFamily: 'TarotBody',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
});

export default InterpretacionModal;