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
    <div class="min-h-screen flex flex-col items-center bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#0F1111]">
      
      <div class="mb-4">
        <h1 class="text-3xl font-bold tracking-tight text-[#0F1111]">Chommie</h1>
      </div>

      <div class="w-full max-w-[350px] border border-[#D5D9D9] rounded-lg p-6 bg-white shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
        <h1 class="text-3xl font-normal mb-4">Create new password</h1>
        <p class="text-sm text-[#565959] mb-4">
            We'll ask for this password whenever you sign in.
        </p>

        <form *ngIf="!success()" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-bold text-[#0F1111] mb-1">New password</label>
            <input 
                id="password" 
                name="password" 
                type="password" 
                [(ngModel)]="password" 
                required
                minlength="6"
                placeholder="At least 6 characters"
                class="block w-full rounded-[3px] border-[#a6a6a6] border px-2 py-1 text-sm shadow-[0_1px_0_rgba(255,255,255,0.5),0_1px_0_rgba(0,0,0,0.07)_inset] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none transition-all"
            >
             <p class="text-xs text-[#565959] mt-1">Passwords must be at least 6 characters.</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-bold text-[#0F1111] mb-1">Re-enter password</label>
            <input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                [(ngModel)]="confirmPassword" 
                required
                class="block w-full rounded-[3px] border-[#a6a6a6] border px-2 py-1 text-sm shadow-[0_1px_0_rgba(255,255,255,0.5),0_1px_0_rgba(0,0,0,0.07)_inset] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none transition-all"
            >
          </div>

          <div *ngIf="error()" class="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-300 rounded-[3px]">
             {{ error() }}
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full bg-[#F0C14B] hover:bg-[#F4D078] border border-[#a88734] rounded-[3px] py-[6px] text-sm shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] focus:ring-2 focus:ring-[#e77600] focus:outline-none transition-all"
          >
            {{ loading() ? 'Saving changes...' : 'Save changes and sign in' }}
          </button>
        </form>

        <div *ngIf="success()" class="text-center">
            <div class="text-green-600 mb-4 text-lg font-bold">Success!</div>
            <p class="text-sm mb-4">Your password has been changed.</p>
            <a routerLink="/login" class="inline-block bg-[#F0C14B] hover:bg-[#F4D078] border border-[#a88734] rounded-[3px] py-[6px] px-4 text-sm shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] text-[#0F1111]">
                Sign In
            </a>
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
