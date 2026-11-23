import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { getGym } from '@/services/gymService';
import { requestCurrentPosition } from '@/services/locationService';
import { listGymMembers } from '@/services/memberService';
import { updateUserLocation } from '@/services/profileService';
import {
  DISTANCE_FILTERS,
  FOCUS_FILTERS,
  LEVEL_FILTERS,
  filterGymMembers,
  type DistanceFilter,
  type FocusFilter,
  type GymMember,
  type LevelFilter,
} from '@/types/member';
import { formatDistanceKm } from '@/utils/geo';
import {
  formatAvailability,
  formatFocus,
  formatLevel,
} from '@/utils/profile-labels';

type ScreenStatus = 'loading' | 'ready' | 'error';

export default function DiscoverScreen() {
  const theme = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const [status, setStatus] = useState<ScreenStatus>('loading');
  const [members, setMembers] = useState<GymMember[]>([]);
  const [boxName, setBoxName] = useState(profile?.gymId ?? 'Ta box');
  const [query, setQuery] = useState('');
  const [focusFilter, setFocusFilter] = useState<FocusFilter>('Tous');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('Tous');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('Tous');
  const [locationHint, setLocationHint] = useState<string | null>(null);
  const [sharingLocation, setSharingLocation] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!user || !profile?.gymId) {
      setMembers([]);
      setStatus('ready');
      return;
    }

    setStatus('loading');
    setMembers([]);

    try {
      const [rows, gym] = await Promise.all([
        listGymMembers(profile.gymId, user.uid, profile.location),
        getGym(profile.gymId),
      ]);
      setMembers(rows);
      setBoxName(gym?.name ?? profile.gymId);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [user, profile?.gymId, profile?.location]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const visibleMembers = useMemo(
    () =>
      filterGymMembers(members, {
        query,
        focus: focusFilter,
        level: levelFilter,
        distance: distanceFilter,
      }),
    [members, query, focusFilter, levelFilter, distanceFilter],
  );

  const hasActiveFilters =
    query.trim().length > 0 ||
    focusFilter !== 'Tous' ||
    levelFilter !== 'Tous' ||
    distanceFilter !== 'Tous';

  const canFilterByDistance = Boolean(profile?.location);

  function clearFilters() {
    setQuery('');
    setFocusFilter('Tous');
    setLevelFilter('Tous');
    setDistanceFilter('Tous');
  }

  async function handleShareLocation() {
    if (!user || sharingLocation) {
      return;
    }
    setSharingLocation(true);
    setLocationHint(null);
    const result = await requestCurrentPosition();
    if (!result.ok) {
      setLocationHint(result.message);
      setSharingLocation(false);
      return;
    }

    try {
      await updateUserLocation(user.uid, result.coords);
      await refreshProfile();
      setLocationHint('Position enregistrée. Tu peux filtrer par distance.');
    } catch {
      setLocationHint('Impossible d’enregistrer la position. Réessaie.');
    } finally {
      setSharingLocation(false);
    }
  }

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={status === 'ready' ? visibleMembers : []}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleBlock}>
                <Text style={[styles.kicker, { color: theme.textSecondary }]}>Ta box</Text>
                <Text style={[styles.title, { color: theme.text }]}>{boxName}</Text>
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

            <Pressable
              onPress={handleShareLocation}
              disabled={sharingLocation}
              style={({ pressed }) => [
                styles.locationButton,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                  opacity: pressed || sharingLocation ? 0.8 : 1,
                },
              ]}>
              <Text style={[styles.locationButtonText, { color: theme.text }]}>
                {sharingLocation
                  ? 'Localisation…'
                  : profile?.location
                    ? 'Actualiser ma position'
                    : 'Partager ma position'}
              </Text>
            </Pressable>
            {locationHint ? (
              <Text style={[styles.hint, { color: theme.textSecondary }]}>{locationHint}</Text>
            ) : !canFilterByDistance ? (
              <Text style={[styles.hint, { color: theme.textSecondary }]}>
                Partage ta position pour activer le filtre distance.
              </Text>
            ) : null}

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

            <Text style={[styles.filterLabel, { color: theme.text }]}>Distance</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}>
              {DISTANCE_FILTERS.map((distance) => (
                <ChoiceChip
                  key={distance}
                  label={distance}
                  selected={distanceFilter === distance}
                  onPress={() => {
                    if (distance !== 'Tous' && !canFilterByDistance) {
                      setLocationHint('Partage d’abord ta position pour filtrer par distance.');
                      return;
                    }
                    setDistanceFilter(distance);
                  }}
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
              onAction={() => void loadMembers()}
            />
          ) : members.length === 0 ? (
            <EmptyState
              title="Personne d’autre dans ta box"
              message="Recharge la liste, ou invite des potes de ta salle."
              actionLabel="Recharger"
              onAction={() => void loadMembers()}
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
              onAction={hasActiveFilters ? clearFilters : () => void loadMembers()}
            />
          )
        }
        renderItem={({ item }) => (
          <MemberCard
            displayName={item.displayName}
            level={formatLevel(item.level)}
            focus={formatFocus(item.goal)}
            availabilityLabel={formatAvailability(item.availability)}
            distanceLabel={formatDistanceKm(item.distanceKm)}
            onPress={() =>
              router.push({
                pathname: '/member/[userId]',
                params: { userId: item.uid },
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
  locationButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignSelf: 'flex-start',
  },
  locationButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
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
