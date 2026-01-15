import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE PRODUCT CREATE UI -->
        <div class="p-4 space-y-6 animate-fade-in">
           <div class="flex justify-between items-center pt-2 px-1">
              <h1 class="text-xl font-bold">Add a Product</h1>
              <span class="text-[9px] font-bold text-primary border border-primary px-2 py-0.5 rounded-full uppercase tracking-widest">Draft</span>
           </div>

           <form (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Mobile Step 1 -->
              <div class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <h2 class="text-xs font-bold uppercase tracking-widest text-neutral-400">1. Basic Details</h2>
                 <div class="space-y-3">
                    <input type="text" name="name" [(ngModel)]="product.name" placeholder="Product Name" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                    <textarea name="description" rows="4" [(ngModel)]="product.description" placeholder="Describe your product..." class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-medium focus:border-primary outline-none"></textarea>
                    <select [(ngModel)]="product.category" name="category" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                       <option>Electronics</option>
                       <option>Fashion</option>
                       <option>Home</option>
                       <option>Beauty</option>
                    </select>
                 </div>
              </div>

              <!-- Mobile Step 2 -->
              <div class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <h2 class="text-xs font-bold uppercase tracking-widest text-neutral-400">2. Price and Stock</h2>
                 <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                       <label class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Price (R)</label>
                       <input type="number" name="price" [(ngModel)]="product.price" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                    </div>
                    <div class="space-y-1">
                       <label class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Units available</label>
                       <input type="number" name="stock" [(ngModel)]="product.stock" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                    </div>
                 </div>
              </div>

              <!-- Mobile Step 3 -->
              <div class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <h2 class="text-xs font-bold uppercase tracking-widest text-neutral-400">3. Photos</h2>
                 <input type="text" name="image" [(ngModel)]="product.image" placeholder="Image Link" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-medium focus:border-primary outline-none">
              </div>

              <div class="pt-4 flex flex-col gap-3">
                 <button type="submit" [disabled]="submitting()" class="w-full bg-primary text-white py-3.5 rounded-lg font-bold uppercase tracking-widest shadow-md active:scale-[0.98] transition-all">
                    {{ submitting() ? 'Saving...' : 'List Product' }}
                 </button>
                 <button type="button" routerLink="/dashboard" class="w-full bg-white border border-neutral-300 text-neutral-400 py-3.5 rounded-lg font-bold uppercase tracking-widest">Cancel</button>
              </div>
           </form>
        </div>
      } @else {
        <!-- DESKTOP PRODUCT CREATE UI -->
        <div class="p-8 max-w-[1000px] mx-auto space-y-8 animate-fade-in">
          <div class="flex justify-between items-end border-b border-neutral-200 pb-6">
             <div>
                <h1 class="text-3xl font-header font-bold text-neutral-charcoal tracking-tight">Add a Product</h1>
                <p class="text-sm text-neutral-500 mt-1 font-medium uppercase tracking-widest">Create a new listing</p>
             </div>
             <div class="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-md border border-neutral-200 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span class="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Status: Drafting</span>
             </div>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-8">
              
              <!-- General Info -->
              <div class="bg-white border border-neutral-300 rounded-lg p-10 shadow-sm relative overflow-hidden">
                  <h2 class="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-10 pb-4 border-b border-neutral-50">01 General Information</h2>
                  
                  <div class="space-y-8">
                      <div class="grid grid-cols-12 gap-10 items-start text-sm">
                          <label class="col-span-3 font-bold text-neutral-600 pt-4 text-right">Product Name <span class="text-primary font-black">*</span></label>
                          <div class="col-span-9">
                             <input type="text" name="name" [(ngModel)]="product.name" required
                                 class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all hover:bg-white"
                                 placeholder="e.g. Sony WH-1000XM5 Headphones">
                             <p class="text-[10px] text-neutral-400 mt-2 font-medium">Use a clear name that describes what the product is.</p>
                          </div>
                      </div>

                      <div class="grid grid-cols-12 gap-10 items-start text-sm">
                          <label class="col-span-3 font-bold text-neutral-600 pt-4 text-right">Description <span class="text-primary font-black">*</span></label>
                          <div class="col-span-9">
                             <textarea name="description" rows="6" [(ngModel)]="product.description" required
                                 class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all hover:bg-white leading-relaxed"
                                 placeholder="Tell customers about your product features and benefits..."></textarea>
                          </div>
                      </div>

                      <div class="grid grid-cols-12 gap-10 items-start text-sm">
                          <label class="col-span-3 font-bold text-neutral-600 pt-4 text-right">Category</label>
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

              <!-- Pricing and Stock -->
              <div class="bg-white border border-neutral-300 rounded-lg p-10 shadow-sm">
                  <h2 class="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-10 pb-4 border-b border-neutral-50">02 Pricing and Stock</h2>
                  
                  <div class="space-y-8">
                      <div class="grid grid-cols-12 gap-10 items-start text-sm">
                          <label class="col-span-3 font-bold text-neutral-600 pt-4 text-right">Price and Inventory <span class="text-primary font-black">*</span></label>
                          <div class="col-span-9 flex items-center gap-6">
                              <div class="flex-grow relative group">
                                 <span class="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">R</span>
                                 <input type="number" name="price" [(ngModel)]="product.price" required min="0"
                                     class="w-full bg-neutral-50 border border-neutral-300 rounded-md pl-16 pr-6 py-3.5 text-lg font-black focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all group-hover:bg-white">
                              </div>
                              <div class="flex-grow relative group">
                                 <span class="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Stock Level</span>
                                 <input type="number" name="stock" [(ngModel)]="product.stock" required min="0"
                                     class="w-full bg-neutral-50 border border-neutral-300 rounded-md pl-24 pr-6 py-3.5 text-lg font-black focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all group-hover:bg-white">
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Visual Assets -->
              <div class="bg-white border border-neutral-300 rounded-lg p-10 shadow-sm">
                  <h2 class="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-10 pb-4 border-b border-neutral-50">03 Product Photos</h2>
                  
                  <div class="space-y-8">
                      <!-- Guidelines Info Box -->
                      <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-4 text-sm text-blue-800">
                          <div class="min-w-[20px] pt-0.5">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                          </div>
                          <div>
                              <h4 class="font-bold mb-1">Photo Quality Guidelines</h4>
                              <ul class="list-disc pl-4 space-y-1 text-xs">
                                  <li><strong>Resolution:</strong> Minimum 1000px on the longest side.</li>
                                  <li><strong>Background:</strong> Pure white is required for the main image.</li>
                                  <li><strong>Size:</strong> Square images (1:1) look best in the shop.</li>
                                  <li><strong>Content:</strong> The product should fill most of the frame. No text or logos.</li>
                              </ul>
                          </div>
                      </div>

                      <div class="grid grid-cols-12 gap-10 items-start text-sm">
                          <label class="col-span-3 font-bold text-neutral-600 pt-4 text-right">Upload Photos</label>
                          <div class="col-span-9 space-y-4">
                             <div class="flex gap-4">
                                <input type="text" name="imageInput" [(ngModel)]="imageInput" 
                                    class="flex-grow bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner transition-all hover:bg-white"
                                    placeholder="Paste photo link here">
                                <button type="button" (click)="addImage()" class="btn-secondary px-6 py-2 rounded-md font-bold uppercase tracking-widest text-xs border border-neutral-300">Add Photo</button>
                             </div>
                             
                             <div class="grid grid-cols-4 gap-4 mt-4" *ngIf="images.length > 0">
                                <div *ngFor="let img of images; let i = index" class="relative group aspect-square border border-neutral-200 rounded-lg overflow-hidden bg-white">
                                    <img [src]="img" class="w-full h-full object-contain p-2" onerror="this.src='assets/placeholder.png'">
                                    <button type="button" (click)="removeImage(i)" class="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                             </div>
                             <p class="text-[10px] text-neutral-400 font-medium">Add up to 8 photos. The first photo will be your main display image.</p>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Toggles -->
              <div class="bg-neutral-50 rounded-lg p-8 border border-neutral-300 shadow-sm flex items-center justify-between">
                  <div class="flex items-center gap-6">
                      <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-neutral-200 text-primary shadow-sm">
                         <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                      </div>
                      <div>
                         <h3 class="font-bold text-neutral-800 text-sm">Installment Payments</h3>
                         <p class="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-bold">Allow customers to buy now and pay later</p>
                      </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="bnplEligible" [(ngModel)]="product.bnplEligible" class="sr-only peer">
                    <div class="w-14 h-7 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-primary border border-neutral-300"></div>
                  </label>
              </div>

              <!-- Action Controls -->
              <div class="flex justify-end items-center gap-6 pt-10">
                  <button type="button" routerLink="/dashboard"
                      class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-red-600 transition-colors">
                      Cancel
                  </button>
                  <button type="submit" [disabled]="submitting()"
                      class="btn-primary py-4 px-12 rounded-lg font-bold uppercase tracking-widest shadow-md transition-all active:scale-95 disabled:opacity-50">
                      {{ submitting() ? 'Saving...' : 'List Your Product' }}
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
export class ProductCreateComponent {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private vendorService = inject(VendorService);
  private router = inject(Router);

  product: any = {
    name: '',
    description: '',
    price: 0,
    category: 'Electronics',
    stock: 10,
    image: '',
    bnplEligible: true,
    badges: [],
    variants: [],
    bulkPricing: []
  };
  
  images: string[] = [];
  imageInput = '';
  submitting = signal(false);
  imageWarnings: string[] = [];

  validateImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const warnings = [];
            if (img.naturalWidth < 1000 || img.naturalHeight < 1000) {
                warnings.push(`Low Resolution: ${img.naturalWidth}x${img.naturalHeight}px. (Recommended: 1000px+)`);
            }
            const ratio = img.naturalWidth / img.naturalHeight;
            if (ratio < 0.8 || ratio > 1.2) {
                warnings.push(`Non-Square Aspect Ratio: ${ratio.toFixed(2)}. (Recommended: 1:1)`);
            }
            if (warnings.length > 0) {
                // Determine if we should block or just warn. For now, warn.
                if (!confirm(`Image Quality Warning:\n${warnings.join('\n')}\n\nAdd anyway?`)) {
                    reject('User cancelled due to quality warnings.');
                    return;
                }
            }
            resolve();
        };
        img.onerror = () => reject('Failed to load image. Check the URL.');
        img.src = url;
    });
  }

  async addImage() {
    if (this.imageInput) {
      try {
        await this.validateImage(this.imageInput);
        this.images.push(this.imageInput);
        this.imageInput = '';
      } catch (e: any) {
        alert(e);
      }
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  onSubmit() {
    this.submitting.set(true);
    // If mobile input was used, add it to images if not already there
    if (this.product.image && !this.images.includes(this.product.image)) {
        this.images.push(this.product.image);
    }

    const productData = {
        ...this.product,
        images: this.images
    };
    
    this.vendorService.createProduct(productData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.submitting.set(false);
        alert('Failed to create product.');
      }
    });
  }
}
