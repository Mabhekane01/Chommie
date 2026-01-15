import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#FAF3E1] flex flex-col items-center pt-12 px-4 text-neutral-charcoal font-body">
      
      <!-- Logo -->
      <div class="mb-8">
        <a routerLink="/" class="font-header font-black text-3xl tracking-tighter text-[#222222]">
          Chommie<span class="text-primary">.za</span>
        </a>
      </div>

      <!-- Registration Card -->
      <div class="w-full max-w-[350px] bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
        
        <!-- Step 1: Create Account -->
        <ng-container *ngIf="step() === 'details'">
            <h1 class="text-2xl font-medium text-[#222222] mb-4">{{ ts.t('auth.create_account') }}</h1>

            <form (ngSubmit)="onRegisterInit()" class="space-y-4">
            
            <div class="space-y-1">
                <label for="first-name" class="block text-xs font-bold text-[#222222]">Your name</label>
                <input id="first-name" name="firstName" type="text" [(ngModel)]="firstName" required placeholder="First and last name"
                    class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all">
            </div>

            <div class="space-y-1">
                <label for="email" class="block text-xs font-bold text-[#222222]">{{ ts.t('auth.email') }}</label>
                <input id="email" name="email" type="email" [(ngModel)]="email" required
                    class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all">
            </div>

            <div class="space-y-1">
                <label for="password" class="block text-xs font-bold text-[#222222]">{{ ts.t('auth.password') }}</label>
                <input id="password" name="password" type="password" [(ngModel)]="password" required placeholder="At least 6 characters"
                    class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all">
                <p class="text-[11px] text-neutral-600 flex items-center gap-1.5 mt-1">
                <svg class="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                Passwords must be at least 6 characters.
                </p>
            </div>

            <div *ngIf="error()" class="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm">
                {{ error() }}
            </div>

            <div class="pt-2">
                <button type="submit" [disabled]="loading()" class="w-full btn-primary py-1.5 rounded-[3px] text-xs font-normal">
                {{ loading() ? 'Creating account...' : 'Verify email' }}
                </button>
            </div>

            <div class="text-[11px] text-neutral-600 leading-tight pt-2 border-t border-neutral-100">
                By creating an account, you agree to Chommie's <a href="#" class="text-primary hover:underline">Conditions of Use</a> and <a href="#" class="text-primary hover:underline">Privacy Notice</a>.
            </div>

            <div class="pt-4 mt-4 border-t border-neutral-200 text-xs">
                <span class="text-[#222222]">Already have an account? </span>
                <a routerLink="/login" class="text-primary hover:underline group">
                    {{ ts.t('nav.signin') }} <svg class="inline w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" /></svg>
                </a>
            </div>
            </form>
        </ng-container>

        <!-- Step 2: Verify OTP -->
        <ng-container *ngIf="step() === 'otp'">
            <h1 class="text-2xl font-medium text-[#222222] mb-2">Verify email address</h1>
            <p class="text-sm text-neutral-700 mb-6 leading-relaxed">
                To verify your email, we've sent a One Time Password (OTP) to <span class="font-bold">{{ email }}</span> <a (click)="step.set('details')" class="text-xs text-primary hover:underline cursor-pointer">(Change)</a>
            </p>

            <form (ngSubmit)="onVerifyAndRegister()" class="space-y-4">
                <div class="space-y-1">
                    <label for="otp" class="block text-xs font-bold text-[#222222]">Enter OTP</label>
                    <input id="otp" name="otp" type="text" [(ngModel)]="otp" required maxlength="6"
                        class="w-full border border-neutral-400 rounded-[3px] px-2 py-1.5 text-lg font-bold tracking-widest text-center focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all">
                </div>

                <div *ngIf="error()" class="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm">
                    {{ error() }}
                </div>

                <div class="pt-2">
                    <button type="submit" [disabled]="loading()" class="w-full btn-primary py-1.5 rounded-[3px] text-xs font-normal">
                        {{ loading() ? 'Verifying...' : 'Create your Chommie account' }}
                    </button>
                </div>

                <div class="text-center">
                    <button type="button" (click)="onRegisterInit()" [disabled]="otpTimer() > 0" class="text-xs text-primary hover:underline font-bold disabled:text-neutral-400 disabled:no-underline">
                        {{ otpTimer() > 0 ? 'Resend OTP in ' + formatTime(otpTimer()) : 'Resend OTP' }}
                    </button>
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
export class RegisterComponent {
  public ts = inject(TranslationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  step = signal<'details' | 'otp'>('details');
  firstName = '';
  email = '';
  password = '';
  otp = '';
  loading = signal(false);
  error = signal('');
  
  otpTimer = signal(300); // 5 minutes in seconds
  timerInterval: any;

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  startTimer() {
    this.otpTimer.set(300);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.otpTimer.update(t => t > 0 ? t - 1 : 0);
      if (this.otpTimer() === 0) clearInterval(this.timerInterval);
    }, 1000);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  onRegisterInit() {
    if (!this.email || !this.password || !this.firstName) {
        this.error.set('Please fill in all fields');
        return;
    }
    this.loading.set(true);
    this.error.set('');
    
    this.authService.requestEmailVerification(this.email).subscribe({
        next: (res: any) => {
            this.loading.set(false);
            this.step.set('otp');
            this.startTimer();
        },
        error: (err: any) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Failed to initiate registration');
        }
    });
  }

  onVerifyAndRegister() {
    if (!this.otp) return;
    this.loading.set(true);
    this.error.set('');

    const userData = {
        firstName: this.firstName,
        email: this.email,
        password: this.password,
        role: 'CUSTOMER',
        otp: this.otp
    };

    this.authService.register(userData).subscribe({
      next: (res: any) => {
        if (res.accessToken) {
            localStorage.setItem('access_token', res.accessToken);
            localStorage.setItem('user_id', res.user.id);
            this.authService.currentUser.set({ id: res.user.id, token: res.accessToken });
            this.router.navigate(['/']);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Verification failed');
      }
    });
  }
}
