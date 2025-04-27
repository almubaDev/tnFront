import React from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const PreguntaModal = ({
  visible,
  onClose,
  onBack,
  onConfirm,
  pregunta,
  setPregunta,
  tipoTiradaSeleccionado
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalPreguntaContent}>
          <Text style={styles.modalTitle}>Tu Pregunta</Text>

          {tipoTiradaSeleccionado && (
            <Text style={styles.tiradaSeleccionadaText}>
              Tirada: {tipoTiradaSeleccionado.nombre}
            </Text>
          )}

          <Text style={styles.modalLabel}>¿Qué deseas preguntar al Tarot?</Text>
          <TextInput
            style={styles.preguntaInput}
            placeholder="Escribe tu pregunta aquí..."
            placeholderTextColor="#aaa"
            multiline={true}
            maxLength={200}
            value={pregunta}
            onChangeText={setPregunta}
          />
          <Text style={styles.contadorCaracteres}>{pregunta.length}/200</Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[
                styles.confirmarButton,
                (!pregunta.trim()) && styles.confirmarButtonDisabled
              ]}
              disabled={!pregunta.trim()}
              onPress={onConfirm}
            >
              <Text style={styles.confirmarButtonText}>Consultar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelarButton}
              onPress={onBack}
            >
              <Text style={styles.cancelarButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
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
  modalPreguntaContent: {
    width: '85%',
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
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'TarotTitles',
  },
  tiradaSeleccionadaText: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'TarotBody',
  },
  modalLabel: {
    fontSize: 16,
    color: '#d6af36',
    marginBottom: 10,
    fontFamily: 'TarotBody',
  },
  preguntaInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#d6af36',
    fontFamily: 'TarotBody',
  },
  contadorCaracteres: {
    alignSelf: 'flex-end',
    color: '#999',
    marginTop: 5,
    marginBottom: 20,
    fontFamily: 'TarotBody',
  },
  modalButtons: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 10,
  },
  confirmarButton: {
    backgroundColor: '#e0be4b',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#d6af36',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  cancelarButton: {
    backgroundColor: '#555',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#666',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  cancelarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'TarotTitles',
  },
  confirmarButtonText: {
    color: '#1f1f2f',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'TarotTitles',
  },
  confirmarButtonDisabled: {
    backgroundColor: '#9e9e9e',
    opacity: 0.7,
    borderColor: '#888',
  },
});

export default PreguntaModal;
