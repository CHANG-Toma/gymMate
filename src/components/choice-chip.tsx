import { Pressable, StyleSheet, Text } from 'react-native';

import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';

export type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function ChoiceChip({ label, selected, onPress }: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: Brand.accent, borderColor: Brand.accent }
          : { backgroundColor: Brand.surface, borderColor: Brand.border },
      ]}>
      <Text style={[styles.label, { color: selected ? Brand.onAccent : Brand.white }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
});
