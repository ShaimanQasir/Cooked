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

          {/* Action Rows */}
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
                  activeOpacity={0.75}
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 42,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 18,
  },
  actionList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionRowLast: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  destructiveText: {
    color: '#EF4444',
  },
});
