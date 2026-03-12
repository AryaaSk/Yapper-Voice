import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, ref, set, get, push, remove, update, runTransaction, type Database } from "firebase/database";

let _app: FirebaseApp | null = null;
let _database: Database | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    if (getApps().length > 0) {
      _app = getApps()[0];
    } else {
      _app = initializeApp({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }
  }
  return _app;
}

function getDb(): Database {
  if (!_database) {
    _database = getDatabase(getFirebaseApp());
  }
  return _database;
}

export { ref, runTransaction, getDb };

export const db = {
  async set(path: string, data: any) {
    try {
      await set(ref(getDb(), path), data);
      return true;
    } catch (error) {
      console.error("Error setting data:", error);
      throw error;
    }
  },

  async get(path: string) {
    try {
      const snapshot = await get(ref(getDb(), path));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error("Error getting data:", error);
      throw error;
    }
  },

  async push(path: string, data: any) {
    try {
      const newRef = push(ref(getDb(), path));
      await set(newRef, data);
      return newRef.key;
    } catch (error) {
      console.error("Error pushing data:", error);
      throw error;
    }
  },

  async update(path: string, updates: any) {
    try {
      await update(ref(getDb(), path), updates);
      return true;
    } catch (error) {
      console.error("Error updating data:", error);
      throw error;
    }
  },

  async remove(path: string) {
    try {
      await remove(ref(getDb(), path));
      return true;
    } catch (error) {
      console.error("Error removing data:", error);
      throw error;
    }
  },
};
