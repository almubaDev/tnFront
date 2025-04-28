import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
  BackHandler
} from 'react-native';
import { Video } from 'expo-av';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchWithAuth } from '../apiHelpers';
import CustomAlert from '../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionEvents } from '../App';

// Importar componentes modularizados
import CartaTarot from '../components/tarot/CartaTarot';
import TiradaBasica from '../components/tarot/TiradaBasica';
import TiradaClaridad from '../components/tarot/TiradaClaridad';
import TiradaProfunda from '../components/tarot/TiradaProfunda';
import DetalleCartaModal from '../components/tarot/DetalleCartaModal';
import InterpretacionModal from '../components/tarot/InterpretacionModal';
import SeleccionTiradaModal from '../components/tarot/SeleccionTiradaModal';
import PreguntaModal from '../components/tarot/PreguntaModal';
import HistorialModal from '../components/tarot/HistorialModal';

// Obtenemos dimensiones de la pantalla para layouts responsivos
const { width, height } = Dimensions.get('window');

export default function TarotScreen() {
  const navigation = useNavigation();
  // Estados principales
  const [perfil, setPerfil] = useState(null);
  const [tiposTirada, setTiposTirada] = useState([]);
  const [tipoTiradaSeleccionado, setTipoTiradaSeleccionado] = useState(null);
  const [currentTiradaIndex, setCurrentTiradaIndex] = useState(0);
  const [pregunta, setPregunta] = useState('');
  const [tiradaActual, setTiradaActual] = useState(null);
  const [historialTiradas, setHistorialTiradas] = useState([]);
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  
  // Referencia al ScrollView
  const scrollViewRef = useRef(null);
  
  // Valor de animación para el parpadeo
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  
  // Configurar la animación de parpadeo
  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(startAnimation);
    };
    
    startAnimation();
    
    return () => {
      fadeAnim.stopAnimation();
    };
  }, [fadeAnim]);
  
  // Estados modales
  const [modalSeleccionVisible, setModalSeleccionVisible] = useState(false);
  const [modalPreguntaVisible, setModalPreguntaVisible] = useState(false);
  const [modalCartaVisible, setModalCartaVisible] = useState(false);
  const [modalInterpretacionVisible, setModalInterpretacionVisible] = useState(false);
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false);
  
  // Estados de carga y errores
  const [loading, setLoading] = useState(true);
  const [loadingTirada, setLoadingTirada] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Realizando tirada...");
  
  // Mensajes de carga para motor náutica
  const mensajesCarga = [
    "Conectando con Motor Náutica...",
    "Iniciando sistema de redes neuronales cargadas...",
    "Seleccionando red neuronal de tarotista cargada...",
    "Navegando en sistema Náutica..."
  ];
  
  // Estados para alertas personalizadas
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: []
  });

  // Manejo de botón de retroceso dentro de la pantalla
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Si tenemos una tirada activa, permitir volver al estado anterior
        if (tiradaActual) {
          volverAPantallaPrincipal();
          return true;
        }
        
        // Si hay algún modal abierto, cerrarlo
        if (modalSeleccionVisible || modalPreguntaVisible || 
            modalCartaVisible || modalInterpretacionVisible || 
            modalHistorialVisible) {
          setModalSeleccionVisible(false);
          setModalPreguntaVisible(false);
          setModalCartaVisible(false);
          setModalInterpretacionVisible(false);
          setModalHistorialVisible(false);
          return true;
        }
        
        // De lo contrario, dejar que el manejador central de App.js se encargue
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [
      tiradaActual, 
      modalSeleccionVisible, 
      modalPreguntaVisible,
      modalCartaVisible,
      modalInterpretacionVisible,
      modalHistorialVisible
    ])
  );

  // Función para mostrar alertas personalizadas
  const showAlert = (title, message, buttons = [{ text: 'Aceptar', onPress: () => setAlertVisible(false) }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  // Cargar datos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      cargarDatosIniciales();
      return () => {
        // Cleanup si es necesario
      };
    }, [])
  );

  // Cargar datos iniciales: perfil, tipos de tirada e historial
  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      // Cargar perfil de usuario
      const perfilResponse = await fetchWithAuth('/perfil/');
      // Cargar tipos de tirada disponibles
      const tiposResponse = await fetchWithAuth('/listar-tipos-tirada/');
      // Cargar historial de tiradas
      const historialResponse = await fetchWithAuth('/historial-tiradas/');
      
      // Check for auth reset event
      if (perfilResponse.authReset || tiposResponse.authReset || historialResponse.authReset) {
        console.log('Auth reset detected in TarotScreen');
        sessionEvents.emit('authReset');
        return;
      }
      
      if (perfilResponse.ok && tiposResponse.ok && historialResponse.ok) {
        const perfilData = await perfilResponse.json();
        const tiposData = await tiposResponse.json();
        const historialData = await historialResponse.json();
        
        setPerfil(perfilData);
        setTiposTirada(tiposData || []);
        setHistorialTiradas(historialData || []);
      } else if (perfilResponse.status === 401 || tiposResponse.status === 401 || historialResponse.status === 401) {
        // Handle session expiration
        showAlert(
          'Sesión expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [{
            text: 'Aceptar',
            onPress: async () => {
              setAlertVisible(false);
              await AsyncStorage.removeItem('access');
              await AsyncStorage.removeItem('refresh');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          }]
        );
      } else {
        console.error('Error cargando datos:', perfilResponse.status, tiposResponse.status, historialResponse.status);
        showAlert('Error', 'No se pudieron cargar los datos. Verifica tu conexión.');
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      showAlert('Error', 'No se pudieron cargar los datos. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario puede realizar una tirada
  const verificarDisponibilidadTirada = (tipoTirada) => {
    if (!perfil) return { puede: false, mensaje: 'Error al cargar tu perfil' };
    if (!tipoTirada) return { puede: false, mensaje: 'Selecciona un tipo de tirada' };

    // Verificar límites según tipo
    let tiradasUsadas = 0;
    let limitePermitido = 0;

    switch (tipoTirada.tipo) {
      case 'basica':
        tiradasUsadas = perfil.tiradas_basicas_usadas;
        limitePermitido = 10; // Límite mensual
        break;
      case 'claridad':
        tiradasUsadas = perfil.tiradas_claridad_usadas;
        limitePermitido = 10; // Límite mensual
        break;
      case 'profunda':
        tiradasUsadas = perfil.tiradas_profundas_usadas;
        limitePermitido = 10; // Límite mensual
        break;
      default:
        return { puede: false, mensaje: 'Tipo de tirada no reconocido' };
    }

    // Si tiene suscripción y no ha excedido límites
    if (perfil.tiene_suscripcion && tiradasUsadas < limitePermitido) {
      const tiradasDisponibles = limitePermitido - tiradasUsadas;
      return { 
        puede: true, 
        mensaje: `Tiradas disponibles: ${tiradasDisponibles}/${limitePermitido}`, 
        costoGemas: 0,
        tiradasUsadas,
        limitePermitido 
      };
    }

    // Verificar si tiene suficientes gemas
    if (perfil.gemas >= tipoTirada.costo_gemas) {
      return { 
        puede: true, 
        mensaje: `Costo: ${tipoTirada.costo_gemas} gemas`, 
        costoGemas: tipoTirada.costo_gemas 
      };
    }

    return { 
      puede: false, 
      mensaje: `No tienes suficientes gemas (Necesitas: ${tipoTirada.costo_gemas}, Tienes: ${perfil.gemas})` 
    };
  };

  // Función para iniciar el proceso de tirada
  const iniciarSeleccionTirada = () => {
    setPregunta('');
    setCurrentTiradaIndex(0);
    
    // Seleccionar el primer tipo de tirada si hay disponibles
    if (tiposTirada && tiposTirada.length > 0) {
      setTipoTiradaSeleccionado(tiposTirada[0]);
    } else {
      setTipoTiradaSeleccionado(null);
    }
    
    setModalSeleccionVisible(true);
  };
  
  // Función para volver a la pantalla inicial de tarot sin tirada activa
  const volverAPantallaPrincipal = () => {
    setTiradaActual(null);
    setCartaSeleccionada(null);
    // Resetear cualquier otro estado necesario
  };

  // Manejar continuar después de seleccionar tirada
  const handleContinuarSeleccion = () => {
    setModalSeleccionVisible(false);
    setModalPreguntaVisible(true);
  };

  // Manejar volver de pregunta a selección
  const handleVolverASeleccion = () => {
    setModalPreguntaVisible(false);
    setModalSeleccionVisible(true);
  };

  // Función para realizar la tirada
  const realizarTirada = async () => {
    if (!tipoTiradaSeleccionado) {
      showAlert('Error', 'Selecciona un tipo de tirada primero');
      return;
    }

    if (!pregunta.trim()) {
      showAlert('Error', 'Ingresa una pregunta para la tirada');
      return;
    }

    const disponibilidad = verificarDisponibilidadTirada(tipoTiradaSeleccionado);
    if (!disponibilidad?.puede) {
      showAlert('No disponible', disponibilidad?.mensaje || 'Tirada no disponible');
      return;
    }

    setModalPreguntaVisible(false);
    setLoadingTirada(true);
    
    // Iniciar secuencia de mensajes
    let mensajeIndex = 0;
    setLoadingMessage(mensajesCarga[mensajeIndex]);
    const intervalId = setInterval(() => {
      mensajeIndex = (mensajeIndex + 1) % mensajesCarga.length;
      setLoadingMessage(mensajesCarga[mensajeIndex]);
    }, 3000);

    try {
      // Realizar la tirada a través de la API
      const response = await fetchWithAuth('/realizar-tirada/', {
        method: 'POST',
        body: JSON.stringify({
          tipo_tirada: tipoTiradaSeleccionado.id,
          pregunta: pregunta.trim(),
        }),
      });
      
      // Check for auth reset event
      if (response.authReset) {
        clearInterval(intervalId);
        setLoadingTirada(false);
        console.log('Auth reset detected during tirada');
        sessionEvents.emit('authReset');
        return;
      }

      if (response.ok) {
        const resultado = await response.json();
        
        // Actualizar el perfil para reflejar gemas y tiradas usadas
        await cargarDatosIniciales(); 
        
        // Guardar la tirada actual
        setTiradaActual(resultado.tirada);
        
        // Mostrar mensaje de éxito
        showAlert('Tirada realizada', resultado.mensaje);
      } else if (response.status === 401) {
        // Handle session expiration
        showAlert(
          'Sesión expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [{
            text: 'Aceptar',
            onPress: async () => {
              setAlertVisible(false);
              await AsyncStorage.removeItem('access');
              await AsyncStorage.removeItem('refresh');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          }]
        );
      } else {
        // Manejar otros errores
        try {
          const errorData = await response.json();
          showAlert('Error', errorData.error || 'No se pudo realizar la tirada');
        } catch (e) {
          showAlert('Error', 'No se pudo realizar la tirada');
        }
      }
    } catch (error) {
      console.error('Error realizando tirada:', error);
      showAlert('Error', 'No se pudo conectar con el servidor');
    } finally {
      clearInterval(intervalId);
      setLoadingTirada(false);
    }
  };
  
  // Función para ver el detalle de una carta
  const verDetalleCarta = (carta) => {
    if (!carta) return;
    setCartaSeleccionada(carta);
    setModalCartaVisible(true);
  };

  // Función para cargar tirada desde historial
  const cargarTiradaDesdeHistorial = (tirada) => {
    if (!tirada) return;
    setTiradaActual(tirada);
    setModalHistorialVisible(false);
  };

  // Función para ver la interpretación completa
  const verInterpretacionCompleta = () => {
    setModalInterpretacionVisible(true);
  };

  // Obtener imágenes de cartas 
  const obtenerImagenCarta = (nombreImagen) => {
    // Verificar que nombreImagen existe
    if (!nombreImagen) return require('../assets/img/cards/el_loco.jpg');
    
    // Mapear nombres de imágenes a archivos locales
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
    
    return imageMapping[nombreImagen] || require('../assets/img/cards/el_loco.jpg'); // Imagen por defecto
  };

  // Renderizar layout de tirada según tipo
  const renderizarLayoutTirada = () => {
    if (!tiradaActual) return null;

    const tipoTirada = tiradaActual?.tipo_tirada_nombre?.toLowerCase() || '';
    
    if (tipoTirada.includes('básica')) {
      return (
        <TiradaBasica 
          cartas={tiradaActual?.cartas || []} 
          onCartaPress={verDetalleCarta} 
        />
      );
    } else if (tipoTirada.includes('claridad')) {
      return (
        <TiradaClaridad 
          cartas={tiradaActual?.cartas || []} 
          onCartaPress={verDetalleCarta} 
        />
      );
    } else {
      return (
        <TiradaProfunda 
          cartas={tiradaActual?.cartas || []} 
          onCartaPress={verDetalleCarta} 
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/video/fondo_tarot.mp4')}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.overlay}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d6af36" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : loadingTirada ? (
          <View style={styles.loadingContainer}>
            <View style={styles.videoContainer}>
              <Video
                source={require('../assets/video/carga_neuronal.mp4')}
                rate={1.0}
                volume={1.0}
                isMuted={true}
                resizeMode="cover"
                shouldPlay
                isLooping
                style={styles.loadingVideo}
              />
            </View>
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        ) : tiradaActual ? (
          <View style={styles.tiradaContainer}>
            <Text style={styles.preguntaTirada}>"{tiradaActual?.pregunta || ''}"</Text>
            
            <View style={styles.scrollContainer}>
              <ScrollView 
                contentContainerStyle={styles.scrollTirada}
                bounces={true}
                overScrollMode="always"
                showsVerticalScrollIndicator={true}
                ref={scrollViewRef}
                onScroll={(event) => {
                  const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
                  const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
                  setIsAtBottom(isBottom);
                }}
                scrollEventThrottle={16}
              >
                {renderizarLayoutTirada()}
              </ScrollView>
              
              {/* Indicador de scroll con chevron */}
              {tiradaActual && tiradaActual.cartas && tiradaActual.cartas.length > 0 && (
                <Animated.View style={[
                  styles.scrollIndicator,
                  { opacity: fadeAnim }
                ]}>
                  <Text style={styles.chevronText}>{isAtBottom ? '▲' : '▼'}</Text>
                </Animated.View>
              )}
            </View>
            
            <View style={styles.botonesVerticalContainer}>
              <TouchableOpacity
                style={styles.botonInterpretacion}
                onPress={verInterpretacionCompleta}
              >
                <Text style={styles.botonInterpretacionTexto}>Ver Interpretación</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.botonNuevaTirada}
                onPress={iniciarSeleccionTirada}
              >
                <Text style={styles.textoNuevaTirada}>Nueva Tirada</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.botonVolver}
                onPress={volverAPantallaPrincipal}
              >
                <Text style={styles.textoBotonVolver}>Volver</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.centeredContainer}>
            <View style={styles.iconoTiradaContainer}>
              <View style={styles.iconoBackground}>
                <Image
                  source={require('../assets/img/icons/tirada_icono.png')}
                  style={styles.iconoTiradaCentral}
                  resizeMode="contain"
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.botonPrincipal, { width: '90%' }]}
              onPress={iniciarSeleccionTirada}
            >
              <Text style={styles.textoPrincipal}>Realizar Tirada</Text>
            </TouchableOpacity>
            
            {historialTiradas && historialTiradas.length > 0 && (
              <TouchableOpacity
                style={styles.botonHistorial}
                onPress={() => setModalHistorialVisible(true)}
              >
                <Text style={styles.textoHistorial}>Ver Historial</Text>
              </TouchableOpacity>
            )}
            
            {tiposTirada.length === 0 && !loading && (
              <Text style={styles.noDataText}>No hay tiradas disponibles</Text>
            )}
          </View>
        )}
      </View>

      {/* Renderizar todos los componentes modales */}
      <SeleccionTiradaModal
        visible={modalSeleccionVisible}
        onClose={() => setModalSeleccionVisible(false)}
        tiposTirada={tiposTirada}
        currentTiradaIndex={currentTiradaIndex}
        setCurrentTiradaIndex={setCurrentTiradaIndex}
        setTipoTiradaSeleccionado={setTipoTiradaSeleccionado}
        verificarDisponibilidadTirada={verificarDisponibilidadTirada}
        onContinuar={handleContinuarSeleccion}
      />

      <PreguntaModal
        visible={modalPreguntaVisible}
        onClose={() => setModalPreguntaVisible(false)}
        onBack={handleVolverASeleccion}
        onConfirm={realizarTirada}
        pregunta={pregunta}
        setPregunta={setPregunta}
        tipoTiradaSeleccionado={tipoTiradaSeleccionado}
      />

      <DetalleCartaModal
        cartaSeleccionada={cartaSeleccionada}
        visible={modalCartaVisible}
        onClose={() => setModalCartaVisible(false)}
        obtenerImagenCarta={obtenerImagenCarta}
      />

      <InterpretacionModal
        tirada={tiradaActual}
        visible={modalInterpretacionVisible}
        onClose={() => setModalInterpretacionVisible(false)}
      />

      <HistorialModal
        visible={modalHistorialVisible}
        onClose={() => setModalHistorialVisible(false)}
        historialTiradas={historialTiradas}
        onSeleccionarTirada={cargarTiradaDesdeHistorial}
      />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: 180,
    height: 180,
    borderRadius: 90, // Mitad del ancho/alto para hacerlo circular
    overflow: 'hidden',
    marginBottom: 20,
    padding: 15, // Padding amplio para que se vea "aireado"
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: '#d6af36',
    shadowColor: '#d6af36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center', // Asegurar que esté centrado
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 75, // Para mantener la forma circular del contenido
  },
  loadingText: {
    color: '#d6af36',
    fontSize: 18,
    marginTop: 15,
    fontWeight: 'bold',
    fontFamily: 'TarotBody',
    textAlign: 'center',
    maxWidth: '80%',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconoTiradaContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  iconoBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d6af36',
  },
  iconoTiradaCentral: {
    width: 150,
    height: 150,
  },
  botonesVerticalContainer: {
    flexDirection: 'column',
    width: '90%',
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  botonVolver: {
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 8,
  },
  textoBotonVolver: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TarotTitles',
    textAlign: 'center',
  },
  botonNuevaTirada: {
    backgroundColor: '#d6af36',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b69018',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 8,
  },
  textoNuevaTirada: {
    color: '#1f1f2f',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TarotTitles',
    textAlign: 'center',
  },
  botonHistorial: {
    backgroundColor: 'rgba(214, 175, 54, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#d6af36',
    width: '90%',
    alignItems: 'center',
  },
  textoHistorial: {
    color: '#d6af36',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TarotBody',
  },
  botonPrincipal: {
    backgroundColor: '#d6af36',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b69018',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 15,
  },
  textoPrincipal: {
    color: '#1f1f2f',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'TarotTitles',
    textAlign: 'center',
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 30,
    textAlign: 'center',
    fontFamily: 'TarotBody',
  },
  tiradaContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  preguntaTirada: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#d6af36',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontFamily: 'TarotBody',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  scrollTirada: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 20,
  },
  scrollIndicator: {
    position: 'absolute',
    right: 10,
    bottom: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  chevronText: {
    color: '#d6af36',
    fontSize: 20,
    fontWeight: 'bold',
  },
  botonInterpretacion: {
    backgroundColor: 'rgba(214, 175, 54, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d6af36',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  botonInterpretacionTexto: {
    color: '#d6af36',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TarotTitles',
    textAlign: 'center',
  },
  loadingCarousel: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCarouselText: {
    color: '#d6af36',
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'TarotBody',
  },
});