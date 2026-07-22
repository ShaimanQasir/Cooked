import React from 'react';
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
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  isDestructive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, isDestructive = false }) => (
  <TouchableOpacity 
    style={styles.menuItem} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <Ionicons 
        name={icon} 
        size={22} 
        color={isDestructive ? Colors.primary : Colors.textMuted} 
      />
      <Text style={[styles.menuItemText, isDestructive ? styles.menuItemTextDestructive : null]}>
        {title}
      </Text>
    </View>
    <Ionicons 
      name="chevron-forward" 
      size={18} 
      color={isDestructive ? Colors.primary : Colors.textLight} 
    />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useUserStore();

  const handleLogoutPress = () => {
    // Open logout confirmation dialog (Page 35 bottom sheet)
    router.push('/auth/logout-modal');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Row (Page 53) */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.spacer} />
        </View>

        {/* Profile Avatar Header card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarBorder}>
            <Skeleton width={110} height={110} borderRadius={55} icon="person" />
          </View>
          <Text style={styles.profileName}>{profile.name || 'Adeel'}</Text>
          <Text style={styles.profileEmail}>{profile.email || ''}</Text>
        </View>

        {/* List Menu Options (Page 53) */}
        <View style={styles.menuList}>
          <MenuItem 
            icon="person-outline" 
            title="My Account" 
            onPress={() => router.push('/profile/account')} 
          />
          <MenuItem 
            icon="key-outline" 
            title="Change Password" 
            onPress={() => router.push('/profile/change-password')} 
          />
          <MenuItem 
            icon="heart-outline" 
            title="Favorites" 
            onPress={() => router.push('/profile/favorites')} 
          />
          <MenuItem 
            icon="time-outline" 
            title="Order History" 
            onPress={() => router.push('/profile/recent')} 
          />
          <MenuItem 
            icon="help-circle-outline" 
            title="Help Center" 
            onPress={() => router.push('/profile/help-center')} 
          />
          
          <View style={styles.divider} />
          
          <MenuItem 
            icon="log-out-outline" 
            title="Logout" 
            onPress={handleLogoutPress} 
            isDestructive={true}
          />
        </View>

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
  avatarCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarBorder: {
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: 62,
    padding: 4,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
  },
  menuList: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    ...Colors.shadowSubtle,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 16,
  },
  menuItemTextDestructive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginVertical: 8,
  },
});
