import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Book, GamificationState, ReaderSettings, Badge, DailyQuest, Bookmark } from '../types';
import { INITIAL_SAMPLE_BOOKS } from '../services/sampleBooks';
import {
  loadBooksFromStorage,
  saveBooksToStorage,
  loadGamificationFromStorage,
  saveGamificationToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  loadActiveBookId,
  saveActiveBookId,
} from '../services/storage';

const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_page',
    title: 'Primeira Página',
    description: 'Abra e leia o seu primeiro capítulo de livro.',
    icon: 'book-open',
    unlockedAt: new Date().toISOString(),
    requirementType: 'pages',
    requirementValue: 1,
  },
  {
    id: 'streak_3',
    title: 'Chama Inicial',
    description: 'Mantenha uma ofensiva de leitura por 3 dias seguidos.',
    icon: 'flame',
    unlockedAt: null,
    requirementType: 'streak',
    requirementValue: 3,
  },
  {
    id: 'tiktok_slayer_15',
    title: 'Escapista do Reels',
    description: 'Economizou 45 minutos que seriam perdidos no TikTok/Instagram.',
    icon: 'shield-off',
    unlockedAt: null,
    requirementType: 'tiktok',
    requirementValue: 45,
  },
  {
    id: 'marathon_30',
    title: 'Leitor Maratona',
    description: 'Acumule 30 minutos de leitura focada.',
    icon: 'timer',
    unlockedAt: null,
    requirementType: 'time',
    requirementValue: 30,
  },
  {
    id: 'level_5',
    title: 'Mente Brilhante',
    description: 'Alcance o Nível 5 de Sabedoria.',
    icon: 'zap',
    unlockedAt: null,
    requirementType: 'level',
    requirementValue: 5,
  },
  {
    id: 'collector_5',
    title: 'Biblioteca Pessoal',
    description: 'Tenha 5 ou mais livros salvos no seu app.',
    icon: 'library',
    unlockedAt: null,
    requirementType: 'books',
    requirementValue: 5,
  },
];

const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: 'q_daily_15',
    title: 'Ler por 15 minutos hoje',
    rewardXP: 150,
    targetMinutes: 15,
    currentMinutes: 0,
    completed: false,
  },
  {
    id: 'q_daily_pages',
    title: 'Virar 10 páginas em qualquer livro',
    rewardXP: 100,
    targetMinutes: 10,
    currentMinutes: 0,
    completed: false,
  },
];

const INITIAL_GAMIFICATION: GamificationState = {
  xp: 120,
  level: 1,
  streakDays: 1,
  lastReadingDate: new Date().toISOString().split('T')[0],
  todayReadingMinutes: 5,
  todayPagesRead: 4,
  totalReadingMinutes: 15,
  totalPagesRead: 12,
  totalBooksFinished: 0,
  streakHistory: [new Date().toISOString().split('T')[0]],
  badges: INITIAL_BADGES,
  quests: INITIAL_QUESTS,
  dailyTargetMinutes: 20,
};

const INITIAL_SETTINGS: ReaderSettings = {
  fontSize: 18,
  fontFamily: 'Serif',
  theme: 'sepia',
  lineHeight: 1.6,
  autoScroll: false,
  autoScrollSpeed: 2,
};

interface AppContextType {
  books: Book[];
  activeBookId: string | null;
  activeBook: Book | null;
  gamification: GamificationState;
  settings: ReaderSettings;
  isLoading: boolean;
  activeView: 'home' | 'library' | 'reader' | 'gamification' | 'settings';
  setActiveView: (view: 'home' | 'library' | 'reader' | 'gamification' | 'settings') => void;
  selectBook: (id: string) => void;
  addBook: (newBook: Book) => void;
  deleteBook: (id: string) => void;
  updateReadingProgress: (bookId: string, chapterIndex: number, progressPercent: number, page: number) => void;
  addBookmark: (bookId: string, snippet: string) => void;
  removeBookmark: (bookId: string, bookmarkId: string) => void;
  recordReadingTime: (seconds: number) => void;
  updateSettings: (newSettings: Partial<ReaderSettings>) => void;
  resetAllData: () => void;
  restoreSampleBooks: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(INITIAL_SAMPLE_BOOKS);
  const [activeBookId, setActiveBookIdState] = useState<string | null>('sample-dom-casmurro');
  const [gamification, setGamification] = useState<GamificationState>(INITIAL_GAMIFICATION);
  const [settings, setSettings] = useState<ReaderSettings>(INITIAL_SETTINGS);
  const [activeView, setActiveView] = useState<'home' | 'library' | 'reader' | 'gamification' | 'settings'>('home');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load state from Storage on startup
  useEffect(() => {
    const initStore = async () => {
      try {
        const savedBooks = await loadBooksFromStorage();
        if (savedBooks && savedBooks.length > 0) {
          setBooks(savedBooks);
        } else {
          await saveBooksToStorage(INITIAL_SAMPLE_BOOKS);
        }

        const savedGamification = await loadGamificationFromStorage();
        if (savedGamification) {
          setGamification(savedGamification);
        } else {
          await saveGamificationToStorage(INITIAL_GAMIFICATION);
        }

        const savedSettings = await loadSettingsFromStorage();
        if (savedSettings) {
          setSettings(savedSettings);
        }

        const savedActiveId = await loadActiveBookId();
        if (savedActiveId) {
          setActiveBookIdState(savedActiveId);
        }
      } catch (err) {
        console.error('Init store error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initStore();
  }, []);

  const activeBook = books.find(b => b.id === activeBookId) || books[0] || null;

  const selectBook = (id: string) => {
    setActiveBookIdState(id);
    saveActiveBookId(id);
    setActiveView('reader');
  };

  const addBook = (newBook: Book) => {
    const updated = [newBook, ...books];
    setBooks(updated);
    saveBooksToStorage(updated);
    
    // Check book count badge
    checkAndUnlockBadges({ bookCount: updated.length });
  };

  const deleteBook = (id: string) => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    saveBooksToStorage(updated);
    if (activeBookId === id) {
      setActiveBookIdState(updated[0]?.id || null);
    }
  };

  const updateReadingProgress = (
    bookId: string,
    chapterIndex: number,
    progressPercent: number,
    page: number
  ) => {
    const updated = books.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          currentChapterIndex: chapterIndex,
          currentProgressPercent: Math.min(100, Math.max(0, Math.round(progressPercent))),
          currentPage: page,
          lastReadAt: new Date().toISOString(),
        };
      }
      return b;
    });
    setBooks(updated);
    saveBooksToStorage(updated);
  };

  const addBookmark = (bookId: string, snippet: string) => {
    const updated = books.map(b => {
      if (b.id === bookId) {
        const newBM: Bookmark = {
          id: `bm-${Date.now()}`,
          chapterIndex: b.currentChapterIndex,
          progressPercent: b.currentProgressPercent,
          textSnippet: snippet.slice(0, 120),
          createdAt: new Date().toLocaleDateString('pt-BR'),
        };
        return {
          ...b,
          bookmarks: [newBM, ...b.bookmarks],
        };
      }
      return b;
    });
    setBooks(updated);
    saveBooksToStorage(updated);
  };

  const removeBookmark = (bookId: string, bookmarkId: string) => {
    const updated = books.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          bookmarks: b.bookmarks.filter(bm => bm.id !== bookmarkId),
        };
      }
      return b;
    });
    setBooks(updated);
    saveBooksToStorage(updated);
  };

  // Gamification & XP engine
  const recordReadingTime = useCallback((secondsRead: number) => {
    if (secondsRead <= 0) return;

    setGamification(prev => {
      const minutesAdd = secondsRead / 60;
      const xpEarned = Math.round(secondsRead * 0.25); // ~15 XP per min
      const newXP = prev.xp + xpEarned;
      const newLevel = Math.floor(newXP / 200) + 1;
      
      const todayStr = new Date().toISOString().split('T')[0];
      let newStreak = prev.streakDays;
      let newHistory = [...prev.streakHistory];

      if (prev.lastReadingDate !== todayStr) {
        // New day reading!
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (prev.lastReadingDate === yesterday) {
          newStreak += 1;
        } else if (prev.lastReadingDate === null) {
          newStreak = 1;
        } else {
          newStreak = 1; // streak reset if missed
        }
        if (!newHistory.includes(todayStr)) {
          newHistory.push(todayStr);
        }
      }

      const todayMins = Math.round(prev.todayReadingMinutes + minutesAdd);
      const totalMins = Math.round(prev.totalReadingMinutes + minutesAdd);
      const pagesAdded = Math.round(minutesAdd * 0.8);

      // Quests update
      const updatedQuests = prev.quests.map(q => {
        if (q.id === 'q_daily_15') {
          const curr = q.currentMinutes + Math.round(minutesAdd);
          return {
            ...q,
            currentMinutes: curr,
            completed: curr >= q.targetMinutes,
          };
        }
        if (q.id === 'q_daily_pages') {
          const currPages = q.currentMinutes + pagesAdded;
          return {
            ...q,
            currentMinutes: currPages,
            completed: currPages >= q.targetMinutes,
          };
        }
        return q;
      });

      const nextState: GamificationState = {
        ...prev,
        xp: newXP,
        level: newLevel,
        streakDays: newStreak,
        lastReadingDate: todayStr,
        todayReadingMinutes: todayMins,
        todayPagesRead: prev.todayPagesRead + pagesAdded,
        totalReadingMinutes: totalMins,
        totalPagesRead: prev.totalPagesRead + pagesAdded,
        streakHistory: newHistory,
        quests: updatedQuests,
      };

      saveGamificationToStorage(nextState);
      return nextState;
    });
  }, []);

  const checkAndUnlockBadges = (extraCtx?: { bookCount?: number }) => {
    setGamification(prev => {
      const tiktokMinutesSaved = prev.totalReadingMinutes * 3; // 1 min reading = 3 mins TikTok avoided
      const bookCount = extraCtx?.bookCount ?? books.length;

      const updatedBadges = prev.badges.map(b => {
        if (b.unlockedAt) return b;

        let shouldUnlock = false;
        if (b.requirementType === 'streak' && prev.streakDays >= b.requirementValue) shouldUnlock = true;
        if (b.requirementType === 'time' && prev.totalReadingMinutes >= b.requirementValue) shouldUnlock = true;
        if (b.requirementType === 'pages' && prev.totalPagesRead >= b.requirementValue) shouldUnlock = true;
        if (b.requirementType === 'level' && prev.level >= b.requirementValue) shouldUnlock = true;
        if (b.requirementType === 'tiktok' && tiktokMinutesSaved >= b.requirementValue) shouldUnlock = true;
        if (b.requirementType === 'books' && bookCount >= b.requirementValue) shouldUnlock = true;

        if (shouldUnlock) {
          return {
            ...b,
            unlockedAt: new Date().toISOString(),
          };
        }
        return b;
      });

      const next = { ...prev, badges: updatedBadges };
      saveGamificationToStorage(next);
      return next;
    });
  };

  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettingsToStorage(updated);
  };

  const resetAllData = () => {
    setBooks(INITIAL_SAMPLE_BOOKS);
    setGamification(INITIAL_GAMIFICATION);
    setSettings(INITIAL_SETTINGS);
    setActiveBookIdState('sample-dom-casmurro');
    saveBooksToStorage(INITIAL_SAMPLE_BOOKS);
    saveGamificationToStorage(INITIAL_GAMIFICATION);
    saveSettingsToStorage(INITIAL_SETTINGS);
    saveActiveBookId('sample-dom-casmurro');
  };

  const restoreSampleBooks = () => {
    const merged = [...books];
    INITIAL_SAMPLE_BOOKS.forEach(sb => {
      if (!merged.find(b => b.id === sb.id)) {
        merged.push(sb);
      }
    });
    setBooks(merged);
    saveBooksToStorage(merged);
  };

  return (
    <AppContext.Provider
      value={{
        books,
        activeBookId,
        activeBook,
        gamification,
        settings,
        isLoading,
        activeView,
        setActiveView,
        selectBook,
        addBook,
        deleteBook,
        updateReadingProgress,
        addBookmark,
        removeBookmark,
        recordReadingTime,
        updateSettings,
        resetAllData,
        restoreSampleBooks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
