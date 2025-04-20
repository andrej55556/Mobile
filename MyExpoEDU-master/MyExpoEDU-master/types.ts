export type MarkerType = {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
};

export type MarkerTypeUrl = {
  marker: string;
  latitude: string;
  longitude: string;
  title: string;
}

export type MarkerImages = {
  id: number;
  markerId: number;
  uri: string;
};