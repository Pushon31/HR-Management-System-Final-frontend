import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboardComponent implements OnInit {
  currentUser: any;
  stats = {
    teamMembers: 0,
    pendingTasks: 0,
    teamLeaves: 0,
    completedProjects: 0
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    // Mock data
    this.stats = {
      teamMembers: 24,
      pendingTasks: 8,
      teamLeaves: 5,
      completedProjects: 12
    };
  }
}