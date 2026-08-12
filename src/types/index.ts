export type BookFormat = 'EPUB' | 'PDF' | 'TXT' | 'MD';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  pageOffset?: number;
}

export interface Bookmark {
  id: string;
  chapterIndex: number;
  progressPercent: number;
  textSnippet: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  coverImage?: string;
  format: BookFormat;
  chapters: Chapter[];
  currentChapterIndex: number;
  currentProgressPercent: number; // 0 - 100
  totalPages: number;
  currentPage: number;
  bookmarks: Bookmark[];
  lastReadAt?: string;
  addedAt: string;
  fileData?: string; // base64 or raw text content for persistent web storage
  fileSize?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  requirementType: 'streak' | 'pages' | 'time' | 'books' | 'level' | 'tiktok';
  requirementValue: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  rewardXP: number;
  targetMinutes: number;
  currentMinutes: number;
  completed: boolean;
}

export interface GamificationState {
  xp: number;
  level: number;
  streakDays: number;
  lastReadingDate: string | null; // YYYY-MM-DD
  todayReadingMinutes: number;
  todayPagesRead: number;
  totalReadingMinutes: number;
  totalPagesRead: number;
  totalBooksFinished: number;
  streakHistory: string[]; // List of YYYY-MM-DD dates lidas
  badges: Badge[];
  quests: DailyQuest[];
  dailyTargetMinutes: number;
}

export type ReaderTheme = 'light' | 'sepia' | 'dark' | 'pitchBlack';
export type ReaderFontFamily = 'Serif' | 'Sans' | 'Monospace';

export interface ReaderSettings {
  fontSize: number; // 12 - 36
  fontFamily: ReaderFontFamily;
  theme: ReaderTheme;
  lineHeight: number; // 1.2 - 2.0
  autoScroll: boolean;
  autoScrollSpeed: number; // 1 - 5
}
