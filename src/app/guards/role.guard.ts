// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Array<string>;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // ✅ FIX: Remove ROLE_ prefix for comparison with backend
    const userRoles = currentUser.roles.map(role => 
      role.replace('ROLE_', '')
    );

    const hasRequiredRole = expectedRoles.some(role => 
      userRoles.includes(role.replace('ROLE_', ''))
    );

    if (!hasRequiredRole) {
      console.warn('Access denied. Required roles:', expectedRoles, 'User roles:', currentUser.roles);
      this.router.navigate(['/access-denied']);
      return false;
    }

    return true;
  }
}