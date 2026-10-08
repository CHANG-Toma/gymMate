import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export type TabPlaceholderProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Écran onglet local en attendant Firebase (J7+). */
export function TabPlaceholder({ title, message, actionLabel, onAction }: TabPlaceholderProps) {
  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.content}>
        <EmptyState
          title={title}
          message={message}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.black,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
});
