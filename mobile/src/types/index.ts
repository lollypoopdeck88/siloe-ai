export interface ChapterContext {
  reference: string;
  text: string;
  culturalNotes?: Array<{
    term: string;
    explanation: string;
  }>;
  originalLanguage?: Array<{
    word: string;
    meaning: string;
    usage: string;
  }>;
}

export interface SOAPStudy {
  id: string;
  reference: string;
  focusVerses: {
    text: string;
    verseNumbers: number[];
    reason: string;
  };
  observation: string;
  application: string;
  prayer: string;
  createdAt: string;
  userId?: string;
}

export interface StudyProgress {
  timeSpent: number;
  isChapterRead: boolean;
  isSoapComplete: boolean;
  lastPosition?: number;
}

export interface CrossReference {
  reference: string;
  text: string;
  relevance: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  studyId: string;
  chapterRef: string;
  content: string;
  timestamp: string;
  tags?: string[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  duration: number;
  chapters: Array<{
    reference: string;
    focus: string;
    preparationQuestions: string[];
  }>;
  progress: {
    chaptersRead: string[];
    notesWritten: number;
    timeSpent: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  readingSpeed?: number;
  preferredBibleVersion?: string;
  dailyReadingGoal?: number;
  reminderTime?: string;
  theme?: 'light' | 'dark' | 'system';
  fontSize?: number;
}

export interface StudyAids {
  maps?: {
    url: string;
    description: string;
  };
  timeline?: Array<{
    date: string;
    event: string;
    significance: string;
  }>;
  culturalNotes?: Array<{
    term: string;
    explanation: string;
  }>;
  originalLanguage?: Array<{
    word: string;
    meaning: string;
    usage: string;
  }>;
}

export interface AudioContent {
  reference: string;
  url: string;
  duration: number;
  narrator: string;
  version: string;
}

export type ThemeType = 'light' | 'dark' | 'system';

export interface AppError {
  code: string;
  message: string;
  details?: any;
}
