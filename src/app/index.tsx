import { Alert, Animated, Button, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useEffect, useRef, useState } from 'react';

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const countAnimated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(countAnimated, {
      toValue: count,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [count]);

  return (
    <SafeAreaView style={styles.safeArea}>

      <Text>{count}</Text>
      <Pressable onPress={() => setCount(count + 1)}>
        <Text>cliquer pour afficher</Text>
      </Pressable>

      <Pressable onPress={() => setCount(count - 1)}>
        <Text>cliquer pour masquer</Text>
      </Pressable>

      <Animated.View style={{ opacity: countAnimated }}>
        <Text style={[styles.text, { color: 'black' }]}>Affichage du compteur</Text>
      </Animated.View>

    </SafeAreaView> 
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});
