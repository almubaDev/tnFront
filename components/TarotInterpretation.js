import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions 
} from 'react-native';

const { width, height } = Dimensions.get('window');

const TarotInterpretation = ({ tirada, onClose }) => {
  if (!tirada) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Interpretación de tu Tirada</Text>
      <Text style={styles.tipoTirada}>{tirada.tipo_tirada_nombre}</Text>
      <Text style={styles.pregunta}>"{tirada.pregunta}"</Text>
      
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.interpretacionTexto}>
          {tirada.interpretacion}
        </Text>
      </ScrollView>
      
      <TouchableOpacity
        style={styles.cerrarBoton}
        onPress={onClose}
      >
        <Text style={styles.cerrarTexto}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '85%',
    borderColor: '#d6af36',
    borderWidth: 2,
  },
  titulo: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  tipoTirada: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  pregunta: {
    fontFamily: 'TarotBody',
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 15,
  },
  scrollContainer: {
    maxHeight: height * 0.5,
  },
  interpretacionTexto: {
    fontFamily: 'TarotBody',
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  cerrarBoton: {
    borderColor: '#d6af36',
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 25,
    marginTop: 20,
    alignSelf: 'center',
  },
  cerrarTexto: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 16,
  },
});

export default TarotInterpretation;