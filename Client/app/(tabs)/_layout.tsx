import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

function TabIcon({
  name,
  focused,
  color,
  label,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
  color: any;
  label: string;
}) {
  const iconName = (focused ? name : `${name}-outline`) as React.ComponentProps<typeof Ionicons>['name'];
  return (
    <View style={styles.tabItemWrapper}>
      <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
        <Ionicons name={iconName} size={20} color={focused ? Colors.primary : Colors.textMuted} />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </View>
  );
}

function FloatingCameraButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.floatingButtonContainer}
    >
      <View style={styles.floatingOuterRing}>
        <View style={styles.floatingButton}>
          <Ionicons name="camera" size={24} color={Colors.white} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: { display: 'none' }, // We render custom labels inside TabIcon
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" focused={focused} color={color} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="compass" focused={focused} color={color} label="Explore" />
          ),
        }}
      />
      <Tabs.Screen
        name="scan-camera"
        options={{
          title: '',
          tabBarButton: (props) => {
            const { delayLongPress, disabled, accessibilityLabel, testID, ...rest } = props;
            return (
              <FloatingCameraButton onPress={() => rest.onPress?.(undefined as any)} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="cookbook-hub"
        options={{
          title: 'Cookbook',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="book" focused={focused} color={color} label="Cookbook" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile-tab"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" focused={focused} color={color} label="Profile" />
          ),
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    marginHorizontal: 18,
    height: 66,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    paddingBottom: 0,
    paddingTop: 0,
    shadowColor: '#1C1C1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(235, 234, 228, 0.9)',
  },
  tabBarItem: {
    height: 66,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 4,
  },
  tabItemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 60,
  },
  iconContainer: {
    width: 36,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#FFF1F0',
  },
  tabLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  floatingButtonContainer: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  floatingOuterRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF1F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
