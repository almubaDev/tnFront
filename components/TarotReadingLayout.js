import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image 
} from 'react-native';

const { width } = Dimensions.get('window');

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

// Componente para una carta individual
const CartaTarot = ({ carta, onPress }) => {
  const imageSource = imageMapping[carta.carta_imagen] || require('../assets/img/cards/el_loco.jpg');
  
  return (
    <TouchableOpacity style={styles.cartaTarot} onPress={onPress}>
      <Image
        source={imageSource}
        style={[
          styles.imagenCarta,
          carta.invertida && styles.cartaInvertida
        ]}
        resizeMode="contain"
      />
      <Text style={styles.nombreCarta}>{carta.carta_nombre}</Text>
    </TouchableOpacity>
  );
};

const TarotReadingLayout = ({ tirada, tipo, onCartaPress }) => {
  if (!tirada || !tirada.cartas || tirada.cartas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay cartas disponibles</Text>
      </View>
    );
  }

  // Determinar tipo de tirada
  const tipoTirada = tipo || 
    (tirada.tipo_tirada_nombre?.toLowerCase().includes('básica') ? 'basica' : 
    tirada.tipo_tirada_nombre?.toLowerCase().includes('claridad') ? 'claridad' : 'profunda');

  // Renderiza el layout según tipo
  switch (tipoTirada) {
    case 'basica':
      return renderTiradaBasica();
    case 'claridad':
      return renderTiradaClaridad();
    case 'profunda':
      return renderTiradaProfunda();
    default:
      return renderGenerico();
  }

  // Renderiza tirada básica (Pasado-Presente-Futuro)
  function renderTiradaBasica() {
    const cartas = tirada.cartas;
    const posiciones = ['Pasado', 'Presente', 'Futuro'];
    
    return (
      <View style={styles.tiradaBasicaContainer}>
        {cartas.map((carta, index) => (
          <View key={index} style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[index]}</Text>
            <CartaTarot
              carta={carta}
              onPress={() => onCartaPress(carta)}
            />
          </View>
        ))}
      </View>
    );
  }

  // Renderiza tirada de claridad (Cruz)
  function renderTiradaClaridad() {
    const cartas = tirada.cartas;
    if (cartas.length < 6) return renderGenerico();

    const posiciones = [
      'Situación General', 'Obstáculo Principal', 'Influencia Consciente',
      'Influencia Inconsciente', 'Consejo', 'Resultado Potencial'
    ];

    return (
      <View style={styles.tiradaClaridadContainer}>
        {/* Carta Superior - Consciente */}
        <View style={styles.tiradaClaridadRow}>
          <View style={styles.espacioVacio} />
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[2]}</Text>
            <CartaTarot carta={cartas[2]} onPress={() => onCartaPress(cartas[2])} />
          </View>
          <View style={styles.espacioVacio} />
        </View>
        
        {/* Fila central - Pasado, Situación, Futuro */}
        <View style={styles.tiradaClaridadRow}>
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[4]}</Text>
            <CartaTarot carta={cartas[4]} onPress={() => onCartaPress(cartas[4])} />
          </View>
          
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[0]}</Text>
            <CartaTarot carta={cartas[0]} onPress={() => onCartaPress(cartas[0])} />
          </View>
          
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[5]}</Text>
            <CartaTarot carta={cartas[5]} onPress={() => onCartaPress(cartas[5])} />
          </View>
        </View>
        
        {/* Carta Inferior - Inconsciente */}
        <View style={styles.tiradaClaridadRow}>
          <View style={styles.espacioVacio} />
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[3]}</Text>
            <CartaTarot carta={cartas[3]} onPress={() => onCartaPress(cartas[3])} />
          </View>
          <View style={styles.espacioVacio} />
        </View>

        {/* Carta Obstáculo */}
        <View style={styles.tiradaClaridadRow}>
          <View style={styles.espacioVacio} />
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[1]}</Text>
            <CartaTarot carta={cartas[1]} onPress={() => onCartaPress(cartas[1])} />
          </View>
          <View style={styles.espacioVacio} />
        </View>
      </View>
    );
  }

  // Renderiza tirada profunda (forma de árbol)
  function renderTiradaProfunda() {
    const cartas = tirada.cartas;
    
    // Nombres de posiciones para tirada profunda
    const posiciones = [
      "Esencia del Problema",
      "Pensamiento Personal", "Pensamiento Externo", "Pensamiento Ideal",
      "Emociones Personales", "Emociones Externas", "Emociones Ideales",
      "Situación Material Personal", "Situación Material Externa", "Situación Material Ideal",
      "Resultado Final"
    ];
    
    return (
      <ScrollView contentContainerStyle={styles.tiradaProfundaContainer}>
        {/* Carta principal - Esencia */}
        <View style={styles.cartaConLabelCentrada}>
          <Text style={styles.posicionLabel}>{posiciones[0]}</Text>
          <CartaTarot carta={cartas[0]} onPress={() => onCartaPress(cartas[0])} />
        </View>
        
        {/* Nivel Mental */}
        <Text style={styles.nivelHeader}>Nivel Mental</Text>
        <View style={styles.nivelRow}>
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[1]}</Text>
            <CartaTarot carta={cartas[1]} onPress={() => onCartaPress(cartas[1])} />
          </View>
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[2]}</Text>
            <CartaTarot carta={cartas[2]} onPress={() => onCartaPress(cartas[2])} />
          </View>
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[3]}</Text>
            <CartaTarot carta={cartas[3]} onPress={() => onCartaPress(cartas[3])} />
          </View>
        </View>
        
        {/* Nivel Emocional */}
        <Text style={styles.nivelHeader}>Nivel Emocional</Text>
        <View style={styles.nivelRow}>
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[4]}</Text>
            <CartaTarot carta={cartas[4]} onPress={() => onCartaPress(cartas[4])} />
          </View>
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[5]}</Text>
            <CartaTarot carta={cartas[5]} onPress={() => onCartaPress(cartas[5])} />
          </View>
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[6]}</Text>
            <CartaTarot carta={cartas[6]} onPress={() => onCartaPress(cartas[6])} />
          </View>
        </View>
        
        {/* Nivel Material */}
        <Text style={styles.nivelHeader}>Nivel Material</Text>
        <View style={styles.nivelRow}>
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[7]}</Text>
            <CartaTarot carta={cartas[7]} onPress={() => onCartaPress(cartas[7])} />
          </View>
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[8]}</Text>
            <CartaTarot carta={cartas[8]} onPress={() => onCartaPress(cartas[8])} />
          </View>
          <View style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posiciones[9]}</Text>
            <CartaTarot carta={cartas[9]} onPress={() => onCartaPress(cartas[9])} />
          </View>
        </View>
        
        {/* Resultado Final */}
        <View style={styles.cartaConLabelCentrada}>
          <Text style={styles.posicionLabel}>{posiciones[10]}</Text>
          <CartaTarot carta={cartas[10]} onPress={() => onCartaPress(cartas[10])} />
        </View>
      </ScrollView>
    );
  }

  // Renderiza tirada genérica (cualquier número de cartas)
  function renderGenerico() {
    return (
      <ScrollView contentContainerStyle={styles.genericoContainer}>
        {tirada.cartas.map((carta, index) => (
          <View key={index} style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{`Posición ${index + 1}`}</Text>
            <CartaTarot
              carta={carta}
              onPress={() => onCartaPress(carta)}
            />
          </View>
        ))}
      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: 'TarotBody',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  
  // Estilos de carta
  cartaTarot: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderColor: '#d6af36',
    borderWidth: 1.5,
    marginVertical: 8,
    width: width * 0.28,
  },
  imagenCarta: {
    width: width * 0.25,
    height: width * 0.38,
    borderRadius: 5,
  },
  cartaInvertida: {
    transform: [{ rotate: '180deg' }],
  },
  nombreCarta: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Estilos genéricos
  cartaConLabel: {
    alignItems: 'center',
    margin: 5,
  },
  cartaConLabelCentrada: {
    alignItems: 'center',
    marginVertical: 15,
  },
  posicionLabel: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
    padding: 2,
  },
  
  // Estilos para tirada básica
  tiradaBasicaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    paddingVertical: 20,
  },
  
  // Estilos para tirada de claridad
  tiradaClaridadContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  tiradaClaridadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  espacioVacio: {
    width: width * 0.25,
    height: 10,
  },
  
  // Estilos para tirada profunda
  tiradaProfundaContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  nivelHeader: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  nivelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  
  // Estilos para tirada genérica
  genericoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 15,
  },
});

export default TarotReadingLayout;