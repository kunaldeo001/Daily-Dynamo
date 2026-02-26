
export type TaskCategory = 'Productive' | 'Self-Care' | 'Whimsical';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  category: TaskCategory;
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
