import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#FAF3E1] flex flex-col items-center pt-12 px-4">
      
      <!-- Logo -->
      <div class="mb-8">
        <a routerLink="/" class="font-header font-black text-3xl tracking-tighter text-[#222222]">
          Chommie<span class="text-primary">.za</span>
        </a>
      </div>

      <!-- Reset Card -->
      <div class="w-full max-w-[350px] bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
        <h1 class="text-2xl font-medium text-[#222222] mb-4">Create new password</h1>
        <p class="text-sm text-neutral-700 mb-6 leading-relaxed">
            We'll ask for this password whenever you sign in.
        </p>

        <form *ngIf="!success()" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="space-y-4">
            <div class="space-y-1">
              <label for="password" class="block text-xs font-bold text-[#222222]">New password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                [(ngModel)]="password" 
                required
                minlength="6"
                class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all"
              >
              <p class="text-[11px] text-neutral-500 italic">Passwords must be at least 6 characters.</p>
            </div>

            <div class="space-y-1">
              <label for="confirmPassword" class="block text-xs font-bold text-[#222222]">Password again</label>
              <input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                [(ngModel)]="confirmPassword" 
                required
                class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all"
              >
            </div>
          </div>

          <div *ngIf="error()" class="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm">
             {{ error() }}
          </div>

          <div class="pt-2">
            <button 
              type="submit" 
              [disabled]="loading()"
              class="w-full btn-primary py-1.5 rounded-[3px] text-xs font-normal"
            >
              {{ loading() ? 'Saving changes...' : 'Save changes and sign in' }}
            </button>
          </div>
        </form>

        <div *ngIf="success()" class="text-center space-y-6 py-6 animate-fade-in">
            <div class="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
               <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div class="space-y-2">
               <h2 class="text-xl font-bold text-[#222222]">Password changed</h2>
               <p class="text-xs text-neutral-600">Your password has been reset successfully.</p>
            </div>
            <div class="pt-2">
               <a routerLink="/login" class="btn-primary py-1.5 px-8 rounded-[3px] text-xs inline-block font-normal">
                   Sign in now
               </a>
            </div>
        </div>

      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  token = '';
  loading = signal(false);
  success = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService, 
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
        this.token = params['token'];
        if (!this.token) {
            this.error.set('Invalid or missing reset token.');
        }
    });
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
        this.error.set('Passwords do not match');
        return;
    }
    if (!this.token) {
        this.error.set('Missing reset token');
        return;
    }

    this.loading.set(true);
    this.error.set('');
    
    this.authService.resetPassword({ token: this.token, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to reset password. Link may have expired.');
      }
    });
  }
}
