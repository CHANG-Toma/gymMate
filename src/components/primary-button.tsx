import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: 'accent' | 'ghost';
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = 'accent',
}: PrimaryButtonProps) {
  const isBlocked = disabled || loading;
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      disabled={isBlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isGhost
          ? {
              backgroundColor: pressed ? Brand.surfaceElevated : Brand.surface,
              borderColor: Brand.border,
              borderWidth: 1,
            }
          : {
              backgroundColor: isBlocked
                ? Brand.faint
                : pressed
                  ? Brand.accentPressed
                  : Brand.accent,
            },
        { opacity: isBlocked ? 0.55 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isGhost ? Brand.white : Brand.onAccent} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: isGhost ? Brand.white : Brand.onAccent },
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 999,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
