
export type TaskCategory = 'Productive' | 'Self-Care' | 'Whimsical';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  category: TaskCategory;
  createdAt: any;
}

export interface DailySparkData {
  id: string;
  content: string;
  sparkDate: string;
  createdAt: any;
}
