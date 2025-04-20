import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ImageList from './ImageList';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { MarkerTypeUrl } from '@/types';

export default function MarkerList() {
  const params = useLocalSearchParams<MarkerTypeUrl>();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ 
      title: params.title || "Маркер"
    });
  }, [params.title]);

  const marker = {
    id: Number(params.marker),
    title: params.title,
    latitude: parseFloat(params.latitude),
    longitude: parseFloat(params.longitude),
  };

  return (
    <View style={styles.container}>
      <ImageList markerId={marker.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignContent: 'center',
    justifyContent: 'center',
    paddingLeft: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    marginBottom: 5,
  },
  coordinates: {
    fontSize: 14,
    marginBottom: 15,
    color: 'gray',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
});
