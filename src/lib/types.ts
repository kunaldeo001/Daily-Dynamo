
export type TaskCategory = 'Productive' | 'Self-Care' | 'Whimsical';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  category: TaskCategory;
  priority: TaskPriority;
  duration?: string;
  isMainQuest?: boolean;
  createdAt: any;
  ownerId: string;
  breakdown?: string; // AI generated breakdown steps
  isWhimsical?: boolean; // Toggle for extra flair
}

export interface DailySparkData {
  id: string;
  content: string;
  sparkDate: string;
  imageUrl?: string;
  createdAt: any;
  ownerId: string;
  mood?: string;
}

export interface DailyReflectionData {
  id: string;
  reflectionDate: string;
  note: string;
  createdAt: any;
  ownerId: string;
}

export interface DailySummaryData {
  id: string;
  summaryDate: string;
  content: string;
  createdAt: any;
  ownerId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  dailyMotto?: string;
  pomodoroWorkMinutes?: number;
  pomodoroBreakMinutes?: number;
}
