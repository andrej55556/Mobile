export interface MarkerData {
  id: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  images: ImageData[];
}
  
export interface ImageData {
  id: string;
  uri: string;
}