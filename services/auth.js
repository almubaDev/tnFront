import * as SecureStore from 'expo-secure-store';

export async function guardarToken(token) {
  await SecureStore.setItemAsync('userToken', token);
}

export async function obtenerToken() {
  return await SecureStore.getItemAsync('userToken');
}

export async function eliminarToken() {
  await SecureStore.deleteItemAsync('userToken');
}
