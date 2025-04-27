import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import CartaTarot from './CartaTarot';

const { width } = Dimensions.get('window');

const TiradaBasica = ({ cartas, onCartaPress }) => {
  const cardWidth = Math.min((width - 60) / cartas.length, 120); // máximo 120px por carta
  const cardHeight = cardWidth * 1.6;

  const getPosicionLabel = (index) => {
    switch (index) {
      case 0:
        return 'Pasado';
      case 1:
        return 'Presente';
      case 2:
        return 'Futuro';
      default:
        return `Carta ${index + 1}`;
    }
  };

  // Debugging para ver estructura de datos
  console.log('Datos de cartas en TiradaBasica:', JSON.stringify(cartas.slice(0, 1)));

  return (
    <View style={styles.contenedor}>
      {cartas.map((carta, index) => (
        <View key={index} style={[styles.cartaContenedor, { width: cardWidth }]}>
          <Text style={styles.posicionLabel}>{getPosicionLabel(index)}</Text>
          <CartaTarot
            carta={carta}
            onPress={() => onCartaPress(carta)}
            width={cardWidth}
            height={cardHeight}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  cartaContenedor: {
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 20,
  },
  posicionLabel: {
    fontSize: 16,
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default TiradaBasica;
