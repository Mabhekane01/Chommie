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
    <div class="bg-white min-h-screen pb-12">
      <div class="container mx-auto px-4 py-8 max-w-[600px]">
        
        <!-- Breadcrumb -->
        <div class="text-sm text-gray-500 mb-6">
            <a routerLink="/account" class="hover:underline hover:text-action">Your Account</a> › <span class="text-[#C45500]">Login & Security</span>
        </div>

        <h1 class="text-3xl font-normal text-[#111111] mb-6">Login & Security</h1>

        <div class="border border-gray-300 rounded-lg overflow-hidden">
            
            <!-- Name -->
            <div class="p-5 border-b border-gray-200 flex justify-between items-center" *ngIf="!editMode.name">
                <div>
                    <div class="font-bold text-sm">Name</div>
                    <div class="text-sm text-gray-600">{{ user()?.firstName }} {{ user()?.lastName }}</div>
                </div>
                <button (click)="editMode.name = true" class="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1 rounded-[20px] text-sm shadow-sm">Edit</button>
            </div>
            
            <!-- Name Edit Form -->
            <div class="p-5 border-b border-gray-200 bg-gray-50" *ngIf="editMode.name">
                <h3 class="font-bold text-lg mb-4">Change your name</h3>
                <div class="mb-4">
                    <label class="block text-xs font-bold mb-1">First Name</label>
                    <input type="text" [(ngModel)]="editData.firstName" class="w-full border border-gray-400 rounded px-2 py-1 text-sm">
                </div>
                <div class="mb-4">
                    <label class="block text-xs font-bold mb-1">Last Name</label>
                    <input type="text" [(ngModel)]="editData.lastName" class="w-full border border-gray-400 rounded px-2 py-1 text-sm">
                </div>
                <div class="flex gap-2">
                    <button (click)="saveName()" class="bg-[#F0C14B] border border-[#a88734] px-4 py-1 rounded-[3px] text-sm shadow-sm hover:bg-[#F4D078]">Save changes</button>
                    <button (click)="editMode.name = false" class="bg-white border border-gray-300 px-4 py-1 rounded-[3px] text-sm shadow-sm hover:bg-gray-50">Cancel</button>
                </div>
            </div>

            <!-- Email -->
            <div class="p-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <div class="font-bold text-sm">Email</div>
                    <div class="text-sm text-gray-600">{{ user()?.email }}</div>
                </div>
                <button class="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1 rounded-[20px] text-sm shadow-sm cursor-not-allowed opacity-50">Edit</button>
            </div>

            <!-- Password -->
            <div class="p-5 flex justify-between items-center" *ngIf="!editMode.password">
                <div>
                    <div class="font-bold text-sm">Password</div>
                    <div class="text-sm text-gray-600">********</div>
                </div>
                <button (click)="editMode.password = true" class="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1 rounded-[20px] text-sm shadow-sm">Edit</button>
            </div>

            <!-- Password Edit Form -->
            <div class="p-5 bg-gray-50" *ngIf="editMode.password">
                <h3 class="font-bold text-lg mb-4">Change password</h3>
                <div class="mb-4">
                    <label class="block text-xs font-bold mb-1">Current Password</label>
                    <input type="password" [(ngModel)]="passwordData.current" class="w-full border border-gray-400 rounded px-2 py-1 text-sm">
                </div>
                <div class="mb-4">
                    <label class="block text-xs font-bold mb-1">New Password</label>
                    <input type="password" [(ngModel)]="passwordData.new" class="w-full border border-gray-400 rounded px-2 py-1 text-sm">
                    <p class="text-xs text-gray-500 mt-1">Passwords must be at least 6 characters long.</p>
                </div>
                <div class="mb-4">
                    <label class="block text-xs font-bold mb-1">Re-enter New Password</label>
                    <input type="password" [(ngModel)]="passwordData.confirm" class="w-full border border-gray-400 rounded px-2 py-1 text-sm">
                </div>
                <div class="flex gap-2">
                    <button (click)="savePassword()" class="bg-[#F0C14B] border border-[#a88734] px-4 py-1 rounded-[3px] text-sm shadow-sm hover:bg-[#F4D078]">Save changes</button>
                    <button (click)="editMode.password = false" class="bg-white border border-gray-300 px-4 py-1 rounded-[3px] text-sm shadow-sm hover:bg-gray-50">Cancel</button>
                </div>
            </div>

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
    // We need to implement updateProfile endpoint in backend
    // For MVP, alerting.
    alert('Feature coming soon: Update Profile');
    this.editMode.name = false;
  }

  savePassword() {
    if (this.passwordData.new !== this.passwordData.confirm) {
        alert('Passwords do not match');
        return;
    }
    // Implement updatePassword endpoint
    alert('Feature coming soon: Update Password');
    this.editMode.password = false;
  }
}
