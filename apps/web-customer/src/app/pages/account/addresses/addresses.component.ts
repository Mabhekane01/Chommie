import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32 pt-10">
      <div class="w-full px-6 animate-fade-in">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <a routerLink="/account" class="hover:underline hover:text-primary">Your Account</a>
          <span>›</span>
          <span class="text-primary font-bold">Your Addresses</span>
        </nav>

        <div class="mb-8">
           <h1 class="text-3xl font-bold text-neutral-charcoal mb-2">Your Addresses</h1>
           <p class="text-sm text-neutral-600">Manage your shipping destinations.</p>
        </div>

        <!-- Address Grid -->
        <div *ngIf="!showAddForm()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            <!-- Add Address Card -->
            <div (click)="showAddForm.set(true)" class="border-2 border-dashed border-neutral-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 hover:border-neutral-400 transition-all min-h-[260px] group">
                <div class="mb-4 text-neutral-400 group-hover:text-neutral-500">
                   <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <span class="text-lg font-bold text-neutral-500 group-hover:text-neutral-700">Add Address</span>
            </div>

            <!-- Existing Addresses -->
            <div *ngFor="let address of addresses()" class="border border-neutral-300 rounded-lg p-6 flex flex-col justify-between min-h-[260px] relative hover:shadow-sm transition-shadow bg-white">
                <div *ngIf="address.isDefault" class="absolute top-0 left-0 bg-neutral-100 border-b border-r border-neutral-200 text-xs px-3 py-1 rounded-br-lg text-neutral-600 font-bold">
                    Default
                </div>
                
                <div class="space-y-3 pt-6">
                    <div class="font-bold text-base text-neutral-charcoal">{{ address.fullName }}</div>
                    <div class="text-sm text-neutral-600 leading-relaxed">
                       {{ address.street }}<br>
                       {{ address.city }}, {{ address.state }} {{ address.zip }}<br>
                       {{ address.country }}
                    </div>
                    <div class="text-sm text-neutral-600 pt-1">
                       Phone: {{ address.phone }}
                    </div>
                </div>

                <div class="flex gap-4 pt-6 mt-auto text-sm text-primary font-medium">
                    <button class="hover:underline">Edit</button>
                    <span class="text-neutral-300">|</span>
                    <button (click)="removeAddress(address.id)" class="hover:underline">Remove</button>
                    <ng-container *ngIf="!address.isDefault">
                        <span class="text-neutral-300">|</span>
                        <button class="hover:underline">Set as Default</button>
                    </ng-container>
                </div>
            </div>
        </div>

        <!-- Add Address Form -->
        <div *ngIf="showAddForm()" class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-neutral-charcoal mb-6">Add a new address</h2>
            
            <form (ngSubmit)="submitAddress()" class="space-y-6">
                <div class="space-y-1">
                    <label class="block text-sm font-bold text-neutral-700">Country/Region</label>
                    <select [(ngModel)]="newAddress.country" name="country" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 text-sm shadow-inner focus:ring-primary focus:border-primary outline-none">
                        <option value="South Africa">South Africa</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                    </select>
                </div>

                <div class="space-y-1">
                    <label class="block text-sm font-bold text-neutral-700">Full name (First and Last name)</label>
                    <input type="text" [(ngModel)]="newAddress.fullName" name="fullName" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" required>
                </div>

                <div class="space-y-1">
                    <label class="block text-sm font-bold text-neutral-700">Phone number</label>
                    <input type="text" [(ngModel)]="newAddress.phone" name="phone" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" required>
                    <p class="text-xs text-neutral-500">May be used to assist delivery</p>
                </div>

                <div class="space-y-1">
                    <label class="block text-sm font-bold text-neutral-700">Address</label>
                    <input type="text" [(ngModel)]="newAddress.street" name="street" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none mb-2" placeholder="Street address, P.O. box, company name, c/o" required>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-sm font-bold text-neutral-700">City</label>
                        <input type="text" [(ngModel)]="newAddress.city" name="city" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" required>
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-bold text-neutral-700">Province</label>
                        <input type="text" [(ngModel)]="newAddress.state" name="state" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" required>
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block text-sm font-bold text-neutral-700">Postal Code</label>
                    <input type="text" [(ngModel)]="newAddress.zip" name="zip" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" required>
                </div>

                <div class="flex items-center gap-2 mt-4">
                    <input type="checkbox" [(ngModel)]="newAddress.isDefault" name="isDefault" class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary">
                    <label class="text-sm text-neutral-700">Make this my default address</label>
                </div>

                <div class="pt-6 flex items-center gap-4">
                    <button type="submit" [disabled]="submitting()" class="btn-primary text-sm py-2 px-6 rounded-md shadow-sm">
                        {{ submitting() ? 'Saving...' : 'Add address' }}
                    </button>
                    <button type="button" (click)="showAddForm.set(false)" class="text-sm text-neutral-600 hover:underline">Cancel</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  `
})
export class AddressesComponent implements OnInit {
  addresses = signal<any[]>([]);
  showAddForm = signal(false);
  submitting = signal(false);
  
  newAddress = {
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'South Africa',
    phone: '',
    isDefault: false
  };

  userId = localStorage.getItem('user_id');

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    if (this.userId) {
      this.authService.getProfile(this.userId).subscribe(profile => {
        if (profile && profile.addresses) {
            this.addresses.set(profile.addresses);
        }
      });
    }
  }

  submitAddress() {
    if (!this.userId) return;
    this.submitting.set(true);

    this.authService.addAddress(this.userId, this.newAddress).subscribe({
        next: (res) => {
            this.submitting.set(false);
            this.showAddForm.set(false);
            this.newAddress = {
                fullName: '',
                street: '',
                city: '',
                state: '',
                zip: '',
                country: 'South Africa',
                phone: '',
                isDefault: false
            };
            this.loadAddresses();
        },
        error: (err) => {
            this.submitting.set(false);
            alert('Failed to add address');
        }
    });
  }

  removeAddress(addressId: string) {
    if (!this.userId || !confirm('Are you sure you want to remove this address?')) return;

    this.authService.removeAddress(this.userId, addressId).subscribe({
        next: () => this.loadAddresses(),
        error: () => alert('Failed to remove address')
    });
  }
}