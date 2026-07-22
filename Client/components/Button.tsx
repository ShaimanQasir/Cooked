import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'disabled';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isButtonDisabled = disabled || loading || variant === 'disabled';

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      case 'disabled':
        return styles.disabledButton;
      case 'primary':
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textVariantText;
      case 'disabled':
        return styles.disabledText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  if (variant === 'primary' && !isButtonDisabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        disabled={isButtonDisabled}
        style={[styles.button, { paddingHorizontal: 0, borderHeight: 0 }, style]}
      >
        <LinearGradient
          colors={['#E85B50', '#C63A2F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              {icon && icon}
              <Text style={[styles.text, styles.primaryText, textStyle, icon ? { marginLeft: 8 } : null]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isButtonDisabled}
      style={[styles.button, getButtonStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'disabled' ? Colors.white : Colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.text, getTextStyle(), textStyle, icon ? { marginLeft: 8 } : null]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28, // Capsule rounded button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  gradient: {
    flex: 1,
    height: '100%',
    width: '100%',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.cardAlt,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  outlineButton: {
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  textButton: {
    backgroundColor: Colors.transparent,
    height: 'auto',
    borderRadius: 0,
    paddingHorizontal: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledButton: {
    backgroundColor: Colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.text,
  },
  outlineText: {
    color: Colors.primary,
  },
  textVariantText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  disabledText: {
    color: Colors.textLight,
  },
});

export default Button;
