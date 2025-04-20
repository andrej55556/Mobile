import React from 'react';
import MapView from 'react-native-maps';
import { MarkerData } from '../types';
import { View, StyleSheet, Alert } from 'react-native';
import MarkerList from './MarkerList';

export default function Map({ markers, onLongPress, onMarkerPress}: {
    markers: MarkerData[],
    onLongPress: (event: any) => void,
    onMarkerPress: (id: number) => void,
  }) {

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        onLongPress={onLongPress}
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