import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, ImageBackground, ActivityIndicator
} from 'react-native';
import { fetchWithAuth } from '../apiHelpers';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../components/CustomAlert';

export default function HechizosMiscelaneoScreen() {
  const [hechizos, setHechizos] = useState([]);
  const [hechizoSeleccionado, setHechizoSeleccionado] = useState(null);
  const [hechizosComprados, setHechizosComprados] = useState({});
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  
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
      // Cargar el perfil para verificar gemas
      const perfilResponse = await fetchWithAuth('/perfil/');
      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        setPerfil(perfilData);
      }
      
      // Cargar los hechizos
      const response = await fetchWithAuth('/hechizos/?categoria=miselaneo');
      if (response.ok) {
        const data = await response.json();
        setHechizos(data);
      }

      // Cargar hechizos comprados
      const comprasResponse = await fetchWithAuth('/mis-hechizos/');
      if (comprasResponse.ok) {
        const comprasData = await comprasResponse.json();
        const compradosMap = {};
        
        // Convertir el array de IDs a un mapa para fácil acceso
        comprasData.hechizos_comprados.forEach(id => {
          compradosMap[id] = true;
        });
        
        setHechizosComprados(compradosMap);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const comprarHechizo = async (hechizo) => {
    if (!perfil) return;
    
    if (perfil.gemas < hechizo.precio_gemas) {
      showAlert(
        "Gemas insuficientes", 
        `Necesitas ${hechizo.precio_gemas} gemas para comprar este hechizo. Actualmente tienes ${perfil.gemas} gemas.`,
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
      // Usar el endpoint para comprar hechizos
      const response = await fetchWithAuth('/comprar-hechizo/', {
        method: 'POST',
        body: JSON.stringify({ hechizo_id: hechizo.id }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.status === "ya_comprado") {
          showAlert("Información", result.mensaje);
          
          // Actualizar el estado local para reflejar que ya está comprado
          setHechizosComprados({
            ...hechizosComprados,
            [hechizo.id]: true
          });
          
          return;
        }
        
        // Actualizar gemas en el perfil local
        setPerfil({
          ...perfil,
          gemas: result.gemas_restantes
        });
        
        // Actualizar lista de hechizos comprados
        setHechizosComprados({
          ...hechizosComprados,
          [hechizo.id]: true
        });
        
        showAlert(
          "Hechizo Adquirido", 
          `Has adquirido el hechizo "${hechizo.titulo}". Ahora puedes ver su contenido completo.`
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
      console.error('Error al comprar hechizo:', error);
      showAlert("Error", "No se pudo completar la compra. Inténtalo de nuevo.");
    }
  };

  const estaComprado = (hechizo) => {
    return hechizo && hechizosComprados[hechizo.id] === true;
  };

  return (
    <ImageBackground
      source={require('../assets/img/backgrounds/spells/fondo_hechizos_miselaneo.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.headerTitle}>Hechizos Misceláneos</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d6af36" />
            <Text style={styles.loadingText}>Cargando hechizos...</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.container}
            data={hechizos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => setHechizoSeleccionado(item)}
              >
                <Text style={styles.title}>{item.titulo}</Text>
                {estaComprado(item) ? (
                  <Text style={styles.adquiridoText}>Adquirido</Text>
                ) : (
                  <Text style={styles.price}>Gemas: {item.precio_gemas}</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay hechizos disponibles</Text>
            }
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={!!hechizoSeleccionado}
        onRequestClose={() => setHechizoSeleccionado(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{hechizoSeleccionado?.titulo}</Text>
            
            {estaComprado(hechizoSeleccionado) ? (
              <Text style={styles.modalComprado}>Hechizo Adquirido</Text>
            ) : (
              <Text style={styles.modalPrice}>Gemas: {hechizoSeleccionado?.precio_gemas}</Text>
            )}
            
            {estaComprado(hechizoSeleccionado) ? (
              <ScrollView>
                <Text style={styles.modalText}>{hechizoSeleccionado?.descripcion}</Text>
              </ScrollView>
            ) : (
              <Text style={styles.modalDescription}>
                Para acceder a este hechizo debes comprarlo primero.
              </Text>
            )}
            
            <View style={styles.buttonContainer}>
              {!estaComprado(hechizoSeleccionado) ? (
                <TouchableOpacity 
                  style={styles.buyButton}
                  onPress={() => comprarHechizo(hechizoSeleccionado)}
                >
                  <Text style={styles.buyButtonText}>Comprar Hechizo</Text>
                </TouchableOpacity>
              ) : null}
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setHechizoSeleccionado(null)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  headerTitle: {
    fontFamily: 'TarotTitles',
    fontSize: 24,
    color: '#d6af36',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 10
  },
  container: { 
    padding: 16, 
    paddingBottom: 60
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#fff',
    fontFamily: 'TarotBody',
    marginTop: 10
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderColor: '#d6af36',
    borderWidth: 1.5,
  },
  title: {
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 5,
  },
  price: {
    color: '#fff',
    fontFamily: 'TarotBody',
    fontSize: 14,
    textAlign: 'center',
  },
  adquiridoText: {
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    color: '#fff',
    fontFamily: 'TarotBody',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'rgba(0,0,0,0.95)',
    padding: 20,
    borderRadius: 16,
    borderColor: '#d6af36',
    borderWidth: 2,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 5,
  },
  modalPrice: {
    color: '#fff',
    fontFamily: 'TarotBody',
    fontSize: 16,
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
  modalText: {
    color: '#fff',
    fontFamily: 'TarotBody',
    fontSize: 16,
    textAlign: 'justify',
    marginBottom: 20,
  },
  modalDescription: {
    color: '#fff',
    fontFamily: 'TarotBody',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 15,
    gap: 15,
  },
  buyButton: {
    backgroundColor: '#d6af36',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buyButtonText: {
    color: '#000',
    fontFamily: 'TarotTitles',
    fontSize: 16,
  },
  closeButton: {
    borderColor: '#d6af36',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    fontSize: 16,
  }
});