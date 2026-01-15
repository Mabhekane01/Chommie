import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'app-vendor-security',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32" [ngClass]="deviceService.isMobile() ? 'pt-2' : 'pt-10'">
      <div class="w-full animate-fade-in font-body" [ngClass]="deviceService.isMobile() ? 'px-4' : 'px-10'">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-8">
          <a routerLink="/dashboard" class="hover:text-primary transition-colors">Central Dashboard</a>
          <span>›</span>
          <span class="text-neutral-800">Security Manifest</span>
        </nav>

        <div class="mb-8">
           <h1 class="font-normal text-neutral-charcoal" [ngClass]="deviceService.isMobile() ? 'text-xl font-bold' : 'text-3xl'">Login & Security</h1>
           <p class="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Sovereign Identity Manifest</p>
        </div>

        <div class="bg-white border border-neutral-300 rounded-lg overflow-hidden shadow-sm">
            
            <!-- Vendor Name -->
            <div class="p-6 border-b border-neutral-200 flex justify-between items-start">
                <div class="space-y-1 flex-grow">
                    <h2 class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Legal Entity Name</h2>
                    <div class="text-sm text-neutral-800 font-black uppercase tracking-tight">{{ user()?.firstName }} {{ user()?.lastName }}</div>
                </div>
                <button class="btn-secondary py-1.5 px-4 text-[10px] rounded font-black uppercase tracking-widest opacity-50 cursor-not-allowed">Edit</button>
            </div>

            <!-- Email -->
            <div class="p-6 border-b border-neutral-200 flex justify-between items-start bg-neutral-50/30">
                <div class="space-y-1">
                    <h2 class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Primary Contact Email</h2>
                    <div class="text-sm text-neutral-800 font-bold tracking-tight">{{ user()?.email }}</div>
                </div>
                <button class="btn-secondary py-1.5 px-4 text-[10px] rounded font-black uppercase tracking-widest opacity-50 cursor-not-allowed">Edit</button>
            </div>

            <!-- Password -->
            <div class="p-6 border-b border-neutral-200 flex justify-between items-start">
                <div class="space-y-1 flex-grow">
                    <h2 class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Security Credentials</h2>
                    <div class="text-sm text-neutral-800 font-medium">********</div>
                </div>
                <button class="btn-secondary py-1.5 px-4 text-[10px] rounded font-black uppercase tracking-widest">Modify</button>
            </div>

            <!-- 2FA Node -->
            <div class="p-6 bg-[#131921] text-white">
                <div class="flex justify-between items-start">
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                           <div class="w-2 h-2 rounded-full shadow-sm shadow-emerald-500/50" [ngClass]="user()?.isTwoFactorEnabled ? 'bg-emerald-500' : 'bg-red-500'"></div>
                           <h2 class="text-xs font-black uppercase tracking-[0.2em] text-white/60">Two-Step Verification Protocol</h2>
                        </div>
                        <p class="text-xs font-medium text-white/40 max-w-xl leading-relaxed uppercase tracking-tight">
                            Secure your seller portal by requiring a unique 6-digit OTP code transmitted via email upon every access initialization.
                        </p>
                    </div>
                    <button (click)="toggle2FA()" [disabled]="toggling()" 
                            class="py-2 px-8 text-[10px] rounded-xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
                            [ngClass]="user()?.isTwoFactorEnabled ? 'bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white' : 'bg-primary text-white shadow-primary/20'">
                        {{ toggling() ? 'Syncing...' : (user()?.isTwoFactorEnabled ? 'Disable Protocol' : 'Initialize 2FA') }}
                    </button>
                </div>
            </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SecurityComponent implements OnInit {
  public deviceService = inject(DeviceService);
  private authService = inject(AuthService);

  user = signal<any | null>(null);
  userId = localStorage.getItem('user_id') || '';
  toggling = signal(false);

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile(this.userId).subscribe((data: any) => {
        this.user.set(data);
    });
  }

  toggle2FA() {
    if (!this.user()) return;
    const nextState = !this.user().isTwoFactorEnabled;
    const confirmMsg = nextState 
        ? 'Enable Two-Step Verification for extra seller security?' 
        : 'DISABLE 2FA? Your vendor account will be significantly less secure.';
    
    if (confirm(confirmMsg)) {
        this.toggling.set(true);
        this.authService.toggle2FA(this.userId, nextState).subscribe({
            next: (res: any) => {
                this.user.update(u => ({ ...u, isTwoFactorEnabled: res.isTwoFactorEnabled }));
                this.toggling.set(false);
                alert(`Security Protocol ${res.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}.`);
            },
            error: () => {
                this.toggling.set(false);
                alert('Failed to update security parameters.');
            }
        });
    }
  }
}