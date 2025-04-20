import React from 'react';
import { Marker } from 'react-native-maps';
import { MarkerData } from '../types';

export default function MarkerList({ markers, onMarkerPress }: {
  markers: MarkerData[],
  onMarkerPress: (id: number) => void
}) {
  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          onPress={() => onMarkerPress(marker.id)}
        />
      ))}
    </>
  );
}