import React, { useEffect, useState } from 'react';
import { ScrollView, Image, StyleSheet, Text, Alert, View, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Crypto from 'expo-crypto';
import { useDatabase } from "@/contexts/DatabaseContext";
import { MarkerImages } from '@/types';

type Props = {
  markerId: number;
}

export default function ImageList({ markerId }: Props) {
  const [imagesArray, setImages] = useState<MarkerImages[]>([]);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const { getMarkerImages, addImage, deleteImage } = useDatabase();

  if (status === null) {
    requestPermission();
  }

  useEffect(() => {
    const fetchImages = async (id: number) => {
      const images = await getMarkerImages(id);
      setImages(images);
    };

    fetchImages(markerId);
  }, [markerId]);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newId = await addImage(markerId, result.assets[0].uri);
      setImages(prev => [
        ...prev,
        { id: newId, uri: result.assets[0].uri, markerId: markerId },
      ]);
    } else {
      alert('Не выбрано фото.');
    }
  };

  const deleteImageFromList = (id: number) => {
    Alert.alert(
      "Удалить изображение?",
      "Вы уверены, что хотите удалить это изображение?",
      [
        { text: "Отмена", style: "cancel" },
        { text: "Удалить", onPress: () => { setImages(prev => prev.filter(img => img.id !== id)); deleteImage(id) }},
      ]
    );
  };

  const renderImageItem = (image: MarkerImages) => (
    <View style={styles.item}>
      <Image source={{ uri: image.uri }} style={styles.itemPhoto} resizeMode="cover" />
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteImageFromList(image.id)}>
        <Text style={styles.deleteButtonText}>Удалить</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View>
        <TouchableOpacity style={styles.addButton} onPress={pickImageAsync}>
          <Text style={styles.addButtonText}>Добавить изображение</Text>
        </TouchableOpacity>
        {imagesArray.length > 0 ? (
          <FlatList<MarkerImages>
            data={imagesArray}
            renderItem={({ item }) => renderImageItem(item)}
            keyExtractor={({ id }) => id.toString()}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.noImagesText}>Изображения отсутствуют</Text>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginBottom: 60
  },
  item: {
    marginVertical: 10,
    width: '100%',
  },
  itemPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    alignItems: 'center'
  },
  deleteButton: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(255,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  addButton: {
    marginBottom: 20,
    backgroundColor: '#afd33d',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noImagesText: {
    fontStyle: 'italic',
    color: 'gray',
    alignItems: 'center'
  },
});