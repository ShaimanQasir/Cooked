import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../../store/useRecipeStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function ScanCameraScreen() {
  const router = useRouter();
  const { addScannedIngredient } = useRecipeStore();

  const handleCapture = () => {
    // Mock capturing ingredients (Garlic, Parsley, Pasta) and go to saved list
    addScannedIngredient('Garlic');
    addScannedIngredient('Parsley');
    addScannedIngredient('Fettuccine Pasta');
    router.push('/scan/saved-ingredients');
  };

  const handleTabPress = (tabName: string) => {
    if (tabName === 'type') {
      router.push('/scan/type-ingredient');
    } else if (tabName === 'saved') {
      router.push('/scan/saved-ingredients');
    }
  };

  return (
    <View style={styles.container}>
      {/* Refrigerator Shelf Mock Viewport (Representing Page 38 background) */}
      <View style={styles.cameraViewport}>
        
        {/* Mock Fridge Shelves with Colored Blocks representing ingredients */}
        <View style={styles.mockFridge}>
          <View style={styles.mockShelf}>
            <View style={[styles.mockItem, { backgroundColor: '#FFD700', width: 60 }]}><Text style={styles.itemText}>🍋 Lemons</Text></View>
            <View style={[styles.mockItem, { backgroundColor: '#FF4500', width: 70 }]}><Text style={styles.itemText}>🍅 Tomatoes</Text></View>
            <View style={[styles.mockItem, { backgroundColor: '#FFE4C4', width: 50 }]}><Text style={styles.itemText}>🧄 Garlic</Text></View>
          </View>
          <View style={styles.mockShelf}>
            <View style={[styles.mockItem, { backgroundColor: '#32CD32', width: 80 }]}><Text style={styles.itemText}>🥦 Broccoli</Text></View>
            <View style={[styles.mockItem, { backgroundColor: '#FFA500', width: 60 }]}><Text style={styles.itemText}>🧀 Cheese</Text></View>
          </View>
          <View style={styles.mockShelf}>
            <View style={[styles.mockItem, { backgroundColor: '#F0E68C', width: 90 }]}><Text style={styles.itemText}>🍝 Pasta</Text></View>
            <View style={[styles.mockItem, { backgroundColor: '#FFFDD0', width: 50 }]}><Text style={styles.itemText}>🥚 Eggs</Text></View>
          </View>
        </View>

        {/* Scan Brackets Overlay */}
        <View style={styles.bracketOverlayContainer}>
          <View style={styles.scanTarget}>
            {/* Top-Left Bracket */}
            <View style={[styles.bracket, styles.bracketTL]} />
            {/* Top-Right Bracket */}
            <View style={[styles.bracket, styles.bracketTR]} />
            {/* Bottom-Left Bracket */}
            <View style={[styles.bracket, styles.bracketBL]} />
            {/* Bottom-Right Bracket */}
            <View style={[styles.bracket, styles.bracketBR]} />
          </View>
        </View>
      </View>

      <SafeAreaView style={styles.overlayContainer}>
        {/* Top Header Row */}
        <View style={styles.topHeader}>
          <TouchableOpacity 
            onPress={() => router.replace('/(tabs)/')} 
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={26} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Bottom Panel Row */}
        <View style={styles.bottomPanel}>
          <View style={styles.actionRow}>
            {/* Gallery Selector */}
            <TouchableOpacity style={styles.galleryBtn} activeOpacity={0.8}>
              <Ionicons name="images-outline" size={24} color="#F5E8C7" />
            </TouchableOpacity>

            {/* Shutter Capture Button */}
            <TouchableOpacity 
              style={styles.shutterBtn}
              onPress={handleCapture}
              activeOpacity={0.8}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <View style={styles.spacerBtn} />
          </View>

          {/* Mode Tabs Select (Scan / Type / Saved) */}
          <View style={styles.modeTabsBg}>
            <TouchableOpacity style={styles.modeTabActive} activeOpacity={0.8}>
              <Text style={styles.modeTabTextActive}>Scan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modeTab} 
              onPress={() => handleTabPress('type')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeTabText}>Type Ingredients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modeTab} 
              onPress={() => handleTabPress('saved')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeTabText}>Saved</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  cameraViewport: {
    ...StyleSheet.absoluteFill,
  },
  mockFridge: {
    flex: 1,
    paddingTop: 100,
    paddingBottom: 200,
    justifyContent: 'space-around',
    opacity: 0.6,
  },
  mockShelf: {
    height: 60,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  mockItem: {
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  bracketOverlayContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTarget: {
    width: width * 0.75,
    height: height * 0.4,
    position: 'relative',
  },
  bracket: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#C63A2F',
    borderWidth: 4,
  },
  bracketTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  bracketTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bracketBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bracketBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 0 : 24,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPanel: {
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 16 : 30,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 36,
    marginBottom: 28,
  },
  galleryBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.white,
  },
  spacerBtn: {
    width: 50,
  },
  modeTabsBg: {
    flexDirection: 'row',
    backgroundColor: '#FAF3E0', // Cream yellow container
    height: 54,
    borderRadius: 27,
    padding: 4,
    alignItems: 'center',
    width: width - 40,
    justifyContent: 'space-between',
  },
  modeTabActive: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: '100%',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTabTextActive: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modeTab: {
    flex: 1.2,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTabText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
