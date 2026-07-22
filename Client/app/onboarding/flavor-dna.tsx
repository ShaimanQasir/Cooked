import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SpiceLevel = 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';

const SPICE_INFO: Record<SpiceLevel, { label: string; desc: string; chilis: number }> = {
  'Mild': { label: 'Mild', desc: 'No heat at all', chilis: 1 },
  'Medium': { label: 'Medium', desc: 'A subtle kick', chilis: 2 },
  'Hot': { label: 'Hot', desc: 'Pleasantly fiery', chilis: 3 },
  'Extra Hot': { label: 'Extra Hot', desc: 'Extreme heat level', chilis: 5 },
};

export default function FlavorDnaScreen() {
  const router = useRouter();
  const { profile, setProfile } = useUserStore();

  const [spice, setSpice] = useState<SpiceLevel>('Mild');
  const [sweetSavory, setSweetSavory] = useState(50);
  const [crunchySoft, setCrunchySoft] = useState(50);

  const getDnaTags = () => {
    const tags: string[] = [];
    
    // Spice tag
    if (spice === 'Mild') tags.push('Mild Spice');
    else if (spice === 'Medium') tags.push('Medium Spice');
    else tags.push('Spicy Lover');

    // Sweet/Savory tag
    if (sweetSavory < 35) tags.push('Sweet Tooth');
    else if (sweetSavory > 65) tags.push('Savory Fan');
    else tags.push('Balanced Flavors');

    // Texture tag
    if (crunchySoft < 35) tags.push('Crunchy Textures');
    else if (crunchySoft > 65) tags.push('Creamy Textures');
    else tags.push('Balanced Textures');

    return tags;
  };

  const handleContinue = () => {
    router.push('/onboarding/skill-level');
  };

  // Simple custom Slider Component to avoid package linking issues
  const CustomSlider = ({ 
    value, 
    onValueChange, 
    leftLabel, 
    rightLabel, 
    leftIcon, 
    rightIcon 
  }: { 
    value: number; 
    onValueChange: (val: number) => void; 
    leftLabel: string; 
    rightLabel: string;
    leftIcon: string;
    rightIcon: string;
  }) => {
    const sliderWidth = Dimensions.get('window').width - 80;
    
    const handleTouch = (event: any) => {
      const x = event.nativeEvent.locationX;
      const percent = Math.max(0, Math.min(100, Math.round((x / sliderWidth) * 100)));
      onValueChange(percent);
    };

    return (
      <View style={styles.sliderWrapper}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>
            <MaterialCommunityIcons name={leftIcon as any} size={16} color={Colors.textMuted} /> {leftLabel}
          </Text>
          <Text style={styles.sliderLabel}>
            {rightLabel} <MaterialCommunityIcons name={rightIcon as any} size={16} color={Colors.textMuted} />
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.sliderTrackContainer}
          onPress={handleTouch}
          activeOpacity={0.9}
        >
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${value}%` }]} />
            <View style={[styles.sliderThumb, { left: `${value}%` }]} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <OnboardingWrapper
      currentStep="flavor-dna"
      title="Your flavor DNA"
      subtitle="Move the sliders to match your taste"
    >
      <View style={styles.content}>
        {/* Spice Tolerance Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Spice Tolerance</Text>
          
          <View style={styles.spiceRow}>
            {/* Chilis render */}
            <View style={styles.chiliContainer}>
              {(['Mild', 'Medium', 'Hot', 'Extra Hot'] as SpiceLevel[]).map((level) => {
                const isSelected = spice === level;
                const chiliCount = SPICE_INFO[level].chilis;
                
                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.chiliPill, isSelected ? styles.chiliPillActive : null]}
                    onPress={() => setSpice(level)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.chilisInline}>
                      {Array.from({ length: Math.min(chiliCount, 3) }).map((_, i) => (
                        <MaterialCommunityIcons
                          key={i}
                          name="chili-hot"
                          size={22}
                          color={isSelected ? Colors.primary : Colors.textLight}
                        />
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description Text */}
            <View style={styles.spiceLabelWrapper}>
              <Text style={styles.spiceLabelText}>{SPICE_INFO[spice].label}</Text>
              <Text style={styles.spiceDescText}>{SPICE_INFO[spice].desc}</Text>
            </View>
          </View>
        </View>

        {/* Sliders Card */}
        <View style={styles.sectionCard}>
          <CustomSlider
            value={sweetSavory}
            onValueChange={setSweetSavory}
            leftLabel="Sweet"
            rightLabel="Savory"
            leftIcon="cake-variant"
            rightIcon="salt-shaker"
          />

          <View style={styles.divider} />

          <CustomSlider
            value={crunchySoft}
            onValueChange={setCrunchySoft}
            leftLabel="Crunchy textures"
            rightLabel="Soft & creamy"
            leftIcon="food-croissant"
            rightIcon="cheese"
          />
        </View>

        {/* Flavor DNA Output Box */}
        <View style={styles.dnaOutputBox}>
          <Text style={styles.dnaTitle}>Your Flavor DNA:</Text>
          <View style={styles.tagsContainer}>
            {getDnaTags().map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Button title="Continue" onPress={handleContinue} style={styles.continueButton} />
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
    ...Colors.shadowSubtle,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  spiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chiliContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  chiliPill: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
  },
  chiliPillActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF1F0',
  },
  chilisInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spiceLabelWrapper: {
    width: 120,
    alignItems: 'flex-end',
  },
  spiceLabelText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  spiceDescText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'right',
  },
  sliderWrapper: {
    marginVertical: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  sliderTrackContainer: {
    height: 30,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: -9,
    marginLeft: -12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  dnaOutputBox: {
    backgroundColor: '#F5F5F3',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  dnaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    ...Colors.shadowSubtle,
  },
  tagText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  continueButton: {
    marginTop: 20,
  },
});
