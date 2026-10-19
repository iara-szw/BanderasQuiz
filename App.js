import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Flag } from './src/components/Flag';
import { GuessForm } from './src/components/GuessForm';
import { Leaderboard } from './src/components/Leaderboard';
import { ScoreBoard } from './src/components/ScoreBoard';
import { StartScreen } from './src/components/StartScreen';
import { Timer } from './src/components/Timer';
import { GameProvider, useGameContext } from './src/context/gameContext';

function GameScreen() {
  const { gameStarted, resetGame } = useGameContext();

  if (!gameStarted) {
    return <StartScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Banderas Quiz</Text>
          <ScoreBoard />
          <Timer />
          <Flag />
          <GuessForm />
          <Leaderboard />

          <Pressable style={styles.finishButton} onPress={resetGame}>
            <Text style={styles.finishButtonText}>Terminar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <GameProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
        <GameScreen />
      </SafeAreaView>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 18,
  },
  finishButton: {
    width: '100%',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
