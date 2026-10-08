import { router } from 'expo-router';

import { TabPlaceholder } from '@/components/tab-placeholder';

export default function MessagesScreen() {
  return (
    <TabPlaceholder
      title="Pas de conversation"
      message="Le chat s’ouvre seulement après une demande acceptée (J9). Pas d’accès avant."
      actionLabel="Voir les demandes"
      onAction={() => router.push('/requests')}
    />
  );
}
