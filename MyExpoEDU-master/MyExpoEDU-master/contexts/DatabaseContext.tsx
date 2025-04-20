import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SQLite from "expo-sqlite";
import { CREATE_MARKER_TABLE, CREATE_MARKER_IMAGE_TABLE } from "@/db/ddl";
import { MarkerType, MarkerImages } from "@/types";
import Spinner from "@/components/Spinner";

interface DatabaseContextType {
  addMarker: (latitude: number, longitude: number, title: string) => Promise<number>;
  deleteMarker: (id: number) => Promise<void>;
  getMarkers: () => Promise<MarkerType[]>;
  addImage: (markerId: number, uri: string) => Promise<number>;
  deleteImage: (id: number) => Promise<void>;
  getMarkerImages: (markerId: number) => Promise<MarkerImages[]>;
  deleteAllMarkers: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync("markers.db");

    await db.withTransactionAsync(async () => {
      await db.execAsync(CREATE_MARKER_TABLE);
      await db.execAsync(CREATE_MARKER_IMAGE_TABLE);
    });

    console.log("База данных инициализирована успешно");
    return db;
  } catch (error) {
    console.error("Ошибка при инициализации базы данных:", error);
    throw error;
  }
};

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initDatabase()
      .then(database => setDb(database))
      .catch(err => setError(err as Error))
      .finally(() => setIsLoading(false));
  }, []);

  const addMarker = async (latitude: number, longitude: number, title: string): Promise<number> => {
    try {
      if (!db) throw new Error("Database not initialized");
      
      const result = await db.runAsync(
        "INSERT INTO markers (latitude, longitude, title) VALUES (?, ?, ?)",
        [latitude, longitude, title]
      );
      return result.lastInsertRowId;
    } catch (err) {
      console.error("Ошибка добавления marker:", err);
      throw err;
    }
  };

  const getMarkers = async (): Promise<MarkerType[]> => {
    try {
      if (!db) throw new Error("Database not initialized");
      
      return await db.getAllAsync("SELECT * FROM markers");
    } catch (err) {
      console.error("Ошибка получения markers:", err);
      throw err;
    }
  };

  const deleteMarker = async (id: number): Promise<void> => {
    try {
      if (!db) throw new Error("Database not initialized");
      
      await db.runAsync("DELETE FROM markers WHERE id = ?", [id]);
    } catch (err) {
      console.error("Ошибка удаления marker:", err);
      throw err;
    }
  };

  const addImage = async (markerId: number, uri: string): Promise<number> => {
    try {
      console.log(markerId);
      if (!db) throw new Error("Database not initialized");
      if (!markerId) throw new Error("Marker ID is required");
      
      const result = await db.runAsync(
        "INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)",
        [markerId, uri]
      );
      return result.lastInsertRowId
    } catch (err) {
      console.error("Ошибка добавления image:", err);
      throw err;
    }
  };

  const deleteImage = async (id: number): Promise<void> => {
    try {
      if (!db) throw new Error("Database not initialized");
      
      await db.runAsync("DELETE FROM marker_images WHERE id = ?", [id]);
    } catch (err) {
      console.error("Ошибка удаления image:", err);
      throw err;
    }
  };

  const getMarkerImages = async (markerId: number): Promise<MarkerImages[]> => {
    try {
      if (!db) throw new Error("Database not initialized");
      
      return await db.getAllAsync(
        "SELECT * FROM marker_images WHERE marker_id = ?",
        [markerId]
      );
    } catch (err) {
      console.error("Ошибка получения marker images:", err);
      throw err;
    }
  };

  const deleteAllMarkers = async (): Promise<void> => {
    try {
      if (!db) throw new Error("Database not initialized");
      
      await db.runAsync("DELETE FROM markers");
    } catch (err) {
      console.error("Ошибка удаления всех markers:", err);
      throw err;
    }
  };

  const contextValue: DatabaseContextType = {
    addMarker,
    deleteMarker,
    getMarkers,
    addImage,
    deleteImage,
    getMarkerImages,
    deleteAllMarkers,
    isLoading,
    error,
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase должен использоваться внутри DatabaseProvider");
  }
  return context;
};
