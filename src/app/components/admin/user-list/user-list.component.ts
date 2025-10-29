import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { UserResponse, SYSTEM_ROLES, ROLE_DISPLAY_NAMES } from '../../../models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: UserResponse[] = [];
  loading = false;
  error = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Filters
  searchTerm = '';
  roleFilter = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.totalItems = users.length;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users';
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  // Get filtered users based on search and role filter
  get filteredUsers(): UserResponse[] {
    let filtered = this.users;

    if (this.searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.roleFilter) {
      filtered = filtered.filter(user =>
        user.roles.includes(this.roleFilter)
      );
    }

    this.totalItems = filtered.length;
    return filtered;
  }

  // Get paginated users
  get paginatedUsers(): UserResponse[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Get role display name
  getRoleDisplayName(role: string): string {
    return ROLE_DISPLAY_NAMES[role] || role;
  }

  // Get avatar text (initials)
  getAvatarText(user: UserResponse): string {
    if (!user.fullName) return '??';
    const names = user.fullName.split(' ');
    const initials = names.map(n => n[0]).join('').toUpperCase();
    return initials.slice(0, 2); // Take max 2 initials
  }

  // Get display range for pagination
  getDisplayRange(): { start: number, end: number } {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return { start, end };
  }

  // Toggle user active status
  toggleUserStatus(user: UserResponse): void {
    const newStatus = !user.active;
    
    if (newStatus) {
      this.userService.activateUser(user.id).subscribe({
        next: () => {
          user.active = true;
        },
        error: (error) => {
          this.error = 'Failed to activate user';
          console.error('Error activating user:', error);
        }
      });
    } else {
      this.userService.deactivateUser(user.id).subscribe({
        next: () => {
          user.active = false;
        },
        error: (error) => {
          this.error = 'Failed to deactivate user';
          console.error('Error deactivating user:', error);
        }
      });
    }
  }

  // Delete user
  deleteUser(user: UserResponse): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
        },
        error: (error) => {
          this.error = 'Failed to delete user';
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  // Change page
  changePage(page: number): void {
    this.currentPage = page;
  }

  // Get total pages
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Clear filters
  clearFilters(): void {
    this.searchTerm = '';
    this.roleFilter = '';
    this.currentPage = 1;
  }
}