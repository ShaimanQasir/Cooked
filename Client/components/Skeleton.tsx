import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 150,
  borderRadius = 16,
  style,
  icon = 'restaurant-outline'
}) => {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 800 }),
        withTiming(0.6, { duration: 800 })
      ),
      -1, // Infinite repeat
      true // Reverse direction
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={[styles.container, { width, height, borderRadius } as ViewStyle, style]}>
      <Animated.View 
         style={[
          styles.shimmer, 
          { borderRadius },
          animatedStyle
        ]} 
      />
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={Math.min((typeof height === 'number' ? height : 150) * 0.3, 48)} color={Colors.textLight} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardAlt,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.border,
  },
  iconContainer: {
    position: 'absolute',
    opacity: 0.35,
  }
});

export default Skeleton;
