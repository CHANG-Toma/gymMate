import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChoiceChip } from '@/components/choice-chip';
import { EmptyState } from '@/components/empty-state';
import { MemberCard } from '@/components/member-card';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { CURRENT_BOX_NAME, MOCK_MEMBERS, filterMembers } from '@/data/mock-members';
import { useTheme } from '@/hooks/use-theme';
import {
  FOCUS_FILTERS,
  LEVEL_FILTERS,
  type FocusFilter,
  type LevelFilter,
  type Member,
} from '@/types/member';

type ScreenStatus = 'loading' | 'ready' | 'error';

export default function DiscoverScreen() {
  const theme = useTheme();
  const [status, setStatus] = useState<ScreenStatus>('loading');
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState('');
  const [focusFilter, setFocusFilter] = useState<FocusFilter>('Tous');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('Tous');

  function loadMembers() {
    setStatus('loading');
    setMembers([]);

    const timer = setTimeout(() => {
      // Simulation locale. Remplacé par listGymMembers(gymId) au J6.
      setMembers(MOCK_MEMBERS);
      setStatus('ready');
    }, 700);

    return () => clearTimeout(timer);
  }

  useEffect(() => {
    return loadMembers();
  }, []);

  const visibleMembers = useMemo(
    () =>
      filterMembers(members, {
        query,
        focus: focusFilter,
        level: levelFilter,
      }),
    [members, query, focusFilter, levelFilter],
  );

  const hasActiveFilters =
    query.trim().length > 0 || focusFilter !== 'Tous' || levelFilter !== 'Tous';

  function clearFilters() {
    setQuery('');
    setFocusFilter('Tous');
    setLevelFilter('Tous');
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={status === 'ready' ? visibleMembers : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleBlock}>
                <Text style={[styles.kicker, { color: theme.textSecondary }]}>Ta box</Text>
                <Text style={[styles.title, { color: theme.text }]}>{CURRENT_BOX_NAME}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  {status === 'ready'
                    ? `${visibleMembers.length} athlète${visibleMembers.length > 1 ? 's' : ''} dans ta salle`
                    : 'Athlètes CrossFit de ta salle'}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ouvrir mon profil CrossFit"
                onPress={() => router.push('/profile')}
                style={({ pressed }) => [
                  styles.profileButton,
                  {
                    backgroundColor: theme.backgroundElement,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                <Text style={[styles.profileButtonText, { color: theme.text }]}>Profil</Text>
              </Pressable>
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un athlète ou un focus"
              placeholderTextColor={theme.textSecondary}
              autoCorrect={false}
              style={[
                styles.search,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}
            />

            <Text style={[styles.filterLabel, { color: theme.text }]}>Focus</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}>
              {FOCUS_FILTERS.map((focus) => (
                <ChoiceChip
                  key={focus}
                  label={focus}
                  selected={focusFilter === focus}
                  onPress={() => setFocusFilter(focus)}
                />
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, { color: theme.text }]}>Niveau</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}>
              {LEVEL_FILTERS.map((level) => (
                <ChoiceChip
                  key={level}
                  label={level}
                  selected={levelFilter === level}
                  onPress={() => setLevelFilter(level)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          status === 'loading' ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.text} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Chargement des athlètes de ta box…
              </Text>
            </View>
          ) : status === 'error' ? (
            <EmptyState
              title="Chargement impossible"
              message="Impossible de charger la liste. Réessaie."
              actionLabel="Réessayer"
              onAction={loadMembers}
            />
          ) : members.length === 0 ? (
            <EmptyState
              title="Personne d’autre dans ta box"
              message="Recharge la liste, ou invite des potes de ta salle."
              actionLabel="Recharger"
              onAction={loadMembers}
            />
          ) : (
            <EmptyState
              title="Aucun résultat"
              message={
                hasActiveFilters
                  ? 'Rien ne correspond à ta recherche. Change un filtre.'
                  : 'Aucun athlète à afficher.'
              }
              actionLabel={hasActiveFilters ? 'Effacer les filtres' : 'Recharger'}
              onAction={hasActiveFilters ? clearFilters : loadMembers}
            />
          )
        }
        renderItem={({ item }) => (
          <MemberCard
            displayName={item.displayName}
            level={item.level}
            focus={item.focus}
            availabilityLabel={item.availabilityLabel}
            onPress={() =>
              router.push({
                pathname: '/member/[userId]',
                params: { userId: item.id },
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    flexGrow: 1,
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  titleBlock: {
    flex: 1,
    gap: Spacing.half,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  profileButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  search: {
    marginTop: Spacing.two,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 15,
  },
  filterLabel: {
    marginTop: Spacing.two,
    fontSize: 13,
    fontWeight: '700',
  },
  chipsRow: {
    gap: Spacing.two,
    paddingVertical: Spacing.half,
  },
  separator: {
    height: Spacing.three,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 14,
  },
});
