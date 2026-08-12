import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, GamificationState, ReaderSettings } from '../types';

const STORAGE_KEYS = {
  BOOKS: '@luminaread_books_v1',
  GAMIFICATION: '@luminaread_gamification_v1',
  READER_SETTINGS: '@luminaread_settings_v1',
  ACTIVE_BOOK_ID: '@luminaread_active_book_id_v1',
};

// Fallback safe storage for web & native
export const saveBooksToStorage = async (books: Book[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(books);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, jsonValue);
  } catch (e) {
    console.error('Error saving books to storage:', e);
  }
};

export const loadBooksFromStorage = async (): Promise<Book[] | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error loading books from storage:', e);
    return null;
  }
};

export const saveGamificationToStorage = async (state: GamificationState): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(state);
    await AsyncStorage.setItem(STORAGE_KEYS.GAMIFICATION, jsonValue);
  } catch (e) {
    console.error('Error saving gamification state:', e);
  }
};

export const loadGamificationFromStorage = async (): Promise<GamificationState | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.GAMIFICATION);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error loading gamification state:', e);
    return null;
  }
};

export const saveSettingsToStorage = async (settings: ReaderSettings): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEYS.READER_SETTINGS, jsonValue);
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

export const loadSettingsFromStorage = async (): Promise<ReaderSettings | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.READER_SETTINGS);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error loading settings:', e);
    return null;
  }
};

export const saveActiveBookId = async (id: string | null): Promise<void> => {
  try {
    if (id) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_BOOK_ID, id);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_BOOK_ID);
    }
  } catch (e) {
    console.error('Error saving active book id:', e);
  }
};

export const loadActiveBookId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_BOOK_ID);
  } catch (e) {
    console.error('Error loading active book id:', e);
    return null;
  }
};
