import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#FAF3E1] flex flex-col items-center pt-12 px-4 text-neutral-charcoal font-body">
      
      <!-- Logo -->
      <div class="mb-8">
        <a routerLink="/" class="font-header font-black text-3xl tracking-tighter text-[#222222]">
          Chommie<span class="text-primary">.central</span>
        </a>
      </div>

      <!-- Assistance Card -->
      <div class="w-full max-w-[350px] bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
        
        <!-- Step 1: Request OTP -->
        <ng-container *ngIf="step() === 'request'">
            <h1 class="text-2xl font-medium text-[#222222] mb-4">Password assistance</h1>
            <p class="text-sm text-neutral-700 mb-6 leading-relaxed">
                Enter the email address associated with your Chommie Central account.
            </p>

            <form (ngSubmit)="onRequestOtp()" class="space-y-4">
            <div class="space-y-1">
                <label for="email" class="block text-xs font-bold text-[#222222]">Email address</label>
                <input id="email" name="email" type="email" [(ngModel)]="email" required
                    class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all">
            </div>

            <div *ngIf="error()" class="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm">
                {{ error() }}
            </div>

            <div class="pt-2">
                <button type="submit" [disabled]="loading()" class="w-full btn-primary py-1.5 rounded-[3px] text-xs font-normal">
                {{ loading() ? 'Please wait...' : 'Continue' }}
                </button>
            </div>
            </form>
        </ng-container>

        <!-- Step 2: Verify OTP & New Password -->
        <ng-container *ngIf="step() === 'reset'">
            <h1 class="text-2xl font-medium text-[#222222] mb-2">Reset password</h1>
            <p class="text-sm text-neutral-700 mb-6 leading-relaxed">
                We've sent a code to <span class="font-bold">{{ email }}</span>. Please enter it below along with your new seller password.
            </p>

            <form (ngSubmit)="onResetPassword()" class="space-y-4">
                <div class="space-y-1">
                    <label for="otp" class="block text-xs font-bold text-[#222222]">Enter OTP</label>
                    <input id="otp" name="otp" type="text" [(ngModel)]="otp" required maxlength="6"
                        class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-lg font-bold tracking-[0.5em] text-center focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all">
                </div>

                <div class="space-y-1">
                    <label for="password" class="block text-xs font-bold text-[#222222]">New password</label>
                    <input id="password" name="password" type="password" [(ngModel)]="password" required minlength="6"
                        class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all">
                </div>

                <div *ngIf="error()" class="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm">
                    {{ error() }}
                </div>

                <div class="pt-2">
                    <button type="submit" [disabled]="loading()" class="w-full btn-primary py-1.5 rounded-[3px] text-xs font-normal">
                        {{ loading() ? 'Saving changes...' : 'Save changes' }}
                    </button>
                </div>
            </form>
        </ng-container>

        <!-- Success State -->
        <div *ngIf="step() === 'success'" class="text-center space-y-6 py-4 animate-fade-in">
            <div class="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
               <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 class="text-xl font-bold text-[#222222]">Success</h2>
            <p class="text-xs text-neutral-600">Your seller password has been reset successfully.</p>
            <a routerLink="/login" class="btn-primary py-1.5 px-8 rounded-[3px] text-xs inline-block">Sign In to Central</a>
        </div>

      </div>
      
      <div *ngIf="step() !== 'success'" class="mt-12 text-[11px] text-neutral-500 max-w-[350px] w-full border-t border-neutral-200 pt-6 text-center">
          <p class="font-bold text-[#222222] mb-2">Need help?</p>
          <p class="leading-relaxed">Contact <a href="#" class="text-primary hover:underline">Seller Support</a> for help restoring access to your account.</p>
      </div>

    </div>
  `
})
export class ForgotPasswordComponent {
  public ts = inject(TranslationService);
  private authService = inject(AuthService);

  step = signal<'request' | 'reset' | 'success'>('request');
  email = '';
  otp = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onRequestOtp() {
    if (!this.email) return;
    this.loading.set(true);
    this.error.set('');
    
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('reset');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('An error occurred. Please try again.');
      }
    });
  }

  onResetPassword() {
    if (!this.otp || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.resetPassword({ email: this.email, otp: this.otp, password: this.password }).subscribe({
        next: () => {
            this.loading.set(false);
            this.step.set('success');
        },
        error: (err: any) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Failed to reset password. Link may have expired.');
        }
    });
  }
}