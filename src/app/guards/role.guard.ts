import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // FIX: Use 'roles' instead of 'expectedRoles' to match your route configuration
    const requiredRoles = route.data['roles'] as Array<string>;
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRequiredRole = requiredRoles.some(role => 
      currentUser.roles.includes(role)
    );

    if (hasRequiredRole) {
      return true;
    }

    // Redirect to appropriate dashboard based on user role
    this.redirectToUserDashboard(currentUser);
    return false;
  }

  private redirectToUserDashboard(user: any): void {
    const userRoles = user.roles;

    if (userRoles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (userRoles.some((role: string) => 
      ['ROLE_MANAGER', 'ROLE_HR', 'ROLE_ACCOUNTANT'].includes(role))) {
      this.router.navigate(['/manager/dashboard']);
    } else if (userRoles.includes('ROLE_EMPLOYEE')) {
      this.router.navigate(['/employee/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}