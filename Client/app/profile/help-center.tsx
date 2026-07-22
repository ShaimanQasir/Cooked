import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function HelpCenterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Row (Page 56) */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Center</Text>
          <View style={styles.spacer} />
        </View>

        {/* Text descriptions */}
        <View style={styles.infoWrapper}>
          <Text style={styles.headline}>Tell us how we can help 👋</Text>
          <Text style={styles.subheadline}>
            Chapter are standing by for service & support!
          </Text>
        </View>

        {/* Contact Choices Row (Page 56) */}
        <View style={styles.cardsRow}>
          {/* Email card */}
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.iconBg}>
              <Ionicons name="mail" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Email</Text>
            <Text style={styles.cardDesc}>Send to your email</Text>
          </TouchableOpacity>

          {/* Phone card */}
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.iconBg}>
              <Ionicons name="call" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Phone Number</Text>
            <Text style={styles.cardDesc}>Send to your phone</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
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
  infoWrapper: {
    marginBottom: 32,
    marginTop: 8,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  subheadline: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    ...Colors.shadowSubtle,
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFF1F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  cardDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
