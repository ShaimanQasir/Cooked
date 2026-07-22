import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import { useRecipeStore } from '../../store/useRecipeStore';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  badge?: string;
  isDestructive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, badge, isDestructive = false }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <View style={[styles.menuItemIcon, isDestructive && styles.menuItemIconDestructive]}>
        <Ionicons
          name={icon}
          size={18}
          color={isDestructive ? Colors.primary : Colors.textMuted}
        />
      </View>
      <Text style={[styles.menuItemText, isDestructive ? styles.menuItemTextDestructive : null]}>
        {title}
      </Text>
    </View>
    <View style={styles.menuItemRight}>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isDestructive ? Colors.primary : Colors.textLight}
      />
    </View>
  </TouchableOpacity>
);

export default function ProfileTabScreen() {
  const router = useRouter();
  const { profile, currentUserId } = useUserStore();
  const { recipes, savedRecipes, recentlyViewedIds } = useRecipeStore();

  const handleLogoutPress = () => {
    router.push('/auth/logout-modal');
  };

  const myRecipesCount = recipes.filter((r) => r.authorId === currentUserId).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarBorder}>
              <Skeleton width={72} height={72} borderRadius={36} icon="person" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name || 'Chef'}</Text>
              <Text style={styles.profileEmail}>{profile.email || 'user@cooked.app'}</Text>
              <View style={styles.chefBadge}>
                <Ionicons name="ribbon-outline" size={12} color={Colors.primary} />
                <Text style={styles.chefBadgeText}>Culinary Creator</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => router.push('/profile/account')}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats Shortcuts */}
          <View style={styles.statsShortcutRow}>
            <TouchableOpacity
              style={styles.statShortcutItem}
              onPress={() => router.push('/recipe/my-recipes')}
              activeOpacity={0.8}
            >
              <Text style={styles.statShortcutVal}>{myRecipesCount}</Text>
              <Text style={styles.statShortcutKey}>Recipes</Text>
            </TouchableOpacity>
            <View style={styles.statShortcutDivider} />
            <TouchableOpacity
              style={styles.statShortcutItem}
              onPress={() => router.push('/profile/favorites')}
              activeOpacity={0.8}
            >
              <Text style={styles.statShortcutVal}>{savedRecipes.length}</Text>
              <Text style={styles.statShortcutKey}>Favorites</Text>
            </TouchableOpacity>
            <View style={styles.statShortcutDivider} />
            <TouchableOpacity
              style={styles.statShortcutItem}
              onPress={() => router.push('/profile/recent')}
              activeOpacity={0.8}
            >
              <Text style={styles.statShortcutVal}>{recentlyViewedIds.length}</Text>
              <Text style={styles.statShortcutKey}>Recent</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Sections */}
        <Text style={styles.sectionTitle}>Account</Text>
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
        </View>

        <Text style={styles.sectionTitle}>Activity</Text>
        <View style={styles.menuList}>
          <MenuItem
            icon="restaurant-outline"
            title="My Recipes"
            onPress={() => router.push('/recipe/my-recipes')}
            badge={myRecipesCount > 0 ? String(myRecipesCount) : undefined}
          />
          <MenuItem
            icon="heart-outline"
            title="Favorites"
            onPress={() => router.push('/profile/favorites')}
            badge={savedRecipes.length > 0 ? String(savedRecipes.length) : undefined}
          />
          <MenuItem
            icon="time-outline"
            title="Recent Recipes"
            onPress={() => router.push('/profile/recent')}
          />
        </View>

        <Text style={styles.sectionTitle}>Support & System</Text>
        <View style={styles.menuList}>
          <MenuItem
            icon="help-circle-outline"
            title="Help Center"
            onPress={() => router.push('/profile/help-center')}
          />
          <MenuItem
            icon="document-text-outline"
            title="Terms & Privacy"
            onPress={() => {}}
          />
          <MenuItem
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogoutPress}
            isDestructive={true}
          />
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Cooked v1.0.0</Text>
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
    paddingTop: 12,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#1C1C1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBorder: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 40,
    padding: 2,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  chefBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    marginTop: 6,
  },
  chefBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  editProfileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF1F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsShortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 16,
    paddingTop: 14,
  },
  statShortcutItem: {
    alignItems: 'center',
    flex: 1,
  },
  statShortcutVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  statShortcutKey: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  statShortcutDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 4,
  },
  menuList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemIconDestructive: {
    backgroundColor: '#FFF1F0',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  menuItemTextDestructive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
