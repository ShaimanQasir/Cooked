import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useToastStore, ToastType } from '../store/useToastStore';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const TOAST_CONFIG: Record<ToastType, { bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }> = {
  success: { bg: '#2B8255', icon: 'checkmark-circle', iconColor: '#FFFFFF' },
  error: { bg: '#D13E35', icon: 'close-circle', iconColor: '#FFFFFF' },
  warning: { bg: '#E29E2B', icon: 'warning', iconColor: '#FFFFFF' },
  info: { bg: '#3C82B5', icon: 'information-circle', iconColor: '#FFFFFF' },
};

export default function Toast() {
  const { visible, message, type, hide } = useToastStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible && opacity._value === 0) return null;

  const config = TOAST_CONFIG[type];

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity onPress={hide} activeOpacity={0.9} style={[styles.toast, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={20} color={config.iconColor} />
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
        <Ionicons name="close" size={16} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  message: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 10,
  },
});
