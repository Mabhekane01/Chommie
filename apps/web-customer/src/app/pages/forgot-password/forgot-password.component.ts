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
    <div class="min-h-screen flex flex-col items-center bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#0F1111]">
      
      <div class="mb-4">
        <h1 class="text-3xl font-bold tracking-tight text-[#0F1111]">Chommie</h1>
      </div>

      <div class="w-full max-w-[350px] border border-[#D5D9D9] rounded-lg p-6 bg-white shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
        <h1 class="text-3xl font-normal mb-2">Password assistance</h1>
        <p class="text-sm text-[#0F1111] mb-4">
            Enter the email address associated with your Chommie account.
        </p>

        <form *ngIf="!success()" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-bold text-[#0F1111] mb-1">Email</label>
            <input 
                id="email" 
                name="email" 
                type="email" 
                [(ngModel)]="email" 
                required
                class="block w-full rounded-[3px] border-[#a6a6a6] border px-2 py-1 text-sm shadow-[0_1px_0_rgba(255,255,255,0.5),0_1px_0_rgba(0,0,0,0.07)_inset] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none transition-all"
            >
          </div>

          <div *ngIf="error()" class="text-red-600 text-sm">
            {{ error() }}
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full bg-[#F0C14B] hover:bg-[#F4D078] border border-[#a88734] rounded-[3px] py-[6px] text-sm shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] focus:ring-2 focus:ring-[#e77600] focus:outline-none transition-all"
          >
            {{ loading() ? 'Sending...' : 'Continue' }}
          </button>
        </form>

        <div *ngIf="success()" class="bg-green-50 border border-green-200 p-4 rounded text-sm text-green-800">
            <h4 class="font-bold mb-1">Check your email</h4>
            <p>{{ successMessage() }}</p>
        </div>

      </div>
      
      <div class="mt-4 text-sm text-center">
          <p class="text-[#0F1111]">Has your email changed?</p>
          <p class="text-[#0F1111]">If you no longer use the e-mail address associated with your Chommie account, you may contact <a href="#" class="text-[#007185] hover:underline">Customer Service</a> for help restoring access to your account.</p>
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
