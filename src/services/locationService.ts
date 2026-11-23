import * as Location from 'expo-location';

import type { GeoPoint } from '@/utils/geo';

export type LocationPermissionResult =
  | { ok: true; coords: GeoPoint }
  | { ok: false; reason: 'denied' | 'unavailable' | 'error'; message: string };

export async function requestCurrentPosition(): Promise<LocationPermissionResult> {
  try {
    const current = await Location.getForegroundPermissionsAsync();
    let status = current.status;

    if (status !== Location.PermissionStatus.GRANTED) {
      const asked = await Location.requestForegroundPermissionsAsync();
      status = asked.status;
    }

    if (status !== Location.PermissionStatus.GRANTED) {
      return {
        ok: false,
        reason: 'denied',
        message: 'Permission de localisation refusée. Active-la dans les réglages pour filtrer par distance.',
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      ok: true,
      coords: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
    };
  } catch {
    return {
      ok: false,
      reason: 'error',
      message: 'Impossible de récupérer la position. Réessaie.',
    };
  }
}
