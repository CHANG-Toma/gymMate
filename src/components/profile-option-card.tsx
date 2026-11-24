import { Pressable, StyleSheet, Text } from 'react-native';

import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';

type ProfileOptionCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

export function ProfileOptionCard({
  title,
  description,
  selected,
  onPress,
}: ProfileOptionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.card,
        selected
          ? { backgroundColor: Brand.accent, borderColor: Brand.accent }
          : { backgroundColor: Brand.surface, borderColor: Brand.border },
      ]}>
      <Text style={[styles.title, { color: selected ? Brand.onAccent : Brand.white }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: selected ? Brand.onAccent : Brand.muted }]}>
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});
