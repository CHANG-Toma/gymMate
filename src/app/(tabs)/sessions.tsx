import { router } from 'expo-router';

import { TabPlaceholder } from '@/components/tab-placeholder';

export default function SessionsScreen() {
  return (
    <TabPlaceholder
      title="Aucune séance prévue"
      message="Les séances acceptées s’afficheront ici (J8). Pour l’instant, propose un WOD depuis un profil."
      actionLabel="Aller découvrir"
      onAction={() => router.push('/discover')}
    />
  );
}
