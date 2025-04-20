import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Alert, Modal, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageData } from '../../types';
import * as ImagePicker from 'expo-image-picker';
import ImageList from '../../components/ImageList';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'marker_images';

export default function MarkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [images, setImages] = useState<{ [key: string]: ImageData[] }>({});
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const storedImages = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedImages) {
          setImages(JSON.parse(storedImages));
        }
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить изображения.');
      }
    };

    loadImages();
  }, []);

  const saveImages = async (images: { [key: string]: ImageData[] }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Не удалось сохранить изображение:', error);
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const newImage: ImageData = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        const updatedImages = { ...images, [id]: [...(images[id] || []), newImage] };
        setImages(updatedImages);
        saveImages(updatedImages);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать изображение.');
    }
  };

  const deleteImage = (imageId: string) => {
    setImages((prevImages) => ({
      ...prevImages,
      [id]: prevImages[id].filter((image) => image.id !== imageId),
    }));
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <ImageList images={images[id] || []} onDelete={(imageId) => setSelectedImage(images[id].find(img => img.id === imageId) || null)} />
      <Button title="Добавить изображение" onPress={pickImage} />
      <Button title="Назад к карте" onPress={() => router.back()} />
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          {selectedImage && (
            <>
              <Image source={{ uri: selectedImage.uri }} style={styles.fullImage} />
              <Button title="Удалить изображение" onPress={() => deleteImage(selectedImage.id)} color="red" />
              <View>
                <Button title="Закрыть" onPress={() => setSelectedImage(null)} />
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  fullImage: {
    width: 350,
    height: 350,
    marginBottom: 20,
  },
});