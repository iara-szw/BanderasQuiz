import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useGameContext } from '../context/gameContext';

export function Timer() {
  const { timer } = useGameContext();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tiempo</Text>
      <Text style={styles.time}>{timer}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  time: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
});
