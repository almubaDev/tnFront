import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';

const CartaTarot = ({ carta = null, imagen, nombre, invertida, onPress, width = 120, height = 200 }) => {
  // Si recibimos un objeto carta completo, lo usamos; de lo contrario, usamos las props individuales
  const cartaImagen = carta?.carta_imagen || imagen;
  const cartaNombre = carta?.carta_nombre || nombre;
  const esInvertida = carta?.invertida || invertida;
  
  // Si no hay ni carta ni propiedades individuales, no mostramos nada
  if (!carta && !imagen && !nombre) {
    console.warn("CartaTarot: No se recibieron datos de carta");
    return (
      <View style={[styles.cartaTarot, { width, height }]}>
        <Text style={styles.errorText}>Carta sin datos</Text>
      </View>
    );
  }

  const imageSource = obtenerImagenCarta(cartaImagen);

  return (
    <TouchableOpacity style={styles.cartaTarot} onPress={onPress}>
      <Image
        source={imageSource}
        style={[
          {
            width,
            height,
          },
          styles.imagenCarta,
          esInvertida && styles.cartaInvertida,
        ]}
        resizeMode="contain"
      />
      {/* <Text style={[styles.nombreCarta, { width }]} numberOfLines={1}>
        {cartaNombre || 'Carta'}
      </Text> */}
    </TouchableOpacity>
  );
};

// Función para obtener la imagen de la carta según su nombre
const obtenerImagenCarta = (nombreImagen) => {
  if (!nombreImagen) return require('../../assets/img/cards/el_loco.jpg');

  const imageMapping = {
    'el_loco.jpg': require('../../assets/img/cards/el_loco.jpg'),
    'el_mago.jpg': require('../../assets/img/cards/el_mago.jpg'),
    'la_sacerdotisa.jpg': require('../../assets/img/cards/la_sacerdotisa.jpg'),
    'la_emperatriz.jpg': require('../../assets/img/cards/la_emperatriz.jpg'),
    'el_emperador.jpg': require('../../assets/img/cards/el_emperador.jpg'),
    'el_sumo_sacerdote.jpg': require('../../assets/img/cards/el_sumo_sacerdote.jpg'),
    'los_enamorados.jpg': require('../../assets/img/cards/los_enamorados.jpg'),
    'el_carro.jpg': require('../../assets/img/cards/el_carro.jpg'),
    'la_fuerza.jpg': require('../../assets/img/cards/la_fuerza.jpg'),
    'el_ermitaño.jpg': require('../../assets/img/cards/el_ermitaño.jpg'),
    'la_rueda_de_la_fortuna.jpg': require('../../assets/img/cards/la_rueda_de_la_fortuna.jpg'),
    'la_justicia.jpg': require('../../assets/img/cards/la_justicia.jpg'),
    'el_colgado.jpg': require('../../assets/img/cards/el_colgado.jpg'),
    'la_muerte.jpg': require('../../assets/img/cards/la_muerte.jpg'),
    'la_templanza.jpg': require('../../assets/img/cards/la_templanza.jpg'),
    'el_diablo.jpg': require('../../assets/img/cards/el_diablo.jpg'),
    'la_torre.jpg': require('../../assets/img/cards/la_torre.jpg'),
    'la_estrella.jpg': require('../../assets/img/cards/la_estrella.jpg'),
    'la_luna.jpg': require('../../assets/img/cards/la_luna.jpg'),
    'el_sol.jpg': require('../../assets/img/cards/el_sol.jpg'),
    'el_juicio.jpg': require('../../assets/img/cards/el_juicio.jpg'),
    'el_mundo.jpg': require('../../assets/img/cards/el_mundo.jpg'),
  };

  return imageMapping[nombreImagen] || require('../../assets/img/cards/el_loco.jpg');
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 12,
  },
  cartaTarot: {
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 10,
  },
  imagenCarta: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  cartaInvertida: {
    transform: [{ rotate: '180deg' }],
  },
  nombreCarta: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#d6af36',
    fontSize: 14,
    fontFamily: 'TarotTitles',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: 10,
  },
});

export default CartaTarot;
