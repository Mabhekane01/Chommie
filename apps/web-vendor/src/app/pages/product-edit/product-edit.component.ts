import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE PRODUCT EDIT UI -->
        <div class="p-4 space-y-6 animate-fade-in">
           <div class="flex justify-between items-center pt-2 px-1">
              <h1 class="text-xl font-bold">Edit Product</h1>
              <span class="text-[9px] font-bold text-emerald-600 border border-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Active Listing</span>
           </div>

           <div *ngIf="loading()" class="py-20 flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>

           <form *ngIf="!loading()" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Mobile Step 1: Vital Info -->
              <div class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <h2 class="text-xs font-bold uppercase tracking-widest text-neutral-400">1. Product Attributes</h2>
                 <div class="space-y-3">
                    <input type="text" name="name" [(ngModel)]="product.name" placeholder="Title" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                    <textarea name="description" rows="4" [(ngModel)]="product.description" placeholder="Description" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-medium focus:border-primary outline-none"></textarea>
                    <select [(ngModel)]="product.category" name="category" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                       <option>Electronics</option>
                       <option>Fashion</option>
                       <option>Home</option>
                       <option>Beauty</option>
                    </select>
                 </div>
              </div>

              <!-- Mobile Step 2: Market Logic -->
              <div class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <h2 class="text-xs font-bold uppercase tracking-widest text-neutral-400">2. Market Logic</h2>
                 <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                       <label class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Price (ZAR)</label>
                       <input type="number" name="price" [(ngModel)]="product.price" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                    </div>
                    <div class="space-y-1">
                       <label class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Stock</label>
                       <input type="number" name="stock" [(ngModel)]="product.stock" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                    </div>
                 </div>
              </div>

              <!-- Mobile Step 3: Visual Relay -->
              <div class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <h2 class="text-xs font-bold uppercase tracking-widest text-neutral-400">3. Visual Relay</h2>
                 <input type="text" name="image" [(ngModel)]="product.image" placeholder="Image URL" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-medium focus:border-primary outline-none">
                 <div *ngIf="product.image" class="mt-2 w-20 h-20 bg-neutral-50 rounded-lg flex items-center justify-center border border-neutral-200">
                    <img [src]="product.image" class="max-w-full max-h-full object-contain">
                 </div>
              </div>

              <div class="pt-4 flex flex-col gap-3">
                 <button type="submit" [disabled]="submitting()" class="w-full bg-primary text-white py-3.5 rounded-lg font-bold uppercase tracking-widest shadow-md active:scale-[0.98] transition-all">
                    {{ submitting() ? 'Updating...' : 'Update Listing' }}
                 </button>
                 <button type="button" routerLink="/inventory" class="w-full bg-white border border-neutral-300 text-neutral-400 py-3.5 rounded-lg font-bold uppercase tracking-widest">Cancel</button>
              </div>
           </form>
        </div>
      } @else {
        <!-- DESKTOP PRODUCT EDIT UI -->
        <div class="p-8 max-w-[1000px] mx-auto space-y-8 animate-fade-in">
          <div class="flex justify-between items-end border-b border-neutral-200 pb-6">
             <div>
                <h1 class="text-3xl font-header font-bold text-neutral-charcoal tracking-tight">Edit Listing</h1>
                <p class="text-sm text-neutral-500 mt-1 font-medium uppercase tracking-widest">Asset: {{ product.name || 'Loading...' }}</p>
             </div>
             <div class="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-md border border-emerald-200 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">State: Synchronized</span>
             </div>
          </div>

          <div *ngIf="loading()" class="py-32 flex justify-center">
               <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          </div>

          <form *ngIf="!loading()" (ngSubmit)="onSubmit()" class="space-y-8">
              
              <!-- Vital Manifest -->
              <div class="bg-white border border-neutral-300 rounded-lg p-10 shadow-sm relative overflow-hidden">
                  <h2 class="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-10 pb-4 border-b border-neutral-50">01 Vital Attributes</h2>
                  
                  <div class="space-y-8">
                      <div class="grid grid-cols-12 gap-10 items-start text-sm">
                          <label class="col-span-3 font-bold text-neutral-600 pt-4 text-right">Product Label <span class="text-primary font-black">*</span></label>
                          <div class="col-span-9">
                             <input type="text" name="name" [(ngModel)]="product.name" required
                                 class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all hover:bg-white"
                                 placeholder="Enter product signature">
                          </div>
                      </div>

                      <div class="grid grid-cols-12 gap-10 items-start text-sm">
                          <label class="col-span-3 font-bold text-neutral-600 pt-4 text-right">Core Synthesis <span class="text-primary font-black">*</span></label>
                          <div class="col-span-9">
                             <textarea name="description" rows="6" [(ngModel)]="product.description" required
                                 class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all hover:bg-white leading-relaxed"
                                 placeholder="Update asset parameters..."></textarea>
                          </div>
                      </div>

                      <div class="grid grid-cols-12 gap-10 items-start text-sm">
                          <label class="col-span-3 font-bold text-neutral-600 pt-4 text-right">Sector Allocation</label>
                          <div class="col-span-9">
                              <select [(ngModel)]="product.category" name="category" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all hover:bg-white cursor-pointer uppercase tracking-widest text-xs">
                                  <option>Electronics</option>
                                  <option>Fashion</option>
                                  <option>Home</option>
                                  <option>Beauty</option>
                                  <option>Sports</option>
                              </select>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Market Configuration -->
              <div class="bg-white border border-neutral-300 rounded-lg p-10 shadow-sm">
                  <h2 class="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-10 pb-4 border-b border-neutral-50">02 Market Parameters</h2>
                  
                  <div class="space-y-8">
                      <div class="grid grid-cols-12 gap-10 items-start text-sm">
                          <label class="col-span-3 font-bold text-neutral-600 pt-4 text-right">Market Price <span class="text-primary font-black">*</span></label>
                          <div class="col-span-9 flex items-center gap-6">
                              <div class="flex-grow relative group">
                                 <span class="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">ZAR</span>
                                 <input type="number" name="price" [(ngModel)]="product.price" required min="0"
                                     class="w-full bg-neutral-50 border border-neutral-300 rounded-md pl-16 pr-6 py-3.5 text-lg font-black focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all group-hover:bg-white">
                              </div>
                              <div class="flex-grow relative group">
                                 <span class="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Available Stock</span>
                                 <input type="number" name="stock" [(ngModel)]="product.stock" required min="0"
                                     class="w-full bg-neutral-50 border border-neutral-300 rounded-md pl-28 pr-6 py-3.5 text-lg font-black focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all group-hover:bg-white">
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Visual Relay -->
              <div class="bg-white border border-neutral-300 rounded-lg p-10 shadow-sm">
                  <h2 class="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-10 pb-4 border-b border-neutral-50">03 Visual Manifest</h2>
                  
                  <div class="grid grid-cols-12 gap-10 items-start text-sm">
                      <label class="col-span-3 font-bold text-neutral-600 pt-4 text-right">Active Image URL</label>
                      <div class="col-span-9 flex gap-10 items-start">
                          <div class="flex-grow">
                             <input type="text" name="image" [(ngModel)]="product.image" 
                                 class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 font-medium focus:border-primary outline-none shadow-inner transition-all hover:bg-white" placeholder="https://...">
                             <p class="text-[10px] text-neutral-400 mt-2 font-medium">Update primary visual signal link.</p>
                          </div>
                          <div *ngIf="product.image" class="w-32 h-32 border-2 border-neutral-100 rounded-2xl p-2 bg-white shadow-sm shrink-0 flex items-center justify-center">
                             <img [src]="product.image" class="max-w-full max-h-full object-contain mix-blend-multiply">
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Logic Controls -->
              <div class="flex justify-end items-center gap-6 pt-10">
                  <button type="button" routerLink="/inventory"
                      class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-red-600 transition-colors">
                      Discard Updates
                  </button>
                  <button type="submit" [disabled]="submitting()"
                      class="bg-primary text-white py-4 px-12 rounded-lg font-bold uppercase tracking-widest shadow-md transition-all active:scale-95 disabled:opacity-50">
                      {{ submitting() ? 'Pushing Data...' : 'Commit Changes' }}
                  </button>
              </div>

          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ProductEditComponent implements OnInit {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private vendorService = inject(VendorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  product: any = {
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'Electronics',
    stock: 0,
    image: '',
    bnplEligible: true
  };
  
  loading = signal(true);
  submitting = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vendorService.getProduct(id).subscribe({
        next: (data) => {
          this.product = {
            ...data,
            image: data.images?.[0] || ''
          };
          this.loading.set(false);
        },
        error: () => {
          alert('Could not load product details.');
          this.router.navigate(['/inventory']);
        }
      });
    }
  }

  onSubmit() {
    this.submitting.set(true);
    const productData = {
        ...this.product,
        images: this.product.image ? [this.product.image] : this.product.images
    };
    
    this.vendorService.updateProduct(productData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        console.error(err);
        this.submitting.set(false);
        alert('Failed to update product.');
      }
    });
  }
}
