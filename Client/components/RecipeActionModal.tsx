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

interface RecipeActionModalProps {
  visible: boolean;
  recipeTitle?: string;
  isArchived?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export default function RecipeActionModal({
  visible,
  recipeTitle,
  isArchived = false,
  onClose,
  onEdit,
  onArchive,
  onDelete,
}: RecipeActionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header handle & title */}
          <View style={styles.handle} />
          {recipeTitle ? (
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {recipeTitle}
            </Text>
          ) : null}

          {/* Action List */}
          <View style={styles.actionList}>
            {/* Edit Option */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                onClose();
                onEdit();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F5F4F0' }]}>
                <Ionicons name="create-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionText}>Edit Recipe</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </TouchableOpacity>

            {/* Archive / Unarchive Option */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                onClose();
                onArchive();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FAF3E0' }]}>
                <Ionicons
                  name={isArchived ? 'archive-outline' : 'archive'}
                  size={20}
                  color="#B27A1C"
                />
              </View>
              <Text style={styles.actionText}>
                {isArchived ? 'Unarchive Recipe' : 'Archive Recipe'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </TouchableOpacity>

            {/* Delete Option */}
            <TouchableOpacity
              style={[styles.actionRow, styles.actionRowLast]}
              onPress={() => {
                onClose();
                onDelete();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FFF1F0' }]}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </View>
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete Recipe</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
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
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  actionList: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
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
  cancelBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
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
