import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center bg-amazon-bg py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#0F1111]">
      
      <!-- Logo -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold tracking-tight text-primary">Chommie</h1>
      </div>

      <!-- Auth Card -->
      <div class="w-full max-w-[400px] glass-panel p-8 shadow-2xl">
        <h1 class="text-3xl font-light mb-6 text-center">Sign in</h1>

        <form (ngSubmit)="onSubmit()" class="space-y-5">
          
          <div>
            <label for="email" class="block text-sm font-bold text-[#0F1111] mb-1">Email or mobile phone number</label>
            <input 
                id="email" 
                name="email" 
                type="email" 
                [(ngModel)]="email" 
                required
                class="block w-full rounded-lg border-gray-300 border bg-white/80 backdrop-blur-sm px-3 py-2 text-sm focus:border-action focus:ring-1 focus:ring-action focus:outline-none transition-all shadow-inner"
            >
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
                <label for="password" class="block text-sm font-bold text-[#0F1111]">Password</label>
                <a routerLink="/forgot-password" class="text-sm text-action hover:text-action-hover hover:underline cursor-pointer">
                    Forgot your password?
                </a>
            </div>
            <input 
                id="password" 
                name="password" 
                type="password" 
                [(ngModel)]="password" 
                required
                class="block w-full rounded-lg border-gray-300 border bg-white/80 backdrop-blur-sm px-3 py-2 text-sm focus:border-action focus:ring-1 focus:ring-action focus:outline-none transition-all shadow-inner"
            >
          </div>

          <div *ngIf="error()" class="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50/80 backdrop-blur-sm border border-red-300 rounded-lg">
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ error() }}
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full glass-btn rounded-full py-2.5 text-sm font-bold tracking-wide shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-0.5"
          >
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>

          <!-- Divider -->
          <div class="relative mt-8 mb-6">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t border-gray-300/50"></span>
            </div>
            <div class="relative flex justify-center text-xs text-gray-500">
              <span class="bg-white/50 px-2 rounded backdrop-blur-sm">or</span>
            </div>
          </div>

          <!-- Google Login -->
          <button type="button" (click)="loginWithGoogle()" class="w-full bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 rounded-full py-2.5 text-sm text-[#0F1111] flex items-center justify-center gap-2 shadow-sm transition-all">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-4 h-4" alt="Google">
            Sign in with Google
          </button>

        </form>

        <p class="mt-8 text-xs text-gray-500 text-center">
            By continuing, you agree to Chommie's <a href="#" class="text-action hover:underline">Conditions of Use</a> and <a href="#" class="text-action hover:underline">Privacy Notice</a>.
        </p>

        <div class="mt-6 border-t border-gray-200/50 pt-6">
             <div class="text-sm font-bold text-[#0F1111] mb-2 text-center">New to Chommie?</div>
             <a routerLink="/register" class="block w-full text-center bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 rounded-full py-2.5 text-sm text-[#0F1111] shadow-sm transition-all cursor-pointer">
                Create your Chommie account
             </a>
        </div>

      </div>

      <div class="mt-12 text-xs text-center text-gray-500 space-y-2">
        <div class="space-x-4">
            <a href="#" class="hover:text-action hover:underline">Conditions of Use</a>
            <a href="#" class="hover:text-action hover:underline">Privacy Notice</a>
            <a href="#" class="hover:text-action hover:underline">Help</a>
        </div>
        <p>&copy; 2024-2026, Chommie, Inc. or its affiliates</p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.accessToken) {
            localStorage.setItem('access_token', res.accessToken);
            localStorage.setItem('user_id', res.user.id);
            // Force reload to update header state or use a subject
            this.authService.currentUser.set({ id: res.user.id, token: res.accessToken });
            this.router.navigate(['/']);
        } else {
             this.error.set('Login failed');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Invalid email or password');
      }
    });
  }

  loginWithGoogle() {
    // Mock functionality
    alert('Google Login is simulated. In production, this redirects to OAuth provider.');
    // window.location.href = 'http://localhost:3000/auth/google';
  }
}