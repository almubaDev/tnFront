import React from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const HistorialModal = ({ visible, onClose, historialTiradas, onSeleccionarTirada }) => {
  if (!historialTiradas || historialTiradas.length === 0) return null;
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHistorialContent}>
          <Text style={styles.modalTitle}>Historial de Tiradas</Text>
          
          <FlatList
            data={historialTiradas}
            keyExtractor={(item, index) => `historial-${index}`}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={styles.historialItem}
                onPress={() => onSeleccionarTirada(item)}
              >
                <Text style={styles.historialFecha}>
                  {new Date(item?.fecha_creacion).toLocaleDateString()} - 
                  {new Date(item?.fecha_creacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
                <Text style={styles.historialTipoTirada}>{item?.tipo_tirada_nombre || 'Tirada'}</Text>
                <Text style={styles.historialPregunta} numberOfLines={1}>
                  {item?.pregunta || 'Sin pregunta'}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.historialLista}
            contentContainerStyle={styles.historialListaContent}
          />
          
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
  modalHistorialContent: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#1f1f2f',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d6af36',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'TarotTitles',
  },
  historialLista: {
    maxHeight: 400,
  },
  historialListaContent: {
    paddingHorizontal: 5,
  },
  historialItem: {
    backgroundColor: 'rgba(214, 175, 54, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(214, 175, 54, 0.3)',
  },
  historialFecha: {
    color: '#999',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'TarotBody',
  },
  historialTipoTirada: {
    color: '#d6af36',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'TarotTitles',
  },
  historialPregunta: {
    color: '#e0e0e0',
    fontSize: 14,
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
});

export default HistorialModal;
