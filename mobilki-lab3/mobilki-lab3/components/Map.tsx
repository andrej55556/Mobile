import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { MarkerData } from '../types';
import { View, StyleSheet, Alert } from 'react-native';
import MarkerList from './MarkerList';
import * as Location from 'expo-location';
import { requestLocationPermissions, startLocationUpdates, calculateDistance } from '../services/location';
import { NotificationManager } from '../services/notifications';

const PROXIMITY_THRESHOLD = 100;

export default function Map({ markers, onLongPress, onMarkerPress}: {
    markers: MarkerData[],
    onLongPress: (event: any) => void,
    onMarkerPress: (id: number) => void,
  }) {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const notificationManager = React.useRef(new NotificationManager()).current;

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    const setupLocation = async () => {
      try {
        await requestLocationPermissions();
        await notificationManager.init();

        locationSubscription = await startLocationUpdates((location) => {
          setUserLocation(location);
          checkProximity(location);
        });
      } catch (error) {
        Alert.alert('Ошибка', error instanceof Error ? error.message : 'Неизвестная ошибка');
      }
    };

    setupLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const checkProximity = (location: Location.LocationObject) => {
    markers.forEach(marker => {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        marker.coordinate.latitude,
        marker.coordinate.longitude
      );
      
      if (distance <= PROXIMITY_THRESHOLD) {
        notificationManager.showNotification(marker);
      } else {
        notificationManager.removeNotification(marker.id);
      }
    });
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        onLongPress={onLongPress}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        <MarkerList 
          markers={markers} 
          onMarkerPress={onMarkerPress}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});