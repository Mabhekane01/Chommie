import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-vendor-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-[#F0F2F2] min-h-screen">
      <nav class="bg-white border-b border-gray-300 px-6 py-2 flex justify-between items-center shadow-sm">
          <div class="flex items-center gap-4">
              <span class="text-xl font-bold text-primary">Chommie <span class="font-normal text-black text-sm uppercase tracking-wide">Seller Central</span></span>
              <div class="h-6 w-px bg-gray-300"></div>
              <a href="/dashboard" class="text-sm font-bold text-gray-700 hover:text-action">Dashboard</a>
              <span class="text-sm font-bold text-[#E77600]">Promotions</span>
          </div>
      </nav>

      <div class="p-6 max-w-[1200px] mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-normal text-[#111111]">Advertising & Promotions</h1>
            <button (click)="showForm.set(true)" class="bg-[#F0C14B] border border-[#a88734] rounded-[3px] py-1 px-4 text-sm shadow-sm hover:bg-[#F4D078] font-bold">
                Create Coupon
            </button>
        </div>

        <!-- Create Form -->
        <div *ngIf="showForm()" class="bg-white p-6 border border-gray-200 rounded-sm mb-6 shadow-sm">
            <h3 class="font-bold text-lg mb-4">Create a New Coupon</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold mb-1">Coupon Code</label>
                    <input type="text" [(ngModel)]="newCoupon.code" class="w-full border border-gray-300 rounded p-2 text-sm uppercase" placeholder="SUMMER2026">
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1">Discount Type</label>
                    <select [(ngModel)]="newCoupon.type" class="w-full border border-gray-300 rounded p-2 text-sm">
                        <option value="PERCENTAGE">Percentage Off</option>
                        <option value="FIXED_AMOUNT">Money Off (Fixed Amount)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1">Value</label>
                    <input type="number" [(ngModel)]="newCoupon.value" class="w-full border border-gray-300 rounded p-2 text-sm" placeholder="10">
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1">Minimum Order Amount</label>
                    <input type="number" [(ngModel)]="newCoupon.minOrderAmount" class="w-full border border-gray-300 rounded p-2 text-sm" placeholder="0">
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1">Expiry Date</label>
                    <input type="date" [(ngModel)]="newCoupon.expiryDate" class="w-full border border-gray-300 rounded p-2 text-sm">
                </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
                <button (click)="showForm.set(false)" class="text-sm text-blue-600 hover:underline">Cancel</button>
                <button (click)="createCoupon()" [disabled]="submitting()" class="bg-[#F0C14B] border border-[#a88734] rounded-[3px] py-1 px-4 text-sm shadow-sm hover:bg-[#F4D078]">
                    {{ submitting() ? 'Creating...' : 'Create Promotion' }}
                </button>
            </div>
        </div>

        <!-- Coupons List -->
        <div class="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <table class="w-full text-sm text-left">
                <thead class="bg-gray-100 text-xs text-gray-500 uppercase border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3">Code</th>
                        <th class="px-4 py-3">Discount</th>
                        <th class="px-4 py-3">Min Spend</th>
                        <th class="px-4 py-3">Status</th>
                        <th class="px-4 py-3">Expiry</th>
                        <th class="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr *ngFor="let coupon of coupons()" class="hover:bg-gray-50">
                        <td class="px-4 py-3 font-bold font-mono">{{ coupon.code }}</td>
                        <td class="px-4 py-3">
                            <span *ngIf="coupon.type === 'PERCENTAGE'">{{ coupon.value }}% Off</span>
                            <span *ngIf="coupon.type === 'FIXED_AMOUNT'">R{{ coupon.value }} Off</span>
                        </td>
                        <td class="px-4 py-3">R{{ coupon.minOrderAmount || 0 }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold" 
                                [ngClass]="coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                {{ coupon.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="px-4 py-3">{{ coupon.expiryDate | date }}</td>
                        <td class="px-4 py-3">
                            <button class="text-xs text-amazon-link hover:underline">Edit</button>
                        </td>
                    </tr>
                    <tr *ngIf="coupons().length === 0">
                        <td colspan="6" class="px-4 py-8 text-center text-gray-500">No active promotions.</td>
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
            // Reset
            this.newCoupon = { code: '', type: 'PERCENTAGE', value: 0, minOrderAmount: 0, expiryDate: '', isActive: true };
        },
        error: (err) => {
            alert('Failed to create coupon. Code might be taken.');
            this.submitting.set(false);
        }
    });
  }
}
