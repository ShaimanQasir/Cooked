import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlertStore } from '../store/useAlertStore';
import Colors from '../constants/Colors';

export default function CustomAlertModal() {
  const { visible, options, hideAlert } = useAlertStore();

  if (!visible || !options) return null;

  const {
    title,
    message,
    type = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
  } = options;

  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  const iconName: keyof typeof Ionicons.glyphMap = isDanger
    ? 'trash-bin-outline'
    : isWarning
    ? 'warning-outline'
    : 'information-circle-outline';

  const iconBg = isDanger ? '#FFF1F0' : isWarning ? '#FEF3C7' : '#EFF6FF';
  const iconColor = isDanger ? '#EF4444' : isWarning ? '#D97706' : '#2563EB';
  const confirmBtnBg = isDanger ? '#EF4444' : Colors.primary;

  const handleConfirmPress = () => {
    hideAlert();
    if (onConfirm) onConfirm();
  };

  const handleCancelPress = () => {
    hideAlert();
    if (onCancel) onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancelPress}
    >
      <Pressable style={styles.overlay} onPress={handleCancelPress}>
        <Pressable style={styles.dialogCard} onPress={(e) => e.stopPropagation()}>
          {/* Header Icon */}
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={28} color={iconColor} />
          </View>

          {/* Title & Message */}
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>

          {/* Buttons Row */}
          <View style={styles.buttonRow}>
            {cancelText ? (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancelPress}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: confirmBtnBg }, !cancelText && { flex: 1 }]}
              onPress={handleConfirmPress}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
