import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface TrendItem {
  id: string;
  title: string;
}

const TRENDING_TOPICS: TrendItem[] = [
  { id: '1', title: 'High protein dinner' },
  { id: '2', title: 'Quinoa salad with chickpeas' },
  { id: '3', title: 'Grilled salmon with asparagus' },
  { id: '4', title: 'Stuffed bell peppers with turkey' },
  { id: '5', title: 'Lentil soup with spinach' },
  { id: '6', title: 'Tofu stir-fry with broccoli' }
];

export default function ImportScreen() {
  const router = useRouter();
  const [linkInput, setLinkInput] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const handleImport = () => {
    if (!linkInput.trim()) return;
    console.log('Importing recipe from:', linkInput);
    setLinkInput('');
    // Route to home/scanned ingredients or matching recipe
    router.push('/(tabs)/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Title */}
        <Text style={styles.headerTitle}>Import</Text>

        {/* Recipe Link section */}
        <Text style={styles.sectionTitle}>Recipe Link</Text>
        
        {/* Social Platforms icon list */}
        <View style={styles.socialRow}>
          <FontAwesome5 name="instagram" size={22} color={Colors.textMuted} style={styles.socialIcon} />
          <FontAwesome5 name="facebook" size={22} color={Colors.textMuted} style={styles.socialIcon} />
          <FontAwesome5 name="tiktok" size={22} color={Colors.textMuted} style={styles.socialIcon} />
          <FontAwesome5 name="youtube" size={22} color={Colors.textMuted} style={styles.socialIcon} />
        </View>

        {/* Paste link input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Paste a recipe link..."
            placeholderTextColor={Colors.textLight}
            value={linkInput}
            onChangeText={setLinkInput}
            style={styles.textInput}
          />
          <TouchableOpacity style={styles.pasteBtn}>
            <Ionicons name="clipboard-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Import button */}
        <TouchableOpacity 
          style={styles.importBtn}
          onPress={handleImport}
          activeOpacity={0.8}
        >
          <Text style={styles.importBtnText}>Import Recipes</Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Search Web input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            placeholder="Search web"
            placeholderTextColor={Colors.textLight}
            value={searchInput}
            onChangeText={setSearchInput}
            style={styles.searchInput}
          />
        </View>

        {/* Trending Section */}
        <Text style={styles.trendingHeader}>Trending</Text>
        <View style={styles.trendingContainer}>
          {TRENDING_TOPICS.map((topic) => (
            <TouchableOpacity key={topic.id} style={styles.trendingRow} activeOpacity={0.7}>
              <Ionicons name="trending-up-outline" size={16} color={Colors.textMuted} style={styles.trendIcon} />
              <Text style={styles.trendText}>{topic.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Imports section (Page 45) */}
        <View style={styles.recentHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Imports</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentImportsList}>
          {/* Item 1 */}
          <View style={styles.importItem}>
            <Skeleton width={44} height={44} borderRadius={22} icon="pizza" />
            <View style={styles.importItemInfo}>
              <Text style={styles.importItemTitle}>Cheese Omlete</Text>
              <Text style={styles.importItemSource}>
                <Ionicons name="logo-instagram" size={12} color={Colors.textLight} /> Instagram
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </View>

          {/* Item 2 */}
          <View style={styles.importItem}>
            <Skeleton width={44} height={44} borderRadius={22} icon="restaurant" />
            <View style={styles.importItemInfo}>
              <Text style={styles.importItemTitle}>Alfredo Fettuccini</Text>
              <Text style={styles.importItemSource}>
                <Ionicons name="globe-outline" size={12} color={Colors.textLight} /> The mountain blog
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </View>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  socialIcon: {
    marginHorizontal: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  pasteBtn: {
    paddingLeft: 12,
  },
  importBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Colors.shadowSubtle,
  },
  importBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textLight,
    marginHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 24,
    ...Colors.shadowSubtle,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  trendingHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  trendingContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    marginBottom: 24,
    ...Colors.shadowSubtle,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.cardAlt,
  },
  trendIcon: {
    marginRight: 12,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  recentImportsList: {
    marginTop: 4,
  },
  importItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 12,
    ...Colors.shadowSubtle,
  },
  importItemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  importItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  importItemSource: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textLight,
    marginTop: 4,
  },
});
