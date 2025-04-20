import React from 'react';
import { Marker } from 'react-native-maps';
import { MarkerData } from '../types';

const colors = ['red', 'tomato', 'orange', 'yellow', 'green', 'gold', 'wheat', 'linen', 'tan', 'blue'];

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

export default function Map({ markers, onMarkerPress}: {
  markers: MarkerData[],
  onMarkerPress: (id: number) => void,
}) {
  return (
    <>
      {markers.map((marker) => (
          <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          pinColor={getRandomColor()}
          onPress={() => onMarkerPress(marker.id)}
        />
      ))}
    </>
  );
}