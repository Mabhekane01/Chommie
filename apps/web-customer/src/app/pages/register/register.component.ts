import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#0F1111]">
      
      <!-- Logo -->
      <div class="mb-4">
        <h1 class="text-3xl font-bold tracking-tight text-primary" routerLink="/">Chommie</h1>
      </div>

      <!-- Auth Card -->
      <div class="w-full max-w-[350px] border border-[#D5D9D9] rounded-lg p-6 bg-white shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
        <h1 class="text-3xl font-normal mb-4">Create account</h1>

        <form (ngSubmit)="onSubmit()" class="space-y-3">
          
          <div>
            <label for="first-name" class="block text-sm font-bold text-[#0F1111] mb-1">Your name</label>
            <input 
                id="first-name" 
                name="firstName" 
                type="text" 
                [(ngModel)]="firstName" 
                required
                placeholder="First and last name"
                class="block w-full rounded-[3px] border-[#a6a6a6] border px-2 py-1 text-sm shadow-[0_1px_0_rgba(255,255,255,0.5),0_1px_0_rgba(0,0,0,0.07)_inset] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none transition-all"
            >
          </div>

          <div>
            <label for="email" class="block text-sm font-bold text-[#0F1111] mb-1">Mobile number or email</label>
            <input 
                id="email" 
                name="email" 
                type="email" 
                [(ngModel)]="email" 
                required
                class="block w-full rounded-[3px] border-[#a6a6a6] border px-2 py-1 text-sm shadow-[0_1px_0_rgba(255,255,255,0.5),0_1px_0_rgba(0,0,0,0.07)_inset] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none transition-all"
            >
          </div>

          <div>
            <label for="password" class="block text-sm font-bold text-[#0F1111] mb-1">Password</label>
            <input 
                id="password" 
                name="password" 
                type="password" 
                [(ngModel)]="password" 
                required
                placeholder="At least 6 characters"
                class="block w-full rounded-[3px] border-[#a6a6a6] border px-2 py-1 text-sm shadow-[0_1px_0_rgba(255,255,255,0.5),0_1px_0_rgba(0,0,0,0.07)_inset] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none transition-all"
            >
            <div class="flex items-center gap-1 mt-1">
                <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                <span class="text-[11px] text-gray-600">Passwords must be at least 6 characters.</span>
            </div>
          </div>

          <div *ngIf="error()" class="text-red-600 text-sm py-2">
            {{ error() }}
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full bg-[#F0C14B] hover:bg-[#F4D078] border border-[#a88734] rounded-[3px] py-[6px] text-sm shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] focus:ring-2 focus:ring-[#e77600] focus:outline-none transition-all mt-4"
          >
            {{ loading() ? 'Creating account...' : 'Continue' }}
          </button>

        </form>

        <p class="mt-6 text-xs text-[#565959]">
            By creating an account, you agree to Chommie's <a href="#" class="text-[#007185] hover:text-[#C7511F] hover:underline">Conditions of Use</a> and <a href="#" class="text-[#007185] hover:text-[#C7511F] hover:underline">Privacy Notice</a>.
        </p>

        <hr class="my-6 border-[#D5D9D9]">

        <div class="text-sm">
             <span class="text-[#0F1111]">Already have an account? </span>
             <a routerLink="/login" class="text-[#007185] hover:text-[#C7511F] hover:underline">Sign in</a>
        </div>

      </div>

      <!-- Footer Links -->
      <div class="mt-8 text-xs text-center text-[#565959] space-y-2">
        <div class="space-x-4">
            <a href="#" class="text-[#007185] hover:underline">Conditions of Use</a>
            <a href="#" class="text-[#007185] hover:underline">Privacy Notice</a>
            <a href="#" class="text-[#007185] hover:underline">Help</a>
        </div>
        <p>&copy; 2024-2026, Chommie, Inc. or its affiliates</p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    
    const user = {
      firstName: this.firstName,
      lastName: this.lastName || ' ', 
      email: this.email,
      password: this.password
    };

    this.authService.register(user).subscribe({
      next: (res) => {
        if (res.accessToken) {
            localStorage.setItem('access_token', res.accessToken);
            localStorage.setItem('user_id', res.user.id);
            this.authService.currentUser.set({ id: res.user.id, token: res.accessToken });
            this.router.navigate(['/']);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed');
      }
    });
  }
}
