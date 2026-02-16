export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: any;
}

export interface DailySparkData {
  id: string;
  content: string;
  sparkDate: string;
  createdAt: any;
}
