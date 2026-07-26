import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, TouchableOpacity, View, Platform } from 'react-native';
import { useToastStore, ToastType } from '../store/useToastStore';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const TOAST_CONFIG: Record<
  ToastType,
  { bg: string; border: string; icon: keyof typeof Ionicons.glyphMap; iconBg: string; iconColor: string }
> = {
  success: { bg: '#10B981', border: '#059669', icon: 'checkmark-circle', iconBg: 'rgba(255,255,255,0.25)', iconColor: '#FFFFFF' },
  error: { bg: '#EF4444', border: '#DC2626', icon: 'close-circle', iconBg: 'rgba(255,255,255,0.25)', iconColor: '#FFFFFF' },
  warning: { bg: '#F59E0B', border: '#D97706', icon: 'warning', iconBg: 'rgba(255,255,255,0.25)', iconColor: '#FFFFFF' },
  info: { bg: '#3B82F6', border: '#2563EB', icon: 'information-circle', iconBg: 'rgba(255,255,255,0.25)', iconColor: '#FFFFFF' },
};

export default function Toast() {
  const { visible, message, type, hide } = useToastStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 90, friction: 9, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -30, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity
        onPress={hide}
        activeOpacity={0.92}
        style={[styles.toastPill, { backgroundColor: config.bg, borderColor: config.border }]}
      >
        <View style={[styles.iconBadge, { backgroundColor: config.iconBg }]}>
          <Ionicons name={config.icon} size={18} color={config.iconColor} />
        </View>
        <Text style={styles.messageText} numberOfLines={2}>
          {message}
        </Text>
        <Ionicons name="close" size={16} color="rgba(255,255,255,0.8)" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 46,
    left: 16,
    right: 16,
    zIndex: 99999,
    elevation: 99999,
    alignItems: 'center',
  },
  toastPill: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  messageText: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
