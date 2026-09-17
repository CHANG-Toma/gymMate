import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type MemberCardProps = {
  displayName: string;
  focus: string;
  boxName: string;
  onPress: () => void;
};

export function MemberCard({ displayName, focus, boxName, onPress }: MemberCardProps) {
  const theme = useTheme();
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Voir le profil CrossFit de ${displayName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
        <Text style={[styles.avatarText, { color: theme.text }]}>{initial}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
        <Text style={[styles.focus, { color: theme.textSecondary }]}>CrossFit · {focus}</Text>
        <Text style={[styles.box, { color: theme.textSecondary }]}>{boxName}</Text>
      </View>
      <Text style={[styles.action, { color: theme.text }]}>Voir le profil</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
  },
  focus: {
    fontSize: 14,
  },
  box: {
    fontSize: 13,
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
  },
});
