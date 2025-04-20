import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MarkerData } from '../types';
import Map from '../components/Map';
import { useDatabase } from '../contexts/DatabaseContext';

export default function IndexScreen() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const db = useDatabase();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      if (!db.isLoading) {
        loadMarkers();
      }
    }, [db.isLoading])
  );

  const loadMarkers = async () => {
    try {
      const result = await db.getMarkers();
      setMarkers(result);
    } catch (error) {
      console.error('Ошибка при загрузке маркеров:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить маркеры');
    }
  };

  const handleLongPress = async (event: any) => {
    try {
      const { coordinate } = event.nativeEvent;
      const markerId = await db.addMarker(coordinate.latitude, coordinate.longitude);
      
      const newMarker: MarkerData = {
        id: markerId,
        coordinate,
        images: []
      };

      setMarkers(prevMarkers => [...prevMarkers, newMarker]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить метку. Попробуйте снова.');
    }
  };
  
  if (db.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Map markers={markers} onLongPress={handleLongPress} onMarkerPress={(id) => {
        try {
          router.push(`/marker/${id}`);
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось открыть детали метки.');
        }
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});