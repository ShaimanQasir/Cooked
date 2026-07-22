import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Equipment {
  id: string;
  name: string;
  icon: string;
  iconFamily: 'ion' | 'mci';
  color: string;
}

const EQUIPMENT_OPTIONS: Equipment[] = [
  { id: 'oven', name: 'Oven', icon: 'stove', iconFamily: 'mci', color: '#D2691E' },
  { id: 'stovetop', name: 'Stovetop /\nGas burner', icon: 'fire', iconFamily: 'mci', color: '#C63A2F' },
  { id: 'microwave', name: 'Microwave', icon: 'microwave', iconFamily: 'mci', color: '#4682B4' },
  { id: 'air_fryer', name: 'Air fryer', icon: 'speedometer', iconFamily: 'mci', color: '#FF7F50' },
  { id: 'blender', name: 'Blender /\nLiquidizer', icon: 'blender', iconFamily: 'mci', color: '#2E8B57' },
  { id: 'food_processor', name: 'Food processor', icon: 'blender-software', iconFamily: 'mci', color: '#4169E1' },
  { id: 'instant_pot', name: 'Instant Pot /\nPressure cooker', icon: 'pot-steam', iconFamily: 'mci', color: '#DAA520' },
  { id: 'grill', name: 'Grill / BBQ', icon: 'grill', iconFamily: 'mci', color: '#8B4513' },
  { id: 'rice_cooker', name: 'Rice cooker', icon: 'rice', iconFamily: 'mci', color: '#20B2AA' },
  { id: 'mixer', name: 'Stand mixer /\nHand mixer', icon: 'bowl-mix', iconFamily: 'mci', color: '#708090' },
  { id: 'steamer', name: 'Steamer', icon: 'pot-steam-outline', iconFamily: 'mci', color: '#6A5ACD' },
];

export default function KitchenScreen() {
  const router = useRouter();
  const { profile, toggleEquipment, setProfile, saveOnboardingStep } = useUserStore();
  const selectedEquipment = profile.kitchenEquipment;

  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelect = (id: string) => {
    if (selectedEquipment.length >= 6 && !selectedEquipment.includes(id)) {
      return;
    }
    toggleEquipment(id);
  };

  const handleAddCustom = () => {
    const name = customInput.trim();
    if (!name) return;
    if (selectedEquipment.length >= 6) return;
    if (!selectedEquipment.includes(name)) {
      setProfile({ kitchenEquipment: [...selectedEquipment, name] });
    }
    setCustomInput('');
    setShowCustomInput(false);
  };

  const handleRemoveCustom = (name: string) => {
    const updated = selectedEquipment.filter((e) => e !== name);
    setProfile({ kitchenEquipment: updated });
  };

  const handleContinue = async () => {
    await saveOnboardingStep(13);
    router.push('/onboarding/meal-plan-pref');
  };

  const renderIcon = (option: Equipment, isSelected: boolean) => {
    const color = isSelected ? option.color : Colors.textMuted;
    if (option.iconFamily === 'ion') {
      return <Ionicons name={option.icon as any} size={28} color={color} />;
    }
    return <MaterialCommunityIcons name={option.icon as any} size={28} color={color} />;
  };

  const customEquipment = selectedEquipment.filter(
    (e) => !EQUIPMENT_OPTIONS.some((o) => o.id === e)
  );

  return (
    <OnboardingWrapper
      currentStep="kitchen"
      title="What's in your kitchen?"
      subtitle="Select up to 6 favorites"
    >
      <View style={styles.container}>
        <View style={styles.grid}>
          {EQUIPMENT_OPTIONS.map((option) => {
            const isSelected = selectedEquipment.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.card,
                  isSelected ? styles.cardActive : null
                ]}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.8}
              >
                <View style={styles.iconContainer}>
                  {renderIcon(option, isSelected)}
                </View>
                <Text style={styles.cardTitle}>{option.name}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Add Custom Button */}
          <TouchableOpacity
            style={styles.addCard}
            onPress={() => setShowCustomInput(!showCustomInput)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
            <Text style={styles.addCardText}>Add Custom</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Input */}
        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type equipment name..."
                placeholderTextColor={Colors.textLight}
                value={customInput}
                onChangeText={setCustomInput}
                onSubmitEditing={handleAddCustom}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddCustom}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Custom Tags Display */}
        {customEquipment.length > 0 && (
          <View style={styles.tagsContainer}>
            {customEquipment.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveCustom(tag)}>
                  <Ionicons name="close-circle" size={16} color={Colors.white} style={styles.tagClose} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Selection Count */}
        <View style={styles.countBox}>
          <Text style={styles.countText}>
            {selectedEquipment.length}/6 items selected
          </Text>
        </View>
      </View>

      <Button
        title="Continue"
        onPress={handleContinue}
        variant={selectedEquipment.length > 0 ? 'primary' : 'disabled'}
        style={styles.continueButton}
      />
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  card: {
    width: '48%',
    height: 104,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Colors.shadowSubtle,
  },
  cardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  iconContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 16,
  },
  addCard: {
    width: '48%',
    height: 104,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addCardText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 6,
  },
  customInputContainer: {
    marginTop: 8,
    marginBottom: 12,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  addButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  tagClose: {
    marginLeft: 6,
  },
  countBox: {
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  continueButton: {
    marginTop: 24,
  },
});
