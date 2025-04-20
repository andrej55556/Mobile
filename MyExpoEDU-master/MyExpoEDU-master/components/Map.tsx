import MapView, { Marker } from 'react-native-maps';
import { ActivityIndicator, Alert, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import { DEFAULT_REGION } from '@/consts';
import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { MarkerType } from '@/types';
import { useDatabase } from "@/contexts/DatabaseContext";
import { NotificationManager } from '@/services/notifications';
import { calculateDistance } from '@/services/locations';

const PROXIMITY_THRESHOLD = 100;

export default function Map() {

  const router = useRouter();
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addMarker, getMarkers, deleteAllMarkers, isLoading } = useDatabase();
  const mapRef = useRef<MapView | null>(null);
  const markersRef = useRef<MarkerType[]>(markers);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  const notificationManager = useRef(new NotificationManager());

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 2500);
  };

  const markerClick = (marker: MarkerType) => {
    router.push({
      pathname: "/marker/[marker]",
      params: {
        marker: marker.id,
        latitude: marker.latitude.toString(),
        longitude: marker.longitude.toString(),
        title: marker.title,
      },
    });
  };

  const focusOnMe = async () => {
    try {
      setLoading(true);
      setError(null);
      const location = await Location.getCurrentPositionAsync();
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
    } catch (err) {
      showError("Не удалось получить текущую локацию.");
    } finally {
      setLoading(false);
    }
  };

  const addNewMarker = async (event: any) => {
    try {
      const coordinates = event.nativeEvent.coordinate;
      const newMarkerName = `Метка ${coordinates.latitude.toFixed(2)}, ${coordinates.longitude.toFixed(2)}`;
      const newMarkerId = await addMarker(coordinates.latitude, coordinates.longitude, newMarkerName);
      const newMarker: MarkerType = {
        id: newMarkerId,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        title: newMarkerName,
      };
      setMarkers([...markers, newMarker]);
    } catch (e) {
      showError("Не удалось добавить новую метку.");
    }
  };

  const loadMarkers = async () => {
    try {
      setLoading(true);
      const dbMarkers = await getMarkers();
      const formattedMarkers: MarkerType[] = dbMarkers.map(marker => ({
        id: marker.id,
        latitude: marker.latitude,
        longitude: marker.longitude,
        title: marker.title,
      }));
      console.log(formattedMarkers);
      setMarkers(formattedMarkers);
    } catch (err) {
      showError("Не удалось загрузить маркеры");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showError("Нет доступа к локации.");
      }
      await loadMarkers();
    })();
  }, []);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Не удалось получить разрешение на уведомления!');
        return;
      }
      
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    };
    
    requestNotificationPermission();
  }, []);
      
  useEffect(() => {
    getMarkers();
  }, [addNewMarker]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;
    (async () => {
      try {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 100,
            distanceInterval: 5
          },
          (location) => {
            markersRef.current.forEach(marker => {
              const distance = calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                marker.latitude,
                marker.longitude
              );
              console.log("Расстояние:", distance);
              if (distance <= PROXIMITY_THRESHOLD) {
                notificationManager.current.showNotification(marker);
              } else {
                notificationManager.current.removeNotification(marker.id);
              }
            });
          }
        );
      } catch (error) {
        console.error("Ошибка отслеживания местоположения:", error);
      }
    })();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const clearMarkers = () => {
    deleteAllMarkers();
    setMarkers([]);
  }

  return (
    <>
      <TouchableOpacity style={[styles.transparantButton, styles.whereAmIButton]} onPress={focusOnMe}>
        <Text style={styles.transparantButtonText}>Где я?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.transparantButton, styles.clearMarkersButton]} onPress={clearMarkers}>
        <Text style={styles.transparantButtonText}>Очистить маркеры</Text>
      </TouchableOpacity>
      <MapView
        style={styles.map}
        region={DEFAULT_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
        ref={mapRef}
        onLongPress={addNewMarker}
      >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          coordinate={marker}
          title={marker.title}
          onCalloutPress={() => markerClick(marker)}
        />
      ))}
      </MapView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%"
  },
  transparantButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
  },
  transparantButtonText: {
    color: 'white',
    fontSize: 16,
  },
  whereAmIButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  clearMarkersButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  errorContainer: {
    position: 'absolute',
    top: 350,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
});