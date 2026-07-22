import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function MyAccountScreen() {
  const router = useRouter();
  const { profile, setProfile, updateProfile } = useUserStore();

  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveChanges = async () => {
    if (!name.trim() || !email.trim()) return;

    setApiError('');
    setSuccessMsg('');
    setLoading(true);

    setProfile({ name: name.trim(), email: email.trim() });

    const result = await updateProfile({
      language: profile.language,
      primary_region: profile.region,
      measurement_system: profile.measurementSystem === 'Imperial' ? 'IMPERIAL' : 'METRIC',
    });

    setLoading(false);

    if (result.success) {
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => {
        router.back();
      }, 1000);
    } else {
      setApiError(result.error || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Account</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarBorder}>
            <Skeleton width={110} height={110} borderRadius={55} icon="person" />
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.changePicText}>Change Picture</Text>
          </TouchableOpacity>
        </View>

        {apiError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        ) : null}

        {successMsg ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{successMsg}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label="Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (apiError) setApiError('');
            }}
            placeholder="Your name"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (apiError) setApiError('');
            }}
            placeholder="your-mail@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Button
          title="Save Changes"
          onPress={handleSaveChanges}
          loading={loading}
          disabled={loading}
          style={styles.saveBtn}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  spacer: {
    width: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarBorder: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 60,
    padding: 4,
    marginBottom: 12,
  },
  changePicText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  errorBanner: {
    backgroundColor: '#FFF1F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successBannerText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  saveBtn: {
    marginTop: 8,
  },
});
