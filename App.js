import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Platform, TouchableOpacity, Text, Image, BackHandler, Alert } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import TarotScreen from './screens/TarotScreen';
import MarketScreen from './screens/MarketScreen';
import StoreScreen from './screens/StoreScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegistroScreen from './screens/RegistroScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import HechizosAmorScreen from './screens/HechizosAmorScreen';
import HechizosDineroScreen from './screens/HechizosDineroScreen';
import HechizosMiscelaneoScreen from './screens/HechizosMiscelaneoScreen';
import MotorNauticaScreen from './screens/MotorNauticaScreen';
import SubmenuPocionesScreen from './screens/SubmenuPocionesScreen';
import PocionesAmorScreen from './screens/PocionesAmorScreen';
import PocionesDineroScreen from './screens/PocionesDineroScreen';
import PocionesMiscelaneoScreen from './screens/PocionesMiscelaneoScreen';
import DiagnosticScreen from './screens/DiagnosticScreen';
import * as SplashScreen from 'expo-splash-screen';

// Importar componente de instalación PWA
import PWAInstallPrompt from './components/PWAInstallPrompt';

import { PAYPAL_CLIENT_ID } from './config';

// Monitor global de fetch para debugging
if (__DEV__) {
  global._fetch = fetch;
  global.fetch = (...args) => {
    console.log("Fetch request:", args);
    return global._fetch(...args)
      .then(response => {
        console.log("Fetch response:", response);
        return response;
      })
      .catch(error => {
        console.error("Fetch error:", error);
        throw error;
      });
  };
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Este método de carga ya no se utilizará, ahora lo haremos en el useEffect

function MainTabs({ fontsLoaded }) {
  return (
    <Tab.Navigator screenOptions={{ 
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#000000',
      }
    }}>
      <Tab.Screen
        name="Tarot"
        options={{
          tabBarIcon: () => (
            <Image 
              source={require('./assets/img/icons/tarot_icon.png')} 
              style={{ width: 24, height: 24 }} 
            />
          ),
        }}
      >
        {() => <TarotScreen fontsLoaded={fontsLoaded} />}
      </Tab.Screen>
      <Tab.Screen
        name="Mercado"
        component={MarketScreen}
        options={{
          tabBarIcon: () => (
            <Image 
              source={require('./assets/img/icons/market_icon.png')} 
              style={{ width: 24, height: 24 }} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Tienda"
        component={StoreScreen}
        options={{
          tabBarIcon: () => (
            <Image 
              source={require('./assets/img/icons/shop_icon.png')} 
              style={{ width: 24, height: 24 }} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: () => (
            <Image 
              source={require('./assets/img/icons/profile_icon.png')} 
              style={{ width: 24, height: 24 }} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Custom event for session expiration
export const sessionEvents = {
  listeners: {},
  
  addListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.removeListener(event, callback);
  },
  
  removeListener(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  },
  
  emit(event, ...args) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(...args));
  }
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef(null);
  
  // Verificar token al inicio
  useEffect(() => {
    const checkToken = async () => {
      try {
        const access = await AsyncStorage.getItem('access');
        const refresh = await AsyncStorage.getItem('refresh');
        
        if (access && refresh) {
          // Si hay tokens, ir directamente a la pantalla principal
          setInitialRoute('MainTabs');
        }
      } catch (error) {
        console.error('Error al verificar tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkToken();
  }, []);
  
  // Handle authentication reset events
  useEffect(() => {
    const handleAuthReset = () => {
      console.log('Session expired, navigating to Welcome screen');
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    };
    
    // Subscribe to auth reset events
    const unsubscribe = sessionEvents.addListener('authReset', handleAuthReset);
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Cargar fuentes
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        TarotTitles: require('./assets/fonts/IMFellDWPicaSC-Regular.ttf'),
        TarotBody: require('./assets/fonts/Junicode.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // Función mejorada para manejar el botón de retroceso
  const handleBackPress = () => {
    if (navigationRef.current) {
      // Obtener el estado actual de navegación
      const currentRoute = navigationRef.current.getCurrentRoute();
      
      // Si estamos en una de las pantallas principales (MainTabs)
      if (currentRoute && currentRoute.name === 'MainTabs') {
        // Mostrar alerta de confirmación antes de salir
        Alert.alert(
          'Salir de la aplicación',
          '¿Estás seguro que deseas salir?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: () => BackHandler.exitApp() }
          ],
          { cancelable: true }
        );
        return true; // Prevenimos el comportamiento por defecto
      } 
      
      // Si podemos navegar hacia atrás, lo hacemos
      if (navigationRef.current.canGoBack()) {
        navigationRef.current.goBack();
        return true; // Prevenimos el comportamiento por defecto
      }
    }
    
    // En otros casos, dejamos que el sistema maneje el retroceso
    return false;
  };

  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#000' 
      }}>
        <ActivityIndicator size="large" color="#d6af36" />
        <Text style={{ 
          color: '#d6af36', 
          marginTop: 10,
          fontSize: 18
        }}>
          Cargando...
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Componente de instalación PWA que funciona en todas las plataformas */}
      <PWAInstallPrompt />

      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator 
          initialRouteName={initialRoute}
          screenOptions={{ 
            headerShown: false,
            gestureEnabled: false // Desactivar gestos de deslizamiento para retroceder
          }}
        >
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ gestureEnabled: true }} // Permitir gestos solo en Welcome
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />
          <Stack.Screen name="Diagnostico" component={DiagnosticScreen} />
          <Stack.Screen 
            name="MainTabs" 
            options={{
              // Evita volver atrás desde las tabs principales
              headerBackVisible: false,
              gestureEnabled: false // Desactivar deslizamiento para volver
            }}
          >
            {(props) => {
              // Agregar manejo del botón de retroceso cuando estamos en las tabs principales
              useFocusEffect(
                React.useCallback(() => {
                  const backHandler = BackHandler.addEventListener(
                    "hardwareBackPress", 
                    handleBackPress
                  );
                  return () => backHandler.remove();
                }, [])
              );
              return <MainTabs fontsLoaded={fontsLoaded} {...props} />;
            }}
          </Stack.Screen>
          <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
          <Stack.Screen name="HechizosAmor" component={HechizosAmorScreen} />
          <Stack.Screen name="HechizosDinero" component={HechizosDineroScreen} />
          <Stack.Screen name="HechizosMiscelaneo" component={HechizosMiscelaneoScreen} />
          <Stack.Screen name="MotorNauticaScreen" component={MotorNauticaScreen} />
          
          {/* Screens de Pociones */}
          <Stack.Screen name="SubmenuPociones" component={SubmenuPocionesScreen} />
          <Stack.Screen name="PocionesAmor" component={PocionesAmorScreen} />
          <Stack.Screen name="PocionesDinero" component={PocionesDineroScreen} />
          <Stack.Screen name="PocionesMiscelaneo" component={PocionesMiscelaneoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}