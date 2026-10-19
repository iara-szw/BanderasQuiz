import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useGameContext } from '../context/gameContext';

export function Leaderboard() {
  const { players } = useGameContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ranking</Text>
      {players.map((player) => (
        <View key={player.id} style={styles.row}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.points}>{player.score} pts</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  name: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  points: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
});
