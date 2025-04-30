import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, 
  ImageBackground, ActivityIndicator
} from 'react-native';
import { fetchWithAuth } from '../apiHelpers';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import CustomAlert from '../components/CustomAlert';
import BackButton from '../components/BackButton';
import { navigationHistory } from '../App';

export default function PocionesAmorScreen() {
  const [pociones, setPociones] = useState([]);
  const [pocionSeleccionada, setPocionSeleccionada] = useState(null);
  const [pocionesCompradas, setPocionesCompradas] = useState({});
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Registrar esta pantalla en el histórico cuando obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      // Verificamos si ya está registrada para evitar duplicados
      if (navigationHistory.peek() !== 'PocionesAmor') {
        console.log('Registering PocionesAmor in history');
      }
      
      return () => {
        // Cleanup si es necesario
      };
    }, [])
  );

  // Estados para alertas personalizadas
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: []
  });

  // Función para mostrar alertas personalizadas
  const showAlert = (title, message, buttons = [{ text: 'Aceptar', onPress: () => setAlertVisible(false) }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  // Cargar datos cuando se monta el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // También recargamos datos cada vez que la pantalla obtiene el foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarDatos();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar el perfil para verificar gemas y suscripción
      const perfilResponse = await fetchWithAuth('/perfil/');
      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        setPerfil(perfilData);
        
        // Aquí es el cambio clave: usamos perfilData en lugar de perfil
        // Solo cargamos las pociones si el usuario tiene suscripción
        if (perfilData.tiene_suscripcion) {
          // Cargar las pociones
          const response = await fetchWithAuth('/pociones/?categoria=amor');
          if (response.ok) {
            const data = await response.json();
            setPociones(data);
          }

          // Cargar pociones compradas
          const comprasResponse = await fetchWithAuth('/mis-pociones/');
          if (comprasResponse.ok) {
            const comprasData = await comprasResponse.json();
            const compradasMap = {};
            
            // Convertir el array de IDs a un mapa para fácil acceso
            comprasData.pociones_compradas.forEach(id => {
              compradasMap[id] = true;
            });
            
            setPocionesCompradas(compradasMap);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const comprarPocion = async (pocion) => {
    if (!perfil) return;
    
    if (!perfil.tiene_suscripcion) {
      showAlert(
        "Suscripción requerida", 
        "Necesitas una suscripción activa para comprar pociones.",
        [
          { text: "Cancelar", onPress: () => setAlertVisible(false) },
          { text: "Ver planes", onPress: () => {
            setAlertVisible(false);
            navigation.navigate('SubscriptionScreen');
          }}
        ]
      );
      return;
    }
    
    if (perfil.gemas < pocion.precio_gemas) {
      showAlert(
        "Gemas insuficientes", 
        `Necesitas ${pocion.precio_gemas} gemas para comprar esta poción. Actualmente tienes ${perfil.gemas} gemas.`,
        [
          { text: "Cancelar", onPress: () => setAlertVisible(false) },
          { text: "Ir a la tienda", onPress: () => {
            setAlertVisible(false);
            navigation.navigate('Tienda');
          }}
        ]
      );
      return;
    }
    
    try {
      // Usar el endpoint para comprar pociones
      const response = await fetchWithAuth('/comprar-pocion/', {
        method: 'POST',
        body: JSON.stringify({ pocion_id: pocion.id }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.status === "ya_comprado") {
          showAlert("Información", result.mensaje);
          
          // Actualizar el estado local para reflejar que ya está comprada
          setPocionesCompradas({
            ...pocionesCompradas,
            [pocion.id]: true
          });
          
          return;
        }
        
        // Actualizar gemas en el perfil local
        setPerfil({
          ...perfil,
          gemas: result.gemas_restantes
        });
        
        // Actualizar lista de pociones compradas
        setPocionesCompradas({
          ...pocionesCompradas,
          [pocion.id]: true
        });
        
        showAlert(
          "Poción Adquirida", 
          `Has adquirido la poción "${pocion.titulo}". Ahora puedes ver su contenido completo.`
        );
      } else {
        // Manejar respuesta de error
        try {
          const errorData = await response.json();
          showAlert("Error", errorData.mensaje || "No se pudo completar la compra");
        } catch {
          showAlert("Error", "No se pudo completar la compra");
        }
      }
    } catch (error) {
      console.error('Error al comprar poción:', error);
      showAlert("Error", "No se pudo completar la compra. Inténtalo de nuevo.");
    }
  };

  const estaComprada = (pocion) => {
    return pocion && pocionesCompradas[pocion.id] === true;
  };

  // Si el usuario no tiene suscripción, mostrar pantalla de restricción
  if (!perfil?.tiene_suscripcion && !loading) {
    return (
      <ImageBackground
        source={require('../assets/img/backgrounds/potions/fondo_pociones_amor.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <BackButton />

        <View style={styles.overlay}>
          <View style={styles.suscripcionContainer}>
            <Text style={styles.suscripcionTitulo}>Acceso Restringido</Text>
            <Text style={styles.suscripcionTexto}>
              Las pociones místicas son exclusivas para usuarios con suscripción activa.
            </Text>
            <TouchableOpacity 
              style={styles.suscripcionBoton}
              onPress={() => navigation.navigate('SubscriptionScreen')}
            >
              <Text style={styles.suscripcionBotonTexto}>Ver Planes de Suscripción</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/img/backgrounds/potions/fondo_pociones_amor.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.titulo}>Pociones de Amor</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d6af36" />
            <Text style={styles.loadingText}>Cargando pociones...</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContainer}
            data={pociones}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => setPocionSeleccionada(item)}
              >
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                {estaComprada(item) ? (
                  <Text style={styles.adquiridoText}>Adquirido</Text>
                ) : (
                  <Text style={styles.precio}>Gemas: {item.precio_gemas}</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay pociones disponibles en esta categoría</Text>
            }
          />
        )}

        <Modal
          animationType="fade"
          transparent
          visible={!!pocionSeleccionada}
          onRequestClose={() => setPocionSeleccionada(null)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{pocionSeleccionada?.titulo}</Text>
              
              {estaComprada(pocionSeleccionada) ? (
                <Text style={styles.modalComprado}>Poción Adquirida</Text>
              ) : (
                <Text style={styles.modalPrecio}>Gemas: {pocionSeleccionada?.precio_gemas}</Text>
              )}
              
              {estaComprada(pocionSeleccionada) ? (
                <ScrollView style={styles.descripcionContainer}>
                  <Text style={styles.descripcionTexto}>
                    {pocionSeleccionada?.descripcion}
                  </Text>
                </ScrollView>
              ) : (
                <Text style={styles.descripcionTexto}>
                  Para acceder a esta poción debes comprarla primero.
                </Text>
              )}
              
              <View style={styles.botonesContainer}>
                {!estaComprada(pocionSeleccionada) ? (
                  <TouchableOpacity 
                    style={styles.comprarBoton}
                    onPress={() => comprarPocion(pocionSeleccionada)}
                  >
                    <Text style={styles.comprarTexto}>Comprar</Text>
                  </TouchableOpacity>
                ) : null}
                
                <TouchableOpacity 
                  style={styles.cerrarBoton}
                  onPress={() => setPocionSeleccionada(null)}
                >
                  <Text style={styles.cerrarTexto}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Alerta Personalizada */}
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() => setAlertVisible(false)}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // Los estilos se mantienen igual
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 80,
  },
  titulo: {
    fontFamily: 'TarotTitles',
    fontSize: 28,
    color: '#d6af36',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderColor: '#d6af36',
    borderWidth: 1,
  },
  cardTitle: {
    fontFamily: 'TarotTitles',
    fontSize: 18,
    color: '#d6af36',
    marginBottom: 5,
    textAlign: 'center',
  },
  precio: {
    fontFamily: 'TarotBody',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  adquiridoText: {
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'TarotBody',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontFamily: 'TarotBody',
    marginTop: 10
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'rgba(10,10,10,0.95)',
    borderRadius: 16,
    padding: 20,
    borderColor: '#d6af36',
    borderWidth: 2,
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: 'TarotTitles',
    fontSize: 22,
    color: '#d6af36',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalPrecio: {
    fontFamily: 'TarotBody',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalComprado: {
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  descripcionContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  descripcionTexto: {
    fontFamily: 'TarotBody',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  botonesContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
  },
  comprarBoton: {
    backgroundColor: '#d6af36',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  comprarTexto: {
    fontFamily: 'TarotTitles',
    fontSize: 16,
    color: '#000000',
  },
  cerrarBoton: {
    borderColor: '#d6af36',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  cerrarTexto: {
    fontFamily: 'TarotTitles',
    fontSize: 16,
    color: '#d6af36',
  },
  suscripcionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  suscripcionTitulo: {
    fontFamily: 'TarotTitles',
    fontSize: 24,
    color: '#d6af36',
    marginBottom: 15,
    textAlign: 'center',
  },
  suscripcionTexto: {
    fontFamily: 'TarotBody',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 25,
  },
  suscripcionBoton: {
    backgroundColor: '#d6af36',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  suscripcionBotonTexto: {
    fontFamily: 'TarotTitles',
    fontSize: 16,
    color: '#000000',
  }
});