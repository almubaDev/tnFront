import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DiagnosticScreen() {
  const [results, setResults] = useState([]);
  const [tokens, setTokens] = useState({ access: null, refresh: null });

  useEffect(() => {
    checkTokens();
  }, []);

  const checkTokens = async () => {
    try {
      const access = await AsyncStorage.getItem('access');
      const refresh = await AsyncStorage.getItem('refresh');
      setTokens({ access, refresh });
    } catch (error) {
      addResult('Error al obtener tokens', error.message);
    }
  };

  const addResult = (test, result) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const testApiStatus = async () => {
    try {
      addResult('API URL', API_URL);
      
      const response = await fetch(`${API_URL}/status/`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const statusText = response.status + ' ' + response.statusText;
      addResult('API Status', statusText);
      
      const data = await response.text();
      addResult('API Response', data);
    } catch (error) {
      addResult('API Error', error.message);
    }
  };

  const testPing = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/ping/`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const endTime = Date.now();
      
      const pingTime = endTime - startTime;
      addResult('Ping Time', `${pingTime}ms`);
      
      const statusText = response.status + ' ' + response.statusText;
      addResult('Ping Status', statusText);
      
      const data = await response.text();
      addResult('Ping Response', data);
    } catch (error) {
      addResult('Ping Error', error.message);
    }
  };

  const clearTokens = async () => {
    try {
      await AsyncStorage.removeItem('access');
      await AsyncStorage.removeItem('refresh');
      addResult('Clear Tokens', 'Tokens eliminados');
      checkTokens();
    } catch (error) {
      addResult('Clear Tokens Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnóstico de Conexión</Text>
      
      <View style={styles.tokensContainer}>
        <Text style={styles.subtitle}>Tokens:</Text>
        <Text style={styles.tokenText}>Access: {tokens.access ? '✅' : '❌'}</Text>
        <Text style={styles.tokenText}>Refresh: {tokens.refresh ? '✅' : '❌'}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testApiStatus}>
          <Text style={styles.buttonText}>Test API Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testPing}>
          <Text style={styles.buttonText}>Test Ping</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearTokens}>
          <Text style={styles.buttonText}>Clear Tokens</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.resultsContainer}>
        {results.map((item, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultTitle}>{item.test}</Text>
            <Text style={styles.resultText}>{item.result}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    marginBottom: 10,
  },
  tokensContainer: {
    backgroundColor: 'rgba(214, 175, 54, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  tokenText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'TarotBody',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#d6af36',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: '#d6003e',
  },
  buttonText: {
    color: '#000',
    fontFamily: 'TarotTitles',
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#d6af36',
  },
  resultTitle: {
    fontSize: 16,
    color: '#d6af36',
    fontFamily: 'TarotTitles',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'TarotBody',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'TarotBody',
    marginTop: 5,
    textAlign: 'right',
  },
});