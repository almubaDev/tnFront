import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { API_URL } from '../config'; // o './config' si está en raíz

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🌌 Esta es la pantalla principal 🌌</Text>
      <Pressable onPress={() => navigation.navigate('Tarot')}>
        <Text style={styles.button}>🔮 Ir a Tirada de Tarot</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: 'white', fontSize: 20 },
  button: { color: 'white', fontSize: 18, marginTop: 20, textDecorationLine: 'underline' },
});
