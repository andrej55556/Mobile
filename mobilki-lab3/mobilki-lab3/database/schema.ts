import * as SQLite from 'expo-sqlite';
import '../types.ts';
import { migrations } from './migrations';

export const DATABASE_NAME = 'markers.db';

const getCurrentVersion = async (db: SQLite.SQLiteDatabase): Promise<number> => {
  const result = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1'
  );
  return result?.version ?? 0;
};
const updateVersion = async (db: SQLite.SQLiteDatabase, version: number): Promise<void> => {
  await db.execAsync(`UPDATE schema_version SET version = ${version}`);
};

export const initDatabase = async () => {
  const db = SQLite.openDatabaseSync(DATABASE_NAME);

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER NOT NULL
      );
    `);

    const currentVersion = await getCurrentVersion(db);

    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        await db.execAsync(migration.sql);
        await updateVersion(db, migration.version);
      }
    }

    return db;
  } catch (error) {
    console.error('Ошибка при инициализации БД:', error);
    throw error;
  }
};