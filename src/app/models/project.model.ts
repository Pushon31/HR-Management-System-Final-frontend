// src/app/models/project.model.ts
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Project {
  id: number;
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  departmentId: number;
  departmentName: string;
  projectManagerId: number;
  projectManagerName: string;
  status: ProjectStatus;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
}