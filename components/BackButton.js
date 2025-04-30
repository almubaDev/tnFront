import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BackButton({ style }) {
  const navigation = useNavigation();
  
  const handleGoBack = () => {
    // Simplemente usar la función goBack del navegador
    navigation.goBack();
  };

  return (
    <TouchableOpacity 
      style={[styles.backButton, style]} 
      onPress={handleGoBack}
    >
      <Ionicons name="arrow-back" size={24} color="#000" />
      <Text style={styles.backText}>Volver</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
    backgroundColor: '#d6af36' ,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  backText: {
    color:'rgba(0,0,0,0.5)' ,
    fontFamily: 'TarotTitles',
    fontSize: 16,
    marginLeft: 5,
  }
});