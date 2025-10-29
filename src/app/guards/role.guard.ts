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

  // ✅ FIX: Use roles exactly as they come from backend (with ROLE_ prefix)
  const userRoles = currentUser.roles;

  const hasRequiredRole = expectedRoles.some(role => 
    userRoles.includes(role)
  );

  if (!hasRequiredRole) {
    console.warn('Access denied. Required roles:', expectedRoles, 'User roles:', currentUser.roles);
    this.router.navigate(['/access-denied']);
    return false;
  }

  return true;
}
}