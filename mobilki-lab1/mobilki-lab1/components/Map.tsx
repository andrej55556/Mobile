import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { MarkerData } from '../types';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MarkerList from './MarkerList';

export default function Map({ markers, onLongPress, onMarkerPress }: {
    markers: MarkerData[],
    onLongPress: (event: any) => void,
    onMarkerPress: (id: number) => void
  }) {

  const [isMapReady, setIsMapReady] = React.useState(false);

  const handleMapReady = () => {
    setIsMapReady(true);
    console.log('Карта загружена');
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        onLongPress={onLongPress} 
        onMapReady={handleMapReady}
      >
        {isMapReady && <MarkerList markers={markers} onMarkerPress={onMarkerPress} />}
        </MapView>
      {!isMapReady && <ActivityIndicator size="large" />}
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