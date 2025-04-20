import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MarkerData } from '../types';
import Map from '../components/Map';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [currentId, setCurrentId] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const clearStorageOnStart = async () => {
      await AsyncStorage.clear();
    };

    clearStorageOnStart();
  }, []);

  const handleLongPress = (event: any) => {
    try {
      const { coordinate } = event.nativeEvent;
      const newMarker: MarkerData = {
        id: currentId,
        coordinate,
        images: [],
      };
      setMarkers([...markers, newMarker]);
      setCurrentId((prevId) => prevId + 1);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить метку. Попробуйте снова.');
    }
  };

  return (
    <View style={styles.container}>
      <Map markers={markers} onLongPress={handleLongPress} onMarkerPress={(id) => {
        try {
          router.push(`/marker/${id}`);
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось открыть детали метки.');
        }
      }} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});