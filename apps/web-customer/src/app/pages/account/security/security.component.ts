import { Component, OnInit, signal } from '@angular/core';
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
      <div class="w-full px-6 animate-fade-in">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <a routerLink="/account" class="hover:underline hover:text-primary">Your Account</a>
          <span>›</span>
          <span class="text-primary font-bold">Login & Security</span>
        </nav>

        <div class="mb-8">
           <h1 class="text-3xl font-normal text-neutral-charcoal">Login & Security</h1>
        </div>

        <div class="border border-neutral-300 rounded-lg overflow-hidden">
            
            <!-- Name -->
            <div class="p-6 border-b border-neutral-200 flex justify-between items-start">
                <div class="space-y-1 flex-grow" *ngIf="!editMode.name">
                    <h2 class="text-sm font-bold text-neutral-800">Name</h2>
                    <div class="text-sm text-neutral-600">{{ user()?.firstName }} {{ user()?.lastName }}</div>
                </div>
                <div *ngIf="!editMode.name">
                    <button (click)="editMode.name = true" class="btn-secondary py-1 px-4 text-sm rounded shadow-sm border border-neutral-300">Edit</button>
                </div>

                <!-- Edit Form -->
                <div class="w-full space-y-4" *ngIf="editMode.name">
                    <h2 class="text-lg font-bold text-neutral-800">Change your name</h2>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-bold text-neutral-700">First Name</label>
                            <input type="text" [(ngModel)]="editData.firstName" class="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm focus:ring-primary focus:border-primary outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-neutral-700">Last Name</label>
                            <input type="text" [(ngModel)]="editData.lastName" class="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm focus:ring-primary focus:border-primary outline-none">
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button (click)="saveName()" class="btn-primary py-1.5 px-4 text-sm rounded shadow-sm">Save changes</button>
                        <button (click)="editMode.name = false" class="btn-secondary py-1.5 px-4 text-sm rounded shadow-sm border border-neutral-300">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- Email -->
            <div class="p-6 border-b border-neutral-200 flex justify-between items-start bg-neutral-50">
                <div class="space-y-1">
                    <h2 class="text-sm font-bold text-neutral-800">Email</h2>
                    <div class="text-sm text-neutral-600">{{ user()?.email }}</div>
                </div>
                <div>
                    <button class="btn-secondary py-1 px-4 text-sm rounded shadow-sm border border-neutral-300 bg-white" disabled>Edit</button>
                </div>
            </div>

            <!-- Password -->
            <div class="p-6 flex justify-between items-start">
                <div class="space-y-1 flex-grow" *ngIf="!editMode.password">
                    <h2 class="text-sm font-bold text-neutral-800">Password</h2>
                    <div class="text-sm text-neutral-600">********</div>
                </div>
                <div *ngIf="!editMode.password">
                    <button (click)="editMode.password = true" class="btn-secondary py-1 px-4 text-sm rounded shadow-sm border border-neutral-300">Edit</button>
                </div>

                <!-- Edit Form -->
                <div class="w-full space-y-4" *ngIf="editMode.password">
                    <h2 class="text-lg font-bold text-neutral-800">Change Password</h2>
                    <div class="space-y-3 max-w-md">
                        <div>
                            <label class="block text-sm font-bold text-neutral-700">Current password</label>
                            <input type="password" [(ngModel)]="passwordData.current" class="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm focus:ring-primary focus:border-primary outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-neutral-700">New password</label>
                            <input type="password" [(ngModel)]="passwordData.new" class="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm focus:ring-primary focus:border-primary outline-none">
                            <p class="text-xs text-neutral-500 mt-1">Passwords must be at least 6 characters.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-neutral-700">Re-enter new password</label>
                            <input type="password" [(ngModel)]="passwordData.confirm" class="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm focus:ring-primary focus:border-primary outline-none">
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button (click)="savePassword()" class="btn-primary py-1.5 px-4 text-sm rounded shadow-sm">Save changes</button>
                        <button (click)="editMode.password = false" class="btn-secondary py-1.5 px-4 text-sm rounded shadow-sm border border-neutral-300">Cancel</button>
                    </div>
                </div>
            </div>

        </div>

        <div class="mt-8 p-4 bg-neutral-50 border border-neutral-200 rounded-md text-sm text-neutral-600">
           <span class="font-bold">Secure your account:</span> Two-Step Verification is currently <span class="font-bold text-red-600">disabled</span>. 
           <a href="#" class="text-primary hover:underline ml-1">Enable Two-Step Verification</a>
        </div>
      </div>
    </div>
  `
})
export class SecurityComponent implements OnInit {
  user = signal<any | null>(null);
  userId = localStorage.getItem('user_id') || '';
  
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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getProfile(this.userId).subscribe(data => {
        this.user.set(data);
        this.editData.firstName = data.firstName;
        this.editData.lastName = data.lastName;
    });
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