import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useGameContext } from '../context/gameContext';

export function ScoreBoard() {
  const { score } = useGameContext();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Puntaje</Text>
      <Text style={styles.score}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  score: {
    fontSize: 42,
    fontWeight: '800',
    color: '#111827',
  },
});
