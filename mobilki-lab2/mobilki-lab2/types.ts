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

declare module 'expo-sqlite' {
  interface SQLiteDatabase {
    transaction(callback: (tx: SQLTransaction) => void): void;
  }

  interface SQLTransaction {
    executeSql(
      sqlStatement: string,
      args?: any[],
      callback?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
      errorCallback?: (transaction: SQLTransaction, error: Error) => boolean
    ): void;
  }

  interface SQLResultSet {
    insertId: number;
    rows: {
      _array: any[];
    };
  }
}