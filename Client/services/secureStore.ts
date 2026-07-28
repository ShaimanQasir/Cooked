import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'cooked_access_token';
const REFRESH_TOKEN_KEY = 'cooked_refresh_token';

/**
 * Saves access token to hardware-backed SecureStore (or AsyncStorage on Web)
 */
export async function setAccessToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Failed to set secure access token:', error);
  }
}

/**
 * Retrieves access token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to get secure access token:', error);
    return null;
  }
}

/**
 * Saves refresh token to hardware-backed SecureStore (or AsyncStorage on Web)
 */
export async function setRefreshToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Failed to set secure refresh token:', error);
  }
}

/**
 * Retrieves refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to get secure refresh token:', error);
    return null;
  }
}

/**
 * Clears all authentication tokens upon logout or session revocation
 */
export async function clearTokens(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to clear secure tokens:', error);
  }
}
