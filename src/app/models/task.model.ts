// src/app/models/task.model.ts
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignedToId: number;
  assignedToName: string;
  assignedById: number;
  assignedByName: string;
  projectId: number;
  projectName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  startDate: string;
  completedDate: string;
  estimatedHours: number;
  actualHours: number;
  tags: string;
  completionPercentage: number;
  isUrgent: boolean;
  commentCount: number;
  attachmentCount: number;
  isOverdue: boolean;
  departmentName: string;
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

export interface TaskComment {
  id: number;
  taskId: number;
  taskTitle: string;
  employeeId: number;
  employeeName: string;
  comment: string;
  commentDate: string;
  isInternal: boolean;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  taskTitle: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedById: number;
  uploadedByName: string;
  uploadDate: string;
  description: string;
}

export interface TaskDashboard {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  urgentTasks: number;
  statusDistribution: { [key: string]: number };
  highPriorityTasks: number;
  urgentPriorityTasks: number;
  recentTasks: number;
}