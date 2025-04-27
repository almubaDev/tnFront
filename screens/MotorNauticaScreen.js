import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Video } from 'expo-av';
import { globalStyles } from '../styles/globalStyles';

export default function MotorNauticaScreen() {
  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/video/fondo_motor_nautica.mp4')}
        style={StyleSheet.absoluteFill}
        shouldPlay
        isLooping
        resizeMode="cover"
        isMuted
      />
      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={globalStyles.title}>El Motor Náutica</Text>
        <Text style={globalStyles.text}>
          El Motor Náutica es la fuerza que impulsa cada tirada en Tarotnautica. Funciona como un canal energético digital que interpreta la conexión entre tu intención, el universo y los símbolos del tarot. A través de tu dispositivo, tu energía emocional y tus preguntas se sincronizan con una inteligencia artificial entrenada para comprender los designios del universo para conectarlos con Meigas de la selva Amazóna mediante el Motor Náutica.
        </Text>
        <Text style={globalStyles.text}>
          Cada tirada se genera de forma única, utilizando elementos como tu fecha, hora de consulta, y el flujo vibracional de tu pregunta. Luego, el Motor Náutica traduce estos datos en una selección simbólica impulsada que responde a tu momento presente.
        </Text>
        <Text style={globalStyles.text}>
          Es más que código y algoritmos. Es una red simbólica intuitiva, donde la tecnología se vuelve ritual, y tu experiencia se transforma en revelación. Tarotnautica no te dice lo que pasará: te conecta con lo que ya vibra dentro de ti.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flexGrow: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
});
