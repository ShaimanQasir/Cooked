import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface AllergyOption {
  id: string;
  title: string;
  icon: string;
  iconFamily: 'ion' | 'mci';
  color: string;
}

const ALLERGY_OPTIONS: AllergyOption[] = [
  { id: 'tree_nuts', title: 'Tree Nuts', icon: 'nutrition-outline', iconFamily: 'ion', color: '#D2691E' },
  { id: 'peanuts', title: 'Peanuts', icon: 'peanut-outline', iconFamily: 'mci', color: '#CD853F' },
  { id: 'shellfish', title: 'Shellfish', icon: 'fish-off', iconFamily: 'mci', color: '#4682B4' },
  { id: 'fish', title: 'Fish', icon: 'fish', iconFamily: 'mci', color: '#1E90FF' },
  { id: 'eggs', title: 'Eggs', icon: 'egg-outline', iconFamily: 'mci', color: '#F4A460' },
  { id: 'soy', title: 'Soy', icon: 'sprout-outline', iconFamily: 'mci', color: '#2E8B57' },
  { id: 'dairy', title: 'Dairy / Milk', icon: 'cup-outline', iconFamily: 'mci', color: '#4169E1' },
  { id: 'wheat', title: 'Wheat / Gluten', icon: 'barley', iconFamily: 'mci', color: '#DAA520' },
  { id: 'sesame', title: 'Sesame', icon: 'leaf-outline', iconFamily: 'ion', color: '#8F8F8F' },
  { id: 'others', title: 'Others', icon: 'add-circle-outline', iconFamily: 'ion', color: Colors.textMuted }
];

export default function AllergiesScreen() {
  const router = useRouter();
  const { profile, toggleAllergy, setProfile, saveOnboardingStep } = useUserStore();
  const selectedAllergies = profile.allergies;

  const [showOthersInput, setShowOthersInput] = useState(selectedAllergies.includes('others'));
  const [customAllergy, setCustomAllergy] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    if (id === 'no_allergies') {
      setProfile({ allergies: ['no_allergies'] });
      setShowOthersInput(false);
      setCustomTags([]);
    } else {
      let updated = selectedAllergies.filter((a) => a !== 'no_allergies');
      
      if (updated.includes(id)) {
        updated = updated.filter((a) => a !== id);
        if (id === 'others') {
          setShowOthersInput(false);
          setCustomTags([]);
        }
      } else {
        updated.push(id);
        if (id === 'others') {
          setShowOthersInput(true);
        }
      }
      
      if (updated.length === 0) {
        updated = ['no_allergies'];
      }
      setProfile({ allergies: updated });
    }
  };

  const handleAddCustomTag = () => {
    const text = customAllergy.trim();
    if (!text) return;
    if (!customTags.includes(text)) {
      const updatedTags = [...customTags, text];
      setCustomTags(updatedTags);
      // Append custom tag names directly to user allergies store
      setProfile({
        allergies: [...selectedAllergies.filter((a) => a !== 'no_allergies'), text]
      });
    }
    setCustomAllergy('');
  };

  const handleRemoveCustomTag = (tag: string) => {
    const updatedTags = customTags.filter((t) => t !== tag);
    setCustomTags(updatedTags);
    setProfile({
      allergies: selectedAllergies.filter((a) => a !== tag)
    });
  };

  const handleContinue = async () => {
    await saveOnboardingStep(6);
    router.push('/onboarding/dislikes');
  };

  const renderIcon = (option: AllergyOption, isSelected: boolean) => {
    const color = isSelected ? option.color : Colors.textMuted;
    if (option.iconFamily === 'ion') {
      return <Ionicons name={option.icon as any} size={24} color={color} />;
    }
    return <MaterialCommunityIcons name={option.icon as any} size={24} color={color} />;
  };

  const isNoAllergiesSelected = selectedAllergies.includes('no_allergies');

  return (
    <OnboardingWrapper
      currentStep="allergies"
      title="Any allergies?"
      subtitle="Your safety is our top priority"
    >
      <View style={styles.content}>
        <View style={styles.grid}>
          {ALLERGY_OPTIONS.map((option) => {
            const isSelected = selectedAllergies.includes(option.id);
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
                {renderIcon(option, isSelected)}
                <Text style={styles.cardTitle}>{option.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Input for "Others" selected (Page 7) */}
        {showOthersInput && (
          <View style={styles.customInputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type an allergy..."
                placeholderTextColor={Colors.textLight}
                value={customAllergy}
                onChangeText={setCustomAllergy}
                onSubmitEditing={handleAddCustomTag}
              />
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={handleAddCustomTag}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {customTags.length > 0 && (
              <View style={styles.tagsContainer}>
                {customTags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveCustomTag(tag)}>
                      <Ionicons name="close-circle" size={16} color={Colors.white} style={styles.tagClose} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* No Allergies checkbox (Page 6) */}
        <TouchableOpacity
          style={[
            styles.noAllergiesBtn,
            isNoAllergiesSelected ? styles.noAllergiesBtnActive : null
          ]}
          onPress={() => handleSelect('no_allergies')}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isNoAllergiesSelected ? 'checkmark-circle' : 'ellipse-outline'} 
            size={22} 
            color={isNoAllergiesSelected ? Colors.success : Colors.textMuted} 
          />
          <Text style={[
            styles.noAllergiesText,
            isNoAllergiesSelected ? styles.noAllergiesTextActive : null
          ]}>
            No allergies
          </Text>
        </TouchableOpacity>

        {/* Warning Note */}
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={20} color={Colors.warning} />
          <Text style={styles.alertText}>
            We'll try not to include these in your recommendations
          </Text>
        </View>
      </View>

      <Button
        title="Continue"
        onPress={handleContinue}
        variant={selectedAllergies.length > 0 ? 'primary' : 'disabled'}
        style={styles.continueButton}
      />
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
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
    height: 76,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    ...Colors.shadowSubtle,
  },
  cardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  customInputContainer: {
    marginTop: 8,
    marginBottom: 16,
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
    marginTop: 12,
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
  noAllergiesBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 12,
    ...Colors.shadowSubtle,
  },
  noAllergiesBtnActive: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  noAllergiesText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 8,
  },
  noAllergiesTextActive: {
    color: Colors.success,
    fontWeight: '700',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE0A3',
    marginVertical: 12,
  },
  alertText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  continueButton: {
    marginTop: 16,
  },
});
