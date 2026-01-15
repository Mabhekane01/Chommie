import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';
import { RouterLink } from '@angular/router';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-vendor-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE PROMOTIONS UI -->
        <div class="p-4 space-y-6 animate-fade-in">
           <div class="flex justify-between items-center pt-2">
              <h1 class="text-xl font-bold">Promotions</h1>
              <button (click)="showForm.set(!showForm())" class="bg-primary text-white px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm">
                 {{ showForm() ? 'Close' : '+ New' }}
              </button>
           </div>

           <!-- Mobile Form -->
           <div *ngIf="showForm()" class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4 animate-slide-up">
              <h2 class="text-xs font-bold uppercase tracking-widest text-primary">Add Coupon Code</h2>
              <div class="space-y-3">
                 <input type="text" [(ngModel)]="newCoupon.code" placeholder="CODE (e.g. SAVE10)" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none uppercase shadow-inner">
                 <div class="grid grid-cols-2 gap-3">
                    <select [(ngModel)]="newCoupon.type" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-[10px] font-bold focus:border-primary outline-none uppercase">
                       <option value="PERCENTAGE">% Off</option>
                       <option value="FIXED_AMOUNT">R Off</option>
                    </select>
                    <input type="number" [(ngModel)]="newCoupon.value" placeholder="Value" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                 </div>
                 <input type="number" [(ngModel)]="newCoupon.minOrderAmount" placeholder="Min Spend (ZAR)" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none shadow-inner">
                 <input type="date" [(ngModel)]="newCoupon.expiryDate" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
              </div>
              <button (click)="createCoupon()" [disabled]="submitting()" class="w-full bg-emerald-600 text-white py-3.5 rounded-lg font-bold uppercase tracking-widest shadow-md active:scale-95 transition-all">
                 {{ submitting() ? 'Launching...' : 'Activate' }}
              </button>
           </div>

           <div class="space-y-4">
              <div *ngFor="let coupon of coupons()" class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <div class="flex justify-between items-center">
                    <div class="text-sm font-bold text-neutral-800 uppercase tracking-widest">{{ coupon.code }}</div>
                    <span class="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border"
                          [ngClass]="coupon.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'">
                       {{ coupon.isActive ? 'Active' : 'Ended' }}
                    </span>
                 </div>
                 <div class="flex justify-between items-end">
                    <div>
                       <div class="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                          {{ coupon.type === 'PERCENTAGE' ? coupon.value + '% OFF' : 'R' + coupon.value + ' OFF' }}
                       </div>
                       <div class="text-[10px] font-medium text-neutral-400 mt-1 uppercase">Expires: {{ coupon.expiryDate | date:'shortDate' }}</div>
                    </div>
                    <div class="flex gap-2">
                       <button class="bg-neutral-50 text-neutral-400 p-2 rounded-md border border-neutral-200"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                       <button class="bg-red-50 text-red-400 p-2 rounded-md border border-red-100"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      } @else {
        <!-- DESKTOP PROMOTIONS UI -->
        <div class="p-8 max-w-[1200px] mx-auto space-y-8 animate-fade-in">
          <div class="flex justify-between items-end border-b border-neutral-200 pb-6">
             <div>
                <h1 class="text-3xl font-header font-bold text-neutral-charcoal tracking-tight">Promotions & Coupons</h1>
                <p class="text-sm text-neutral-500 mt-1 font-medium uppercase tracking-widest">Growth & Visibility Control</p>
             </div>
             
             <button (click)="showForm.set(!showForm())" class="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-md shadow-sm font-bold uppercase tracking-widest text-[11px]">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                 Create Promotion
             </button>
          </div>

          <!-- Desktop Form -->
          <div *ngIf="showForm()" class="bg-white border border-neutral-300 rounded-lg p-10 shadow-lg space-y-10 animate-slide-up relative overflow-hidden">
              <h2 class="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 pb-4">Promotional Asset Configuration</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div class="space-y-2">
                      <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Coupon Code</label>
                      <input type="text" [(ngModel)]="newCoupon.code" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 text-sm font-bold focus:border-primary outline-none uppercase shadow-inner transition-all hover:bg-white" placeholder="CODE">
                  </div>
                  <div class="space-y-2">
                      <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Yield Logic</label>
                      <select [(ngModel)]="newCoupon.type" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 text-sm font-bold focus:border-primary outline-none transition-all hover:bg-white cursor-pointer uppercase tracking-widest text-xs">
                          <option value="PERCENTAGE">Percentage Yield</option>
                          <option value="FIXED_AMOUNT">Fixed Value Offset</option>
                      </select>
                  </div>
                  <div class="space-y-2">
                      <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Value</label>
                      <input type="number" [(ngModel)]="newCoupon.value" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 text-sm font-bold focus:border-primary outline-none shadow-inner transition-all hover:bg-white">
                  </div>
                  <div class="space-y-2">
                      <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Min Spend (ZAR)</label>
                      <input type="number" [(ngModel)]="newCoupon.minOrderAmount" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 text-sm font-bold focus:border-primary outline-none shadow-inner transition-all hover:bg-white">
                  </div>
                  <div class="space-y-2">
                      <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Termination Cycle</label>
                      <input type="date" [(ngModel)]="newCoupon.expiryDate" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 text-sm font-bold focus:border-primary outline-none shadow-inner transition-all hover:bg-white">
                  </div>
              </div>

              <div class="flex justify-end gap-6 pt-6 border-t border-neutral-100">
                  <button (click)="showForm.set(false)" class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-red-600 transition-colors">Abort</button>
                  <button (click)="createCoupon()" [disabled]="submitting()" class="btn-primary py-3 px-12 rounded-md font-bold uppercase tracking-widest shadow-md transition-all active:scale-95 disabled:opacity-50">
                      {{ submitting() ? 'Launching...' : 'Activate' }}
                  </button>
              </div>
          </div>

          <!-- Promotions Table Desktop -->
          <div class="bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
              <div class="p-4 bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-widest">Active Channels</div>
              
              <table class="w-full text-left text-sm">
                  <thead class="bg-white border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                      <tr>
                          <th class="px-8 py-4">Code</th>
                          <th class="px-6 py-4">Parameter</th>
                          <th class="px-6 py-4 text-right">Min Transaction</th>
                          <th class="px-6 py-4 text-center">State</th>
                          <th class="px-6 py-4">Expires</th>
                          <th class="px-8 py-4 text-center">Action</th>
                      </tr>
                  </thead>
                  <tbody class="divide-y divide-neutral-100">
                      <tr *ngFor="let coupon of coupons()" class="hover:bg-neutral-50/50 transition-all">
                          <td class="px-8 py-6 font-bold text-primary uppercase tracking-widest">{{ coupon.code }}</td>
                          <td class="px-6 py-6">
                              <span class="text-[10px] font-bold uppercase text-emerald-700">
                                 {{ coupon.type === 'PERCENTAGE' ? coupon.value + '% Off' : 'R' + coupon.value + ' Off' }}
                              </span>
                          </td>
                          <td class="px-6 py-6 text-right font-bold text-neutral-800">R{{ coupon.minOrderAmount || 0 | number:'1.0-0' }}</td>
                          <td class="px-6 py-6 text-center">
                              <span class="text-[9px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full"
                                    [ngClass]="coupon.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'">
                                {{ coupon.isActive ? 'Active' : 'Ended' }}
                              </span>
                          </td>
                          <td class="px-6 py-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">{{ coupon.expiryDate | date:'mediumDate' }}</td>
                          <td class="px-8 py-6 text-center">
                              <div class="flex items-center justify-center gap-4">
                                 <button class="text-primary hover:text-action hover:underline text-[10px] font-bold uppercase tracking-widest">Edit</button>
                                 <button class="text-red-600 hover:underline text-[10px] font-bold uppercase tracking-widest">End</button>
                              </div>
                          </td>
                      </tr>
                      <tr *ngIf="coupons().length === 0">
                          <td colspan="6" class="px-8 py-20 text-center text-neutral-400 font-bold uppercase tracking-widest">No active channels.</td>
                      </tr>
                  </tbody>
              </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class VendorPromotionsComponent implements OnInit {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private vendorService = inject(VendorService);

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
