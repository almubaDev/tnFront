import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SeleccionTiradaModal = ({
  visible,
  onClose,
  tiposTirada,
  currentTiradaIndex,
  setCurrentTiradaIndex,
  setTipoTiradaSeleccionado,
  verificarDisponibilidadTirada,
  onContinuar
}) => {
  // Definir el ancho del elemento de tirada para cálculos correctos
  const itemWidth = width * 0.9;
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Tirada</Text>
          
          <View style={styles.tiradaCarouselContainer}>
            {tiposTirada && tiposTirada.length > 0 ? (
              <>
                <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tiradaCarouselScrollContent}
                  pagingEnabled
                  snapToInterval={itemWidth}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  onMomentumScrollEnd={(event) => {
                    // Calcular qué tirada está centrada con el ancho ajustado
                    const offsetX = event.nativeEvent.contentOffset.x;
                    const index = Math.round(offsetX / itemWidth);
                    console.log('Scroll end - offset:', offsetX, 'calculated index:', index);
                    if (index >= 0 && index < tiposTirada.length) {
                      setCurrentTiradaIndex(index);
                      setTipoTiradaSeleccionado(tiposTirada[index]);
                    }
                  }}
                >
                  {tiposTirada.map((tipoTirada, index) => {
                    // Log para debug
                    console.log(`Tirada ${index}:`, tipoTirada);
                    return (
                      <View key={index} style={[styles.tiradaCardWrapper, { width: itemWidth }]}>
                        <View style={styles.tiradaCardContent}>
                          <Text style={styles.tiradaCardTitle}>
                            {tipoTirada?.nombre || 'Cargando...'}
                          </Text>
                          <Text style={styles.tiradaCardCartas}>
                            {typeof tipoTirada?.num_cartas === 'number' ? `${tipoTirada.num_cartas} cartas` : 'Cartas no disponibles'}
                          </Text>
                          {/* Se eliminó la línea de costo en gemas según lo solicitado */}
                          <Text style={styles.tiradaCardDesc}>
                            {tipoTirada?.descripcion || 'Sin descripción disponible'}
                          </Text>
                          
                          {tipoTirada && verificarDisponibilidadTirada(tipoTirada)?.puede ? (
                            <Text style={styles.tiradaCardDisponible}>
                              {verificarDisponibilidadTirada(tipoTirada)?.mensaje}
                            </Text>
                          ) : (
                            <Text style={styles.tiradaCardNoDisponible}>
                              {tipoTirada ? 
                                verificarDisponibilidadTirada(tipoTirada)?.mensaje :
                                'Cargando disponibilidad...'}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
            
                {/* Indicadores de paginación */}
                <View style={styles.paginationContainer}>
                  {tiposTirada.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        index === currentTiradaIndex && styles.paginationDotActive
                      ]}
                    />
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.loadingCarousel}>
                <ActivityIndicator size="small" color="#d6af36" />
                <Text style={styles.loadingCarouselText}>Cargando tiradas disponibles...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.modalButtonsContainer}>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.noButton}
                onPress={onClose}
              >
                <Text style={styles.noButtonText}>No</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.siButton,
                  (!tiposTirada || 
                   tiposTirada.length === 0 || 
                   currentTiradaIndex < 0 ||
                   !verificarDisponibilidadTirada(tiposTirada[currentTiradaIndex])?.puede) && 
                  styles.siButtonDisabled
                ]}
                disabled={
                  !tiposTirada || 
                  tiposTirada.length === 0 || 
                  currentTiradaIndex < 0 ||
                  !verificarDisponibilidadTirada(tiposTirada[currentTiradaIndex])?.puede
                }
                onPress={onContinuar}
              >
                <Text style={styles.siButtonText}>Sí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1f1f2f',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'TarotTitles',
  },
  tiradaCarouselContainer: {
    height: 320,
    width: '100%',
    marginBottom: 20,
  },
  tiradaCarouselScrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiradaCardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  tiradaCardContent: {
    backgroundColor: 'rgba(214, 175, 54, 0.1)',
    borderRadius: 10,
    padding: 20,
    height: 260,
    width: '90%',
    justifyContent: 'space-between',
    borderWidth: 0,
    alignSelf: 'center',
  },
  tiradaCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'TarotTitles',
  },
  tiradaCardCartas: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 5,
    fontFamily: 'TarotBody',
  },
  tiradaCardCosto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 10,
    fontFamily: 'TarotBody',
  },
  tiradaCardDesc: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 15,
    flex: 1,
    fontFamily: 'TarotBody',
  },
  tiradaCardDisponible: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 5,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 5,
    fontFamily: 'TarotBody',
  },
  tiradaCardNoDisponible: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 5,
    fontFamily: 'TarotBody',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#d6af36',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingCarousel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCarouselText: {
    marginTop: 10,
    color: '#d6af36',
    fontSize: 16,
    fontFamily: 'TarotBody',
  },
  modalButtonsContainer: {
    width: '100%',
    marginTop: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  // Nuevo estilo de botón circular para "No"
  noButton: {
    backgroundColor: '#555',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#999',
    marginHorizontal: 20,
  },
  noButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'TarotTitles',
  },
  // Nuevo estilo de botón circular para "Sí"
  siButton: {
    backgroundColor: '#d6af36',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  siButtonText: {
    color: '#1f1f2f',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'TarotTitles',
  },
  siButtonDisabled: {
    backgroundColor: '#9e9e9e',
    opacity: 0.7,
  },
});

export default SeleccionTiradaModal;
