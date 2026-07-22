import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface DietaryOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconFamily: 'ion' | 'mci';
  color: string;
}

const DIETARY_OPTIONS: DietaryOption[] = [
  { id: 'none', title: 'No Restrictions', subtitle: 'I Eat Everything', icon: 'restaurant-outline', iconFamily: 'ion', color: '#C63A2F' },
  { id: 'vegetarian', title: 'Vegetarian', subtitle: 'No Meat/Fish, Dairy & Eggs are OK', icon: 'carrot', iconFamily: 'mci', color: '#2B8255' },
  { id: 'vegan', title: 'Vegan', subtitle: 'No Animals Products', icon: 'leaf-outline', iconFamily: 'ion', color: '#4CAF50' },
  { id: 'pescatarian', title: 'Pescatarian', subtitle: 'Fish OK, No other Meat', icon: 'fish', iconFamily: 'mci', color: '#008080' },
  { id: 'gluten-free', title: 'Gluten-Free', subtitle: 'No Wheat or Gluten', icon: 'barley-off', iconFamily: 'mci', color: '#D2B48C' },
  { id: 'halal', title: 'Halal', subtitle: 'Islamic Dietary Laws', icon: 'star-crescent', iconFamily: 'mci', color: '#A020F0' },
  { id: 'kosher', title: 'Kosher', subtitle: 'Jewish Dietary Laws', icon: 'star-outline', iconFamily: 'ion', color: '#1E90FF' },
  { id: 'lactose-intolerant', title: 'Lactose Intolerant', subtitle: 'No Dairy', icon: 'baby-bottle-outline', iconFamily: 'mci', color: '#FF7F50' },
  { id: 'keto', title: 'Keto/Low-Carb', subtitle: 'High Fat, Low Carb', icon: 'food-drumstick-outline', iconFamily: 'mci', color: '#8B4513' },
  { id: 'diabetic', title: 'Diabetic-Friendly', subtitle: 'Low GI Focus', icon: 'needle', iconFamily: 'mci', color: '#20B2AA' },
  { id: 'paleo', title: 'Paleo', subtitle: 'Whole Foods Only', icon: 'bone', iconFamily: 'mci', color: '#708090' },
  { id: 'other', title: 'Other', subtitle: 'Type your own', icon: 'add-circle-outline', iconFamily: 'ion', color: Colors.textMuted },
];

export default function DietaryScreen() {
  const router = useRouter();
  const { profile, toggleDietaryProfile, setProfile, saveOnboardingStep } = useUserStore();
  const selectedDiets = profile.dietaryProfile;

  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customDiet, setCustomDiet] = useState('');

  const handleSelect = (id: string) => {
    if (id === 'none') {
      setProfile({ dietaryProfile: ['none'] });
      setShowOtherInput(false);
      setCustomDiet('');
    } else if (id === 'other') {
      setShowOtherInput(!showOtherInput);
    } else {
      let newDiets = selectedDiets.filter((d) => d !== 'none' && d !== 'other');
      if (newDiets.includes(id)) {
        newDiets = newDiets.filter((d) => d !== id);
      } else {
        newDiets.push(id);
      }
      setProfile({ dietaryProfile: newDiets });
    }
  };

  const handleAddCustomDiet = () => {
    const name = customDiet.trim();
    if (!name) return;
    const currentDiets = selectedDiets.filter((d) => d !== 'none' && d !== 'other');
    if (!currentDiets.includes(name)) {
      setProfile({ dietaryProfile: [...currentDiets, name] });
    }
    setCustomDiet('');
  };

  const handleRemoveCustomDiet = (name: string) => {
    const updated = selectedDiets.filter((d) => d !== name);
    setProfile({ dietaryProfile: updated });
  };

  const handleContinue = async () => {
    await saveOnboardingStep(5);
    router.push('/onboarding/allergies');
  };

  const renderIcon = (option: DietaryOption, isSelected: boolean) => {
    const color = isSelected ? option.color : Colors.textMuted;
    if (option.iconFamily === 'ion') {
      return <Ionicons name={option.icon as any} size={26} color={color} />;
    }
    return <MaterialCommunityIcons name={option.icon as any} size={26} color={color} />;
  };

  const customDiets = selectedDiets.filter(
    (d) => !DIETARY_OPTIONS.some((o) => o.id === d) && d !== 'none' && d !== 'other'
  );

  return (
    <OnboardingWrapper
      currentStep="dietary"
      title={`${profile.name || 'Zain'}, what's your dietary profile?`}
      subtitle="Select all that apply"
    >
      <View style={styles.content}>
        <View style={styles.grid}>
          {DIETARY_OPTIONS.map((option) => {
            const isSelected = selectedDiets.includes(option.id);
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
                <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Input */}
        {showOtherInput && (
          <View style={styles.customInputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a dietary restriction..."
                placeholderTextColor={Colors.textLight}
                value={customDiet}
                onChangeText={setCustomDiet}
                onSubmitEditing={handleAddCustomDiet}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddCustomDiet}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Custom Tags Display */}
        {customDiets.length > 0 && (
          <View style={styles.tagsContainer}>
            {customDiets.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveCustomDiet(tag)}>
                  <Ionicons name="close-circle" size={16} color={Colors.white} style={styles.tagClose} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

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
        variant={selectedDiets.length > 0 ? 'primary' : 'disabled'}
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
    minHeight: 120,
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 13,
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
  continueButton: {
    marginTop: 24,
  },
});
