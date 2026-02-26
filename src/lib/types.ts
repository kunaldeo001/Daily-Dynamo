
export type TaskCategory = 'Productive' | 'Self-Care' | 'Whimsical';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  category: TaskCategory;
  priority: TaskPriority;
  createdAt: any;
  ownerId: string;
  breakdown?: string; // AI generated breakdown steps
  isWhimsical?: boolean; // Toggle for extra flair
}

export interface DailySparkData {
  id: string;
  content: string;
  sparkDate: string;
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
