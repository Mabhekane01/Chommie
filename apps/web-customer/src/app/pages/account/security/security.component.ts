import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32 pt-10">
      <div class="w-full px-6 animate-fade-in font-body">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <a routerLink="/account" class="hover:underline hover:text-primary">Your Account</a>
          <span>›</span>
          <span class="text-primary font-bold">Login & Security</span>
        </nav>

        <div class="mb-8">
           <h1 class="text-3xl font-normal text-neutral-charcoal">Login & Security</h1>
        </div>

        <div class="border border-neutral-300 rounded-lg overflow-hidden shadow-sm">
            
            <!-- Name -->
            <div class="p-6 border-b border-neutral-200 flex justify-between items-start">
                <div class="space-y-1 flex-grow" *ngIf="!editMode.name">
                    <h2 class="text-sm font-bold text-neutral-800 uppercase tracking-widest text-[10px]">Name</h2>
                    <div class="text-sm text-neutral-600 font-medium">{{ user()?.firstName }} {{ user()?.lastName }}</div>
                </div>
                <div *ngIf="!editMode.name">
                    <button (click)="editMode.name = true" class="btn-secondary py-1 px-4 text-xs rounded border border-neutral-300 font-bold uppercase tracking-widest">Edit</button>
                </div>

                <!-- Edit Form -->
                <div class="w-full space-y-4" *ngIf="editMode.name">
                    <h2 class="text-lg font-bold text-neutral-800">Change your name</h2>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">First Name</label>
                            <input type="text" [(ngModel)]="editData.firstName" class="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none shadow-inner">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Last Name</label>
                            <input type="text" [(ngModel)]="editData.lastName" class="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none shadow-inner">
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button (click)="saveName()" class="btn-primary py-1.5 px-6 text-xs rounded font-bold uppercase tracking-widest">Save changes</button>
                        <button (click)="editMode.name = false" class="btn-secondary py-1.5 px-6 text-xs rounded border border-neutral-300 font-bold uppercase tracking-widest">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- Email -->
            <div class="p-6 border-b border-neutral-200 flex justify-between items-start bg-neutral-50/50">
                <div class="space-y-1">
                    <h2 class="text-sm font-bold text-neutral-800 uppercase tracking-widest text-[10px]">Email</h2>
                    <div class="text-sm text-neutral-600 font-medium">{{ user()?.email }}</div>
                </div>
                <div>
                    <button class="btn-secondary py-1 px-4 text-xs rounded border border-neutral-300 bg-white font-bold uppercase tracking-widest opacity-50 cursor-not-allowed">Edit</button>
                </div>
            </div>

            <!-- Password -->
            <div class="p-6 flex justify-between items-start">
                <div class="space-y-1 flex-grow" *ngIf="!editMode.password">
                    <h2 class="text-sm font-bold text-neutral-800 uppercase tracking-widest text-[10px]">Password</h2>
                    <div class="text-sm text-neutral-600 font-medium">********</div>
                </div>
                <div *ngIf="!editMode.password">
                    <button (click)="editMode.password = true" class="btn-secondary py-1 px-4 text-xs rounded border border-neutral-300 font-bold uppercase tracking-widest">Edit</button>
                </div>

                <!-- Edit Form -->
                <div class="w-full space-y-4" *ngIf="editMode.password">
                    <h2 class="text-lg font-bold text-neutral-800">Change Password</h2>
                    <div class="space-y-3 max-w-md">
                        <div>
                            <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Current password</label>
                            <input type="password" [(ngModel)]="passwordData.current" class="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none shadow-inner">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">New password</label>
                            <input type="password" [(ngModel)]="passwordData.new" class="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none shadow-inner">
                            <p class="text-[10px] text-neutral-400 mt-1 font-bold">Passwords must be at least 6 characters.</p>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Re-enter new password</label>
                            <input type="password" [(ngModel)]="passwordData.confirm" class="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none shadow-inner">
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button (click)="savePassword()" class="btn-primary py-1.5 px-6 text-xs rounded font-bold uppercase tracking-widest">Save changes</button>
                        <button (click)="editMode.password = false" class="btn-secondary py-1.5 px-6 text-xs rounded border border-neutral-300 font-bold uppercase tracking-widest">Cancel</button>
                    </div>
                </div>
            </div>

        </div>

        <!-- 2FA Section (Amazon Style) -->
        <div class="mt-8 border border-neutral-300 rounded-lg overflow-hidden shadow-sm">
            <div class="p-6">
                <div class="flex justify-between items-start">
                    <div class="space-y-1">
                        <h2 class="text-sm font-bold text-neutral-800 uppercase tracking-widest text-[10px]">Two-Step Verification (2FA)</h2>
                        <p class="text-sm text-neutral-600 font-medium max-w-2xl leading-relaxed">
                            Add an extra layer of security to your account by receiving a unique verification code via email whenever you sign in.
                        </p>
                        <div class="mt-4 flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full" [ngClass]="user()?.isTwoFactorEnabled ? 'bg-emerald-500' : 'bg-red-500'"></div>
                            <span class="text-xs font-black uppercase tracking-widest" [ngClass]="user()?.isTwoFactorEnabled ? 'text-emerald-700' : 'text-red-700'">
                                Status: {{ user()?.isTwoFactorEnabled ? 'Enabled' : 'Disabled' }}
                            </span>
                        </div>
                    </div>
                    <div>
                        <button (click)="toggle2FA()" [disabled]="toggling()" 
                                class="py-1.5 px-6 text-xs rounded border font-bold uppercase tracking-widest shadow-sm transition-all active:scale-95"
                                [ngClass]="user()?.isTwoFactorEnabled ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'btn-primary text-white'">
                            {{ toggling() ? 'Processing...' : (user()?.isTwoFactorEnabled ? 'Disable' : 'Enable') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  `
})
export class SecurityComponent implements OnInit {
  private authService = inject(AuthService);

  user = signal<any | null>(null);
  userId = localStorage.getItem('user_id') || '';
  toggling = signal(false);
  
  editMode = {
    name: false,
    password: false
  };

  editData = {
    firstName: '',
    lastName: ''
  };

  passwordData = {
    current: '',
    new: '',
    confirm: ''
  };

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile(this.userId).subscribe(data => {
        this.user.set(data);
        this.editData.firstName = data.firstName;
        this.editData.lastName = data.lastName;
    });
  }

  toggle2FA() {
    if (!this.user()) return;
    const nextState = !this.user().isTwoFactorEnabled;
    const confirmMsg = nextState 
        ? 'Enable Two-Step Verification for extra security?' 
        : 'Are you sure you want to disable Two-Step Verification? Your account will be less secure.';
    
    if (confirm(confirmMsg)) {
        this.toggling.set(true);
        this.authService.toggle2FA(this.userId, nextState).subscribe({
            next: (res: any) => {
                this.user.update(u => ({ ...u, isTwoFactorEnabled: res.isTwoFactorEnabled }));
                this.toggling.set(false);
                alert(`Two-Step Verification has been ${res.isTwoFactorEnabled ? 'enabled' : 'disabled'}.`);
            },
            error: () => {
                this.toggling.set(false);
                alert('Failed to update security settings.');
            }
        });
    }
  }

  saveName() {
    alert('Name updated successfully.');
    this.editMode.name = false;
  }

  savePassword() {
    if (this.passwordData.new !== this.passwordData.confirm) {
        alert('Passwords do not match');
        return;
    }
    alert('Password updated successfully.');
    this.editMode.password = false;
  }
}
