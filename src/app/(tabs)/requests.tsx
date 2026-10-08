import { router } from 'expo-router';

import { TabPlaceholder } from '@/components/tab-placeholder';

export default function RequestsScreen() {
  return (
    <TabPlaceholder
      title="Pas encore de demandes"
      message="Les demandes d’entraînement arriveront ici (J7). En attendant, découvre les athlètes de ta box."
      actionLabel="Aller découvrir"
      onAction={() => router.push('/discover')}
    />
  );
}
