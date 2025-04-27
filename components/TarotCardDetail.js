import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const TarotCardDetail = ({ carta, onClose }) => {
  if (!carta) return null;

  // Mapeo de nombres de imágenes a archivos locales
  const imageMapping = {
    'el_loco.jpg': require('../assets/img/cards/el_loco.jpg'),
    'el_mago.jpg': require('../assets/img/cards/el_mago.jpg'),
    'la_sacerdotisa.jpg': require('../assets/img/cards/la_sacerdotisa.jpg'),
    'la_emperatriz.jpg': require('../assets/img/cards/la_emperatriz.jpg'),
    'el_emperador.jpg': require('../assets/img/cards/el_emperador.jpg'),
    'el_sumo_sacerdote.jpg': require('../assets/img/cards/el_sumo_sacerdote.jpg'),
    'los_enamorados.jpg': require('../assets/img/cards/los_enamorados.jpg'),
    'el_carro.jpg': require('../assets/img/cards/el_carro.jpg'),
    'la_fuerza.jpg': require('../assets/img/cards/la_fuerza.jpg'),
    'el_ermitaño.jpg': require('../assets/img/cards/el_ermitaño.jpg'),
    'la_rueda_de_la_fortuna.jpg': require('../assets/img/cards/la_rueda_de_la_fortuna.jpg'),
    'la_justicia.jpg': require('../assets/img/cards/la_justicia.jpg'),
    'el_colgado.jpg': require('../assets/img/cards/el_colgado.jpg'),
    'la_muerte.jpg': require('../assets/img/cards/la_muerte.jpg'),
    'la_templanza.jpg': require('../assets/img/cards/la_templanza.jpg'),
    'el_diablo.jpg': require('../assets/img/cards/el_diablo.jpg'),
    'la_torre.jpg': require('../assets/img/cards/la_torre.jpg'),
    'la_estrella.jpg': require('../assets/img/cards/la_estrella.jpg'),
    'la_luna.jpg': require('../assets/img/cards/la_luna.jpg'),
    'el_sol.jpg': require('../assets/img/cards/el_sol.jpg'),
    'el_juicio.jpg': require('../assets/img/cards/el_juicio.jpg'),
    'el_mundo.jpg': require('../assets/img/cards/el_mundo.jpg'),
  };
  
  const imageSource = imageMapping[carta.carta_imagen] || require('../assets/img/cards/el_loco.jpg');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>{carta.carta_nombre}</Text>
        {carta.invertida && (
          <Text style={styles.invertidaTexto}>(Invertida)</Text>
        )}
      </View>
      
      <Image
        source={imageSource}
        style={[
          styles.imagen,
          carta.invertida && styles.imagenInvertida
        ]}
        resizeMode="contain"
      />
      
      <ScrollView style={styles.scrollDetalle}>
        <Text style={styles.significadoTitulo}>
          Significado {carta.invertida ? 'Invertido' : 'Normal'}:
        </Text>
        <Text style={styles.significadoTexto}>{carta.significado}</Text>
        
        {carta.posicion && (
          <>
            <Text style={styles.posicionTitulo}>
              Posición en la tirada:
            </Text>
            <Text style={styles.posicionTexto}>
              {carta.posicion}
            </Text>
          </>
        )}
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  titulo: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 20,
  },
  invertidaTexto: {
    fontFamily: 'TarotBody',
    color: '#d9534f',
    fontSize: 16,
    marginTop: 5,
  },
  imagen: {
    width: width * 0.5,
    height: width * 0.75,
    borderRadius: 10,
    marginBottom: 15,
  },
  imagenInvertida: {
    transform: [{ rotate: '180deg' }],
  },
  scrollDetalle: {
    maxHeight: 200,
    width: '100%',
  },
  significadoTitulo: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 16,
    marginBottom: 8,
  },
  significadoTexto: {
    fontFamily: 'TarotBody',
    color: '#fff',
    fontSize: 14,
    textAlign: 'justify',
    marginBottom: 15,
  },
  posicionTitulo: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 16,
    marginBottom: 8,
  },
  posicionTexto: {
    fontFamily: 'TarotBody',
    color: '#fff',
    fontSize: 14,
    marginBottom: 15,
  },
  cerrarBoton: {
    borderColor: '#d6af36',
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 25,
    marginTop: 15,
  },
  cerrarTexto: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 16,
  },
});

export default TarotCardDetail;

