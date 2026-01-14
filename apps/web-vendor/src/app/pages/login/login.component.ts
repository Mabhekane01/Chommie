import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-main py-12 px-6 relative overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full"></div>

      <!-- Logo -->
      <div class="mb-12 animate-slide-up relative z-10 text-center">
        <span class="font-header font-black text-4xl tracking-tighter text-white uppercase">
          Chommie<span class="text-accent text-neon">.nexus</span>
        </span>
        <p class="text-[9px] font-black text-neutral-silver/20 uppercase tracking-[0.4em] mt-2">Provisioner Console</p>
      </div>

      <!-- Access Card -->
      <div class="w-full max-w-[450px] glass-panel p-10 md:p-12 rounded-[3rem] shadow-2xl relative z-10 border-white/10 animate-scale-up">
        <h1 class="text-3xl font-header font-black text-white mb-4 tracking-tight uppercase">Nexus <span class="text-cyber-teal">Access</span></h1>
        <p class="text-neutral-silver/40 text-[10px] font-black uppercase tracking-widest mb-10 leading-relaxed">
            Initialize provisioner synchronization.
        </p>

        <form (ngSubmit)="onSubmit()" class="space-y-8">
          <div class="space-y-6">
            <div class="space-y-2">
              <label for="email" class="block text-xs font-black uppercase tracking-widest text-neutral-silver/40 ml-1">Identity Marker</label>
              <div class="relative group">
                 <div class="absolute -inset-0.5 bg-gradient-to-r from-cyber-teal to-accent rounded-xl opacity-0 group-focus-within:opacity-100 blur transition duration-300"></div>
                 <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    [(ngModel)]="email" 
                    required
                    placeholder="provisioner@nexus.com"
                    class="relative block w-full bg-deep-ocean rounded-xl border border-white/10 px-4 py-4 text-sm text-white focus:outline-none transition-all"
                 >
              </div>
            </div>

            <div class="space-y-2">
              <label for="password" class="block text-xs font-black uppercase tracking-widest text-neutral-silver/40 ml-1">Secret Key</label>
              <div class="relative group">
                 <div class="absolute -inset-0.5 bg-gradient-to-r from-accent to-primary rounded-xl opacity-0 group-focus-within:opacity-100 blur transition duration-300"></div>
                 <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    [(ngModel)]="password" 
                    required
                    placeholder="••••••••"
                    class="relative block w-full bg-deep-ocean rounded-xl border border-white/10 px-4 py-4 text-sm text-white focus:outline-none transition-all font-mono"
                 >
              </div>
            </div>
          </div>

          <div *ngIf="error()" class="flex items-center gap-3 p-4 text-[10px] font-black uppercase tracking-widest text-accent bg-accent/5 border border-accent/20 rounded-xl">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {{ error() }}
          </div>

          <div class="pt-4">
            <button 
              type="submit" 
              [disabled]="loading()"
              class="w-full btn-primary py-5 rounded-2xl text-[10px] font-black tracking-[0.2em] shadow-[0_15px_30px_rgba(107,45,158,0.4)]"
            >
              {{ loading() ? 'AUTHENTICATING...' : 'INITIALIZE SYNC' }}
            </button>
          </div>
        </form>

        <div class="mt-10 pt-8 border-t border-white/5 text-center">
             <span class="text-[10px] font-black uppercase tracking-widest text-neutral-silver/20 block mb-4">Unregistered Node?</span>
             <a href="#" class="text-sm font-bold text-cyber-teal hover:text-white transition-colors">
                Apply for Provisioner Access ->
             </a>
        </div>

      </div>

      <div class="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-center text-neutral-silver/20 space-y-4 relative z-10">
        <div class="flex gap-8 justify-center">
            <a href="#" class="hover:text-white transition-colors">Nexus Protocol</a>
            <a href="#" class="hover:text-white transition-colors">Digital Shield</a>
        </div>
        <p>&copy; 2026 CHOMMIE NEXUS. v4.0.0-PROVISIONER</p>
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
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid credentials');
      }
    });
  }
}
