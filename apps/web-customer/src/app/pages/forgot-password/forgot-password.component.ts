import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
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

      <!-- Assistance Card -->
      <div class="w-full max-w-[350px] bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
        <h1 class="text-2xl font-medium text-[#222222] mb-4">Password assistance</h1>
        <p class="text-sm text-neutral-700 mb-6 leading-relaxed">
            Enter the email address associated with your Chommie account.
        </p>

        <form *ngIf="!success()" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="space-y-1">
            <label for="email" class="block text-xs font-bold text-[#222222]">Email address</label>
            <input 
                id="email" 
                name="email" 
                type="email" 
                [(ngModel)]="email" 
                required
                class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all"
            >
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
              {{ loading() ? 'Please wait...' : 'Continue' }}
            </button>
          </div>
        </form>

        <div *ngIf="success()" class="bg-emerald-50 border border-emerald-200 p-4 rounded-sm space-y-3 animate-fade-in">
            <div class="flex items-center gap-2 text-emerald-700">
               <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
               <h4 class="text-sm font-bold">Request Transmitted</h4>
            </div>
            <p class="text-xs text-neutral-700 leading-relaxed">{{ successMessage() }}</p>
            <div class="pt-2">
               <a routerLink="/login" class="text-xs text-primary hover:underline font-bold">Return to Sign In</a>
            </div>
        </div>

      </div>
      
      <div class="mt-12 text-[11px] text-neutral-500 max-w-[350px] w-full border-t border-neutral-200 pt-6 text-center">
          <p class="font-bold text-[#222222] mb-2">Has your email changed?</p>
          <p class="leading-relaxed">If you no longer use the email address associated with your Chommie account, you may contact <a href="#" class="text-primary hover:underline">Customer Service</a> for help restoring access to your account.</p>
      </div>

    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  loading = signal(false);
  success = signal(false);
  successMessage = signal('');
  error = signal('');

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(true);
        this.successMessage.set(res.message);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('An error occurred. Please try again.');
      }
    });
  }
}
