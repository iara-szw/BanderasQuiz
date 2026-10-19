import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useGameContext } from '../context/gameContext';

export function GuessForm() {
  const { guess, setGuess, submitGuess, errorMessage, resultStatus, isTransitioning } = useGameContext();
  const isCorrect = resultStatus === 'success';

  return (
    <View style={styles.container}>
      <TextInput
        value={guess}
        onChangeText={setGuess}
        placeholder={isTransitioning ? 'Cambiando de país...' : 'Escribe el nombre del país'}
        autoCapitalize="words"
        autoCorrect={false}
        style={[styles.input, isTransitioning && styles.inputDisabled]}
        editable={!isTransitioning}
        selectTextOnFocus={!isTransitioning}
      />

      <Pressable style={[styles.button, isTransitioning && styles.buttonDisabled]} onPress={submitGuess} disabled={isTransitioning}>
        <Text style={styles.buttonText}>{isTransitioning ? 'Cargando...' : 'Adivinar'}</Text>
      </Pressable>

      {errorMessage ? (
        <Text style={[styles.error, isCorrect ? styles.success : styles.fail]}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.7,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  success: {
    color: '#15803d',
  },
  fail: {
    color: '#b91c1c',
  },
});
