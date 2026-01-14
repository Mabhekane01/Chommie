import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vendor-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      <!-- Standard Vendor Nav -->
      <nav class="bg-white border-b border-neutral-300 px-8 py-3 flex justify-between items-center sticky top-0 z-50">
          <div class="flex items-center gap-8">
              <a routerLink="/" class="font-header font-bold text-2xl tracking-tight text-neutral-charcoal flex items-center gap-1">
                Chommie<span class="text-primary">.central</span>
              </a>
              <div class="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
                  <a routerLink="/dashboard" class="hover:text-primary transition-colors">Dashboard</a>
                  <a routerLink="/products" class="hover:text-primary transition-colors">Catalog</a>
                  <a href="#" class="hover:text-primary transition-colors text-primary font-bold">Advertising</a>
              </div>
          </div>
      </nav>

      <div class="p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
        
        <div class="flex justify-between items-center">
           <div>
               <h1 class="text-3xl font-header font-bold text-neutral-charcoal">Promotions & Coupons</h1>
               <p class="text-sm text-neutral-500 mt-1">Create deals to increase visibility and sales.</p>
           </div>
           
           <button (click)="showForm.set(true)" class="btn-primary py-1.5 px-4 rounded-md shadow-sm font-medium flex items-center gap-2 text-sm">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
               Create a Promotion
           </button>
        </div>

        <!-- Creation Form -->
        <div *ngIf="showForm()" class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm mb-8 animate-slide-up">
            <h2 class="text-lg font-bold text-neutral-800 mb-6 pb-2 border-b border-neutral-100">Create New Coupon</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="space-y-1">
                    <label class="block text-sm font-bold text-neutral-700">Coupon Code</label>
                    <input type="text" [(ngModel)]="newCoupon.code" class="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none uppercase" placeholder="e.g. SUMMER2026">
                    <p class="text-xs text-neutral-500">Must be unique and 5-15 characters.</p>
                </div>
                <div class="space-y-1">
                    <label class="block text-sm font-bold text-neutral-700">Discount Type</label>
                    <select [(ngModel)]="newCoupon.type" class="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none">
                        <option value="PERCENTAGE">Percentage Off</option>
                        <option value="FIXED_AMOUNT">Fixed Amount Off</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="block text-sm font-bold text-neutral-700">Discount Value</label>
                    <input type="number" [(ngModel)]="newCoupon.value" class="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" placeholder="0">
                </div>
                <div class="space-y-1">
                    <label class="block text-sm font-bold text-neutral-700">Minimum Purchase</label>
                    <input type="number" [(ngModel)]="newCoupon.minOrderAmount" class="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" placeholder="R0.00">
                </div>
                <div class="space-y-1">
                    <label class="block text-sm font-bold text-neutral-700">Expiry Date</label>
                    <input type="date" [(ngModel)]="newCoupon.expiryDate" class="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none">
                </div>
            </div>

            <div class="flex justify-end gap-4 mt-8 pt-4 border-t border-neutral-100">
                <button (click)="showForm.set(false)" class="btn-secondary py-2 px-6 rounded-md text-sm">Cancel</button>
                <button (click)="createCoupon()" [disabled]="submitting()" class="btn-primary py-2 px-6 rounded-md text-sm shadow-sm">
                    {{ submitting() ? 'Creating...' : 'Launch Promotion' }}
                </button>
            </div>
        </div>

        <!-- Promotions Table -->
        <div class="bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
            <div class="bg-neutral-50 border-b border-neutral-200 px-6 py-3 flex justify-between items-center text-xs font-bold text-neutral-500 uppercase tracking-wide">
                <span>Active Promotions</span>
                <button class="text-primary hover:underline lowercase font-normal text-sm">View all history</button>
            </div>
            
            <table class="w-full text-sm text-left">
                <thead class="bg-white border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wide">
                    <tr>
                        <th class="px-6 py-3">Code</th>
                        <th class="px-6 py-3">Discount</th>
                        <th class="px-6 py-3 text-right">Min Spend</th>
                        <th class="px-6 py-3 text-center">Status</th>
                        <th class="px-6 py-3">Expires</th>
                        <th class="px-6 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-neutral-200">
                    <tr *ngFor="let coupon of coupons()" class="hover:bg-neutral-50 transition-colors">
                        <td class="px-6 py-4 font-mono font-bold text-neutral-800">{{ coupon.code }}</td>
                        <td class="px-6 py-4">
                            <span *ngIf="coupon.type === 'PERCENTAGE'" class="text-emerald-700 font-bold">{{ coupon.value }}% Off</span>
                            <span *ngIf="coupon.type === 'FIXED_AMOUNT'" class="text-emerald-700 font-bold">R{{ coupon.value }} Off</span>
                        </td>
                        <td class="px-6 py-4 text-right">R{{ coupon.minOrderAmount || 0 | number:'1.0-0' }}</td>
                        <td class="px-6 py-4 text-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                                  [ngClass]="coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                                {{ coupon.isActive ? 'Active' : 'Ended' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-neutral-600">{{ coupon.expiryDate | date:'mediumDate' }}</td>
                        <td class="px-6 py-4 text-center">
                            <button class="text-primary hover:underline text-xs font-medium">Edit</button>
                            <span class="text-neutral-300 mx-2">|</span>
                            <button class="text-red-600 hover:underline text-xs font-medium">End</button>
                        </td>
                    </tr>
                    <tr *ngIf="coupons().length === 0">
                        <td colspan="6" class="px-6 py-20 text-center text-neutral-500 italic">No promotions found. Create one to get started.</td>
                    </tr>
                </tbody>
            </table>
        </div>

      </div>
    </div>
  `
})
export class VendorPromotionsComponent implements OnInit {
  coupons = signal<any[]>([]);
  showForm = signal(false);
  submitting = signal(false);
  
  newCoupon: any = {
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    minOrderAmount: 0,
    expiryDate: '',
    isActive: true
  };

  constructor(private vendorService: VendorService) {}

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.vendorService.getCoupons().subscribe(data => this.coupons.set(data));
  }

  createCoupon() {
    if (!this.newCoupon.code || !this.newCoupon.value) {
        alert('Please fill required fields');
        return;
    }
    this.submitting.set(true);
    this.vendorService.createCoupon(this.newCoupon).subscribe({
        next: (res) => {
            this.coupons.update(c => [res, ...c]);
            this.showForm.set(false);
            this.submitting.set(false);
            this.newCoupon = { code: '', type: 'PERCENTAGE', value: 0, minOrderAmount: 0, expiryDate: '', isActive: true };
        },
        error: (err) => {
            alert('Failed to create coupon.');
            this.submitting.set(false);
        }
    });
  }
}