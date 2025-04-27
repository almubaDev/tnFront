import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import CartaTarot from './CartaTarot';

const { width } = Dimensions.get('window');

const TiradaProfunda = ({ cartas, onCartaPress }) => {
  const cardWidth = Math.min((width - 60) / 2, 150); // 2 cartas por fila
  const cardHeight = cardWidth * 1.6;

  const posiciones = [
    'Situación actual',
    'Desafío',
    'Pasado cercano',
    'Futuro cercano',
    'Meta consciente',
    'Influencia inconsciente',
    'Tú en la situación',
    'Entorno',
    'Esperanzas y miedos',
    'Resultado final'
  ];

  // Debugging para ver estructura de datos
  console.log('Datos de cartas en TiradaProfunda:', JSON.stringify(cartas.slice(0, 1)));

  return (
    <View style={styles.contenedor}>
      {cartas.map((carta, index) => (
        <View key={index} style={[styles.cartaContenedor, { width: cardWidth }]}>
          <Text style={styles.posicionLabel}>
            {posiciones[index] || `Carta ${index + 1}`}
          </Text>
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 15,
  },
  cartaContenedor: {
    alignItems: 'center',
    margin: 10,
  },
  posicionLabel: {
    fontSize: 14,
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default TiradaProfunda;
