import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export interface FilterOptions {
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  cuisine: string;
  maxTime: number; // 0 = any, 15, 30, 45, 60
  sortBy: 'newest' | 'most_liked' | 'fastest';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (newFilters: FilterOptions) => void;
  onResetFilters: () => void;
}

const CUISINE_OPTIONS = [
  'All',
  'Italian',
  'Asian',
  'Mexican',
  'Indian',
  'American',
  'Mediterranean',
  'French',
  'Japanese',
];

const TIME_OPTIONS = [
  { label: 'Any Time', value: 0 },
  { label: '< 15 mins', value: 15 },
  { label: '< 30 mins', value: 30 },
  { label: '< 45 mins', value: 45 },
  { label: '< 60 mins', value: 60 },
];

export default function FilterModal({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: FilterModalProps) {
  const [tempFilters, setTempFilters] = React.useState<FilterOptions>(filters);

  React.useEffect(() => {
    setTempFilters(filters);
  }, [filters, visible]);

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      difficulty: 'all',
      cuisine: 'All',
      maxTime: 0,
      sortBy: 'newest',
    };
    setTempFilters(defaultFilters);
    onResetFilters();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header Bar */}
          <View style={styles.header}>
            <Text style={styles.title}>Custom Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Sort By Section */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.optionsRow}>
              {[
                { label: 'Newest', value: 'newest' },
                { label: 'Most Liked', value: 'most_liked' },
                { label: 'Fastest', value: 'fastest' },
              ].map((opt) => {
                const selected = tempFilters.sortBy === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setTempFilters({ ...tempFilters, sortBy: opt.value as any })}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Difficulty Section */}
            <Text style={styles.sectionTitle}>Difficulty</Text>
            <View style={styles.optionsRow}>
              {[
                { label: 'All', value: 'all' },
                { label: 'Easy 🟢', value: 'easy' },
                { label: 'Medium 🟠', value: 'medium' },
                { label: 'Hard 🔴', value: 'hard' },
              ].map((opt) => {
                const selected = tempFilters.difficulty === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setTempFilters({ ...tempFilters, difficulty: opt.value as any })}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Max Cooking Time Section */}
            <Text style={styles.sectionTitle}>Max Preparation & Cook Time</Text>
            <View style={styles.optionsRow}>
              {TIME_OPTIONS.map((opt) => {
                const selected = tempFilters.maxTime === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setTempFilters({ ...tempFilters, maxTime: opt.value })}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cuisine Category Section */}
            <Text style={styles.sectionTitle}>Cuisine Category</Text>
            <View style={styles.optionsRow}>
              {CUISINE_OPTIONS.map((c) => {
                const selected = tempFilters.cuisine.toLowerCase() === c.toLowerCase();
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setTempFilters({ ...tempFilters, cuisine: c })}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 14,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  applyBtn: {
    flex: 2,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
