import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemberCard } from '@/components/member-card';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { MOCK_MEMBERS } from '@/data/mock-members';
import { useTheme } from '@/hooks/use-theme';

export default function DiscoverScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={MOCK_MEMBERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Athlètes de ta box</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              CrossFit Campus SQY · données locales (J1)
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MemberCard
            displayName={item.displayName}
            focus={item.focus}
            boxName={item.boxName}
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
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  separator: {
    height: Spacing.two,
  },
});
