import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { initDatabase } from '../database/schema';
import { MarkerData, ImageData } from '../types';

interface DatabaseContextType {
  addMarker: (latitude: number, longitude: number) => Promise<number>;
  deleteMarker: (id: number) => Promise<void>;
  getMarkers: () => Promise<MarkerData[]>;
  addImage: (markerId: number, uri: string) => Promise<void>;
  deleteImage: (id: number) => Promise<void>;
  getMarkerImages: (markerId: number) => Promise<ImageData[]>;
  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const database = await initDatabase();
        setDb(database);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const addMarker = async (latitude: number, longitude: number): Promise<number> => {
    if (!db) throw new Error('База данных не инициализирована');
    await db.runAsync(
      'INSERT INTO markers (latitude, longitude) VALUES (?, ?)',
      [latitude, longitude]
    );
    const result = await db.getFirstAsync<{ id: number }>(
      'SELECT last_insert_rowid() as id'
    );
    return result?.id ?? 0;
  };

  const deleteMarker = async (id: number): Promise<void> => {
    if (!db) throw new Error('База данных не инициализирована');
    await db.runAsync('DELETE FROM markers WHERE id = ?', [id]);
  };

  const getMarkers = async (): Promise<MarkerData[]> => {
    if (!db) throw new Error('База данных не инициализирована');
    const result = await db.getAllAsync<{ id: number, latitude: number, longitude: number }>(
      'SELECT * FROM markers'
    );
    return result.map(row => ({
      id: row.id,
      coordinate: {
        latitude: row.latitude,
        longitude: row.longitude
      },
      images: []
    }));
  };

  const addImage = async (markerId: number, uri: string): Promise<void> => {
    if (!db) throw new Error('База данных не инициализирована');
    await db.runAsync(
      'INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)',
      [markerId, uri]
    );
  };

  const deleteImage = async (id: number): Promise<void> => {
    if (!db) throw new Error('База данных не инициализирована');
    await db.runAsync('DELETE FROM marker_images WHERE id = ?', [id]);
  };

  const getMarkerImages = async (markerId: number): Promise<ImageData[]> => {
    if (!db) throw new Error('База данных не инициализирована');
    const result = await db.getAllAsync<{ id: number, uri: string }>(
      'SELECT * FROM marker_images WHERE marker_id = ?',
      [markerId]
    );
    return result.map(row => ({
      id: row.id.toString(),
      uri: row.uri
    }));
  };

  const value = {
    addMarker,
    deleteMarker,
    getMarkers,
    addImage,
    deleteImage,
    getMarkerImages,
    isLoading,
    error
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase должен использоваться внутри DatabaseProvider');
  }
  return context;
}; 