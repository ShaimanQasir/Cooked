import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export interface ActionSheetOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  isDestructive?: boolean;
  onPress: () => void;
}

interface BottomActionSheetProps {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onClose: () => void;
}

export default function BottomActionSheet({
  visible,
  title,
  options,
  onClose,
}: BottomActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header pill handle */}
          <View style={styles.handle} />
          
          {title ? (
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {title}
            </Text>
          ) : null}

          {/* Action List Card */}
          <View style={styles.actionList}>
            {options.map((opt, idx) => {
              const isLast = idx === options.length - 1;
              const defaultIconColor = opt.isDestructive
                ? '#EF4444'
                : opt.iconColor || Colors.primary;
              const iconBg = opt.isDestructive ? '#FFF1F0' : '#FAF3E0';

              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.actionRow, isLast && styles.actionRowLast]}
                  onPress={() => {
                    onClose();
                    opt.onPress();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                    <Ionicons name={opt.icon} size={20} color={defaultIconColor} />
                  </View>
                  <Text style={[styles.actionText, opt.isDestructive && styles.destructiveText]}>
                    {opt.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cancel button */}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  actionList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionRowLast: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  destructiveText: {
    color: '#EF4444',
  },
  cancelBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
