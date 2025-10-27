// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectStatus } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  // Create new project
  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  // Get all projects
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  // Get project by ID
  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  // Get project by code
  getProjectByCode(code: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/code/${code}`);
  }

  // Update project
  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  // Delete project
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get projects by status
  getProjectsByStatus(status: ProjectStatus): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/status/${status}`);
  }

  // Get projects by department
  getProjectsByDepartment(departmentId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/department/${departmentId}`);
  }

  // Close project
  closeProject(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/close`, {});
  }

  // Get project statistics
  getProjectStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }
}