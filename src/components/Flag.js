import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useGameContext } from '../context/gameContext';

export function Flag() {
  const { currentCountry, isLoading } = useGameContext();
  const [hasError, setHasError] = useState(false);

  const imageSource = useMemo(() => {
    if (!currentCountry?.flag) {
      return null;
    }

    return { uri: currentCountry.flag };
  }, [currentCountry]);

  if (isLoading || !currentCountry) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Cargando bandera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasError || !imageSource ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No se pudo cargar la bandera</Text>
        </View>
      ) : (
        <Image
          source={imageSource}
          style={styles.flagImage}
          resizeMode="contain"
          onError={() => setHasError(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  flagImage: {
    width: '100%',
    maxWidth: 360,
    height: 210,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  placeholder: {
    width: '100%',
    maxWidth: 360,
    height: 210,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  placeholderText: {
    color: '#374151',
    fontWeight: '600',
  },
});
