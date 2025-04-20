import React from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { ImageData } from '../types';
import { GestureHandlerRootView, TapGestureHandler } from 'react-native-gesture-handler';
import { useDatabase } from '../contexts/DatabaseContext';

export default function ImageList({ images, onDelete }: { 
  images: ImageData[], 
  onDelete: (id: string) => void 
}) {
  const { isLoading } = useDatabase();

  if (isLoading) {
    return (
      <View style={styles.noImagesContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!Array.isArray(images) || images.length === 0) {
    return (
      <View style={styles.noImagesContainer}>
        <Text style={styles.noImagesText}>Нет изображений</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        {images.map((image) => (
          <TapGestureHandler key={image.id} onActivated={() => onDelete(image.id)}>
            <Image source={{ uri: image.uri }} style={styles.image} />
          </TapGestureHandler>
        ))}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  image: {
    width: 120,
    height: 120,
    margin: 5,
  },
  noImagesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noImagesText: {
    fontSize: 16,
    color: 'gray',
  },
});