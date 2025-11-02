import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // Monitor storage changes
    window.addEventListener('storage', (event) => {
      console.log('📦 Storage changed:', event.key, event.newValue);
    });
    
    // Log initial auth state
    console.log('🚀 App started - Auth state:', {
      token: !!localStorage.getItem('token'),
      user: !!localStorage.getItem('currentUser'),
      isAuthenticated: this.authService.isAuthenticated()
    });
  }
}
