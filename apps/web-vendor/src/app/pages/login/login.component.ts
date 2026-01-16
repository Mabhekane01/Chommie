import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-login',
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

      <!-- Auth Card -->
      <div class="w-full max-w-[350px] bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
        
        <ng-container *ngIf="!show2FA()">
            <h1 class="text-2xl font-medium text-[#222222] mb-4">Seller Sign-In</h1>

            <form (ngSubmit)="onSubmit()" class="space-y-4">
            
            <div class="space-y-1">
                <label for="email" class="block text-xs font-bold text-[#222222]">{{ ts.t('auth.email') }}</label>
                <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    [(ngModel)]="email" 
                    required
                    class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all"
                >
            </div>

            <div class="space-y-1">
                <div class="flex justify-between items-center">
                    <label for="password" class="block text-xs font-bold text-[#222222]">{{ ts.t('auth.password') }}</label>
                    <a routerLink="/forgot-password" class="text-xs text-primary hover:underline hover:text-primary-dark font-medium">
                        Forgot Password?
                    </a>
                </div>
                <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    [(ngModel)]="password" 
                    required
                    class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all"
                >
            </div>

            <div *ngIf="error()" class="flex flex-col gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm">
                <div class="flex items-start gap-2">
                    <svg class="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {{ error() }}
                </div>
                <button *ngIf="error().includes('verify')" (click)="resendVerification()" class="text-left text-xs text-primary hover:underline font-bold ml-6">
                    Resend Verification Email
                </button>
            </div>

            <div class="pt-2">
                <button 
                type="submit" 
                [disabled]="loading()"
                class="w-full btn-primary py-1.5 rounded-[3px] text-xs font-normal shadow-sm"
                >
                {{ loading() ? 'Please wait...' : 'Sign In' }}
                </button>
            </div>

            <div class="text-[11px] text-neutral-600 leading-tight py-2">
                By continuing, you agree to Chommie's <a href="#" class="text-primary hover:underline">Seller Terms of Service</a> and <a href="#" class="text-primary hover:underline">Privacy Notice</a>.
            </div>

            <!-- Divider -->
            <div class="relative py-2">
                <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t border-neutral-200"></span>
                </div>
                <div class="relative flex justify-center text-[10px] text-neutral-500 uppercase">
                <span class="bg-white px-2 text-neutral-400">New to Chommie Central?</span>
                </div>
            </div>

            <a routerLink="/register" class="w-full btn-secondary py-1.5 rounded-[3px] text-xs text-center block font-medium shadow-sm">
                Register as a Vendor
            </a>
            </form>
        </ng-container>

        <!-- 2FA OTP Step -->
        <ng-container *ngIf="show2FA()">
            <h1 class="text-2xl font-medium text-[#222222] mb-2">Two-Step Verification</h1>
            <p class="text-sm text-neutral-700 mb-6 leading-relaxed">
                To secure your seller account, we've sent a code to <span class="font-bold">{{ email }}</span>.
            </p>

            <form (ngSubmit)="onVerify2FA()" class="space-y-4">
                <div class="space-y-1">
                    <label for="otp" class="block text-xs font-bold text-white/70">Enter OTP</label>
                    <input id="otp" name="otp" type="text" [(ngModel)]="otp" required maxlength="6" minlength="6"
                        class="w-full bg-white/5 border border-white/20 rounded-[3px] px-2 py-1.5 text-lg font-bold tracking-widest text-center text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all">
                </div>

                <div *ngIf="error()" class="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm">
                    {{ error() }}
                </div>

                <div class="pt-2">
                    <button type="submit" [disabled]="loading()" class="w-full btn-primary py-1.5 rounded-[3px] text-xs font-normal shadow-sm">
                        {{ loading() ? 'Authenticating...' : 'Sign In' }}
                    </button>
                </div>

                <div class="text-center">
                    <button type="button" (click)="onSubmit()" class="text-xs text-primary hover:underline font-bold">Resend OTP</button>
                </div>
            </form>
        </ng-container>

      </div>

      <footer class="mt-8 text-[11px] text-neutral-500 space-y-4 max-w-[350px] w-full border-t border-neutral-200 pt-6 text-center">
        <div class="flex gap-6 justify-center text-primary font-medium">
            <a href="#" class="hover:underline">Conditions of Use</a>
            <a href="#" class="hover:underline">Privacy Notice</a>
            <a href="#" class="hover:underline">Help</a>
        </div>
        <p>&copy; 2026, Chommie.za, Inc. or its affiliates</p>
      </footer>
    </div>
  `
})
export class LoginComponent {
  public ts = inject(TranslationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  otp = '';
  show2FA = signal(false);
  loading = signal(false);
  error = signal('');

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.status === '2fa_required') {
            this.show2FA.set(true);
        } else if (res.accessToken) {
            localStorage.setItem('access_token', res.accessToken);
            localStorage.setItem('user_id', res.user.id);
            localStorage.setItem('vendor_id', res.user.id);
            this.router.navigate(['/dashboard']);
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid email or password');
      }
    });
  }

  onVerify2FA() {
    if (!this.otp || this.otp.length !== 6) {
        this.error.set('Please enter a valid 6-digit code');
        return;
    }
    this.loading.set(true);
    this.error.set('');

    this.authService.verify2FA(this.email, this.otp).subscribe({
        next: (res: any) => {
            if (res.accessToken) {
                localStorage.setItem('access_token', res.accessToken);
                localStorage.setItem('user_id', res.user.id);
                localStorage.setItem('vendor_id', res.user.id);
                this.router.navigate(['/dashboard']);
            }
            this.loading.set(false);
        },
        error: (err: any) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Invalid or expired code');
        }
    });
  }

  resendVerification() {
    this.loading.set(true);
    this.authService.resendVerification(this.email).subscribe({
        next: (res: any) => {
            this.loading.set(false);
            alert(res.message || 'Verification code sent.');
            this.router.navigate(['/register'], { queryParams: { email: this.email, step: 'verify' } });
        },
        error: (err: any) => {
            this.loading.set(false);
            alert('Failed to send verification code.');
        }
    });
  }
}
