import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type MemberCardProps = {
  displayName: string;
  level: string;
  focus: string;
  availabilityLabel: string;
  onPress: () => void;
};

/** Carte membre (PDF p.21) : nom, niveau, objectif, disponibilités. */
export function MemberCard({
  displayName,
  level,
  focus,
  availabilityLabel,
  onPress,
}: MemberCardProps) {
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
          borderColor: theme.backgroundSelected,
          opacity: pressed ? 0.88 : 1,
        },
      ]}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
          <Text style={[styles.avatarText, { color: theme.text }]}>{initial}</Text>
        </View>

        <View style={styles.identity}>
          <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
          <Text style={[styles.focus, { color: theme.textSecondary }]}>
            Objectif : {focus}
          </Text>
        </View>

        <View style={[styles.levelBadge, { backgroundColor: theme.backgroundSelected }]}>
          <Text style={[styles.levelText, { color: theme.text }]}>{level}</Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.backgroundSelected }]}>
        <Text style={[styles.availability, { color: theme.textSecondary }]}>
          Dispo : {availabilityLabel}
        </Text>
        <Text style={[styles.action, { color: theme.text }]}>Voir le profil</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  identity: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  focus: {
    fontSize: 14,
  },
  levelBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
  },
  availability: {
    fontSize: 13,
    flex: 1,
    paddingRight: Spacing.two,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
  },
});
