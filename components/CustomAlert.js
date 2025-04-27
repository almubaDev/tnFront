// components/CustomAlert.js
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';

export default function CustomAlert({ 
  visible, 
  title, 
  message, 
  onClose,
  buttons = [{ text: 'Aceptar', onPress: onClose }]
}) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  index === buttons.length - 1 ? styles.primaryButton : styles.secondaryButton
                ]}
                onPress={button.onPress}
              >
                <Text 
                  style={[
                    styles.buttonText,
                    index === buttons.length - 1 ? styles.primaryButtonText : styles.secondaryButtonText
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderColor: '#d6af36',
    borderWidth: 2,
  },
  title: {
    fontFamily: 'TarotTitles',
    fontSize: 20,
    color: '#d6af36',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'TarotBody',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  button: {
    padding: 10,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#d6af36',
  },
  secondaryButton: {
    borderColor: '#d6af36',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontFamily: 'TarotTitles',
    fontSize: 16,
  },
  primaryButtonText: {
    color: '#000000',
  },
  secondaryButtonText: {
    color: '#d6af36',
  },
});