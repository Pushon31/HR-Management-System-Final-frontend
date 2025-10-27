// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Task, 
  TaskComment, 
  TaskAttachment, 
  TaskDashboard, 
  TaskPriority, 
  TaskStatus 
} from '../models/task.model';
import { Project, ProjectStatus } from '../models/project.model';
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api';
  private adminUrl = `${this.apiUrl}/admin/tasks`;
  private managerUrl = `${this.apiUrl}/manager/tasks`;

  constructor(private http: HttpClient) {}

  // ==================== ADMIN TASK METHODS ====================
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.adminUrl);
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.adminUrl}/${id}`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.adminUrl, task);
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.adminUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }

  getTasksByEmployee(employeeId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.adminUrl}/employee/${employeeId}`);
  }

  getTasksByDepartment(departmentId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.adminUrl}/department/${departmentId}`);
  }

  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.adminUrl}/status/${status}`);
  }

  getTasksByPriority(priority: TaskPriority): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.adminUrl}/priority/${priority}`);
  }

  getOverdueTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.adminUrl}/overdue`);
  }

  getUrgentTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.adminUrl}/urgent`);
  }

  reassignTask(taskId: number, newEmployeeId: number): Observable<Task> {
    return this.http.put<Task>(`${this.adminUrl}/${taskId}/reassign/${newEmployeeId}`, {});
  }

  // ==================== MANAGER TASK METHODS ====================
  getMyTeamTasks(managerId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.managerUrl}/my-team/${managerId}`);
  }

  getMyTeamPendingTasks(managerId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.managerUrl}/my-team/${managerId}/pending`);
  }

  getMyTeamOverdueTasks(managerId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.managerUrl}/my-team/${managerId}/overdue`);
  }

  getMyTeamCompletedTasks(managerId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.managerUrl}/my-team/${managerId}/completed`);
  }

  assignTaskToTeamMember(managerId: number, task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.managerUrl}/my-team/${managerId}/assign`, task);
  }

  updateTeamTask(managerId: number, taskId: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.managerUrl}/my-team/${managerId}/tasks/${taskId}`, task);
  }

  updateTeamTaskStatus(managerId: number, taskId: number, status: string): Observable<Task> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Task>(`${this.managerUrl}/my-team/${managerId}/tasks/${taskId}/status`, {}, { params });
  }

  // ==================== PROJECT METHODS ====================
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.adminUrl}/projects`);
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.adminUrl}/projects`, project);
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.adminUrl}/projects/${id}`, project);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.adminUrl}/projects/${id}`);
  }

  closeProject(id: number): Observable<void> {
    return this.http.put<void>(`${this.adminUrl}/projects/${id}/close`, {});
  }

  getProjectsByDepartment(departmentId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.managerUrl}/my-team/${departmentId}/projects`);
  }

  // ==================== COMMENT & ATTACHMENT METHODS ====================
  addComment(comment: TaskComment): Observable<TaskComment> {
    return this.http.post<TaskComment>(`${this.apiUrl}/tasks/comments`, comment);
  }

  getTaskComments(taskId: number): Observable<TaskComment[]> {
    return this.http.get<TaskComment[]>(`${this.apiUrl}/tasks/${taskId}/comments`);
  }

  addAttachment(attachment: TaskAttachment): Observable<TaskAttachment> {
    return this.http.post<TaskAttachment>(`${this.apiUrl}/tasks/attachments`, attachment);
  }

  getTaskAttachments(taskId: number): Observable<TaskAttachment[]> {
    return this.http.get<TaskAttachment[]>(`${this.apiUrl}/tasks/${taskId}/attachments`);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/comments/${commentId}`);
  }

  deleteAttachment(attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/attachments/${attachmentId}`);
  }

  // ==================== DASHBOARD METHODS ====================
  getTaskDashboard(): Observable<TaskDashboard> {
    return this.http.get<TaskDashboard>(`${this.adminUrl}/dashboard`);
  }

  getManagerDashboard(managerId: number): Observable<any> {
    return this.http.get<any>(`${this.managerUrl}/dashboard/${managerId}`);
  }

  getEmployeeDashboard(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employee/tasks/dashboard/${employeeId}`);
  }

  getTaskStatistics(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.adminUrl}/statistics/tasks`);
  }

  getProjectStatistics(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.adminUrl}/statistics/projects`);
  }

  getUpcomingDeadlines(days: number = 7): Observable<Task[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<Task[]>(`${this.adminUrl}/upcoming-deadlines`, { params });
  }

  searchTasks(keyword: string): Observable<Task[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Task[]>(`${this.adminUrl}/search`, { params });
  }
}