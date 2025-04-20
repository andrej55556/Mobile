import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Alert, Modal, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageData } from '../../types';
import * as ImagePicker from 'expo-image-picker';
import ImageList from '../../components/ImageList';
import { useDatabase } from '../../contexts/DatabaseContext';

export default function MarkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { addImage, deleteImage, getMarkerImages, deleteMarker } = useDatabase();

  useEffect(() => {
    loadImages();
  }, [id]);

  const loadImages = async () => {
    try {
      const markerImages = await getMarkerImages(Number(id));
      setImages(markerImages);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить изображения');
    } finally {
      setIsLoading(false);
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
        await addImage(Number(id), result.assets[0].uri);
        await loadImages();
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить изображение');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImage(Number(imageId));
      await loadImages();
      setSelectedImage(null);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить изображение');
    }
  };


  const handleDeleteMarker = async (markerId: string) => {
    Alert.alert(
      'Удаление маркера',
      'Удалить этот маркер?',
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMarker(Number(markerId));
              router.back();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить маркер');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageList 
        images={images} 
        onDelete={(imageId) => setSelectedImage(images.find(img => img.id === imageId) || null)} 
      />
      <Button title="Добавить изображение" onPress={pickImage} />
      <Button title="Назад к карте" onPress={() => router.back()} />
      <Button 
                title="Удалить маркер" 
                onPress={() => handleDeleteMarker(id)} 
                color="red" 
              />
      
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          {selectedImage && (
            <>
              <Image source={{ uri: selectedImage.uri }} style={styles.fullImage} />
              <Button 
                title="Удалить изображение" 
                onPress={() => handleDeleteImage(selectedImage.id)} 
                color="red" 
              />
              <Button title="Закрыть" onPress={() => setSelectedImage(null)} />
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

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