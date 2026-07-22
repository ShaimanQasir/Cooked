import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function LogoutModal() {
  const router = useRouter();
  const { logout } = useUserStore();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (_) {}
    setLoading(false);
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>

          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Icon */}
          <View style={styles.iconSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="log-out-outline" size={28} color={Colors.primary} />
            </View>
          </View>

          {/* Text */}
          <Text style={styles.modalTitle}>Sign Out?</Text>
          <Text style={styles.modalSubtitle}>
            You'll be signed out, but your saved recipes and cookbooks will stay safe.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.logoutBtnText}>Signing out...</Text>
              ) : (
                <Text style={styles.logoutBtnText}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  iconSection: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(198, 58, 47, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(198, 58, 47, 0.12)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  logoutBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
