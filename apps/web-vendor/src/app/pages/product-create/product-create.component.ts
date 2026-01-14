import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-product-create',
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
                  <a href="#" class="hover:text-primary transition-colors text-primary font-bold">Catalog</a>
                  <a routerLink="/orders" class="hover:text-primary transition-colors">Orders</a>
              </div>
          </div>
          <div class="text-xs text-neutral-500 hidden sm:block">
              Listing ID: <span class="font-mono text-neutral-700">NEW_DRAFT</span>
          </div>
      </nav>

      <div class="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        
        <div class="flex justify-between items-center pb-4 border-b border-neutral-200">
           <h1 class="text-3xl font-header font-bold text-neutral-charcoal">Add a Product</h1>
           <div class="text-sm text-neutral-500">
              <span class="font-bold text-primary">Draft</span> - Information provided will be used to create your listing.
           </div>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-8">
            
            <!-- Core Info -->
            <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
                <h2 class="text-lg font-bold text-neutral-charcoal mb-6 pb-2 border-b border-neutral-100">Vital Info</h2>
                
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        <label class="md:col-span-3 text-sm font-bold text-neutral-700 pt-2 text-right">
                            Product Name <span class="text-red-600">*</span>
                        </label>
                        <div class="md:col-span-9">
                           <input type="text" name="name" [(ngModel)]="product.name" required
                               class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none shadow-inner"
                               placeholder="e.g. Wireless Noise Cancelling Headphones">
                           <p class="text-xs text-neutral-500 mt-1">Include brand, model, and key features.</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        <label class="md:col-span-3 text-sm font-bold text-neutral-700 pt-2 text-right">
                            Description <span class="text-red-600">*</span>
                        </label>
                        <div class="md:col-span-9">
                           <textarea name="description" rows="5" [(ngModel)]="product.description" required
                               class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none shadow-inner"
                               placeholder="Enter product description..."></textarea>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        <label class="md:col-span-3 text-sm font-bold text-neutral-700 pt-2 text-right">
                            Category
                        </label>
                        <div class="md:col-span-9">
                            <select [(ngModel)]="product.category" name="category" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none bg-white">
                                <option>Electronics</option>
                                <option>Fashion</option>
                                <option>Home & Kitchen</option>
                                <option>Books</option>
                                <option>Beauty</option>
                                <option>Sports</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Offer -->
            <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
                <h2 class="text-lg font-bold text-neutral-charcoal mb-6 pb-2 border-b border-neutral-100">Offer</h2>
                
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        <label class="md:col-span-3 text-sm font-bold text-neutral-700 pt-2 text-right">
                            Your Price <span class="text-red-600">*</span>
                        </label>
                        <div class="md:col-span-9 flex items-center gap-2">
                            <span class="text-sm font-bold text-neutral-500">ZAR</span>
                            <input type="number" name="price" [(ngModel)]="product.price" required min="0"
                                class="w-48 border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none shadow-inner">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        <label class="md:col-span-3 text-sm font-bold text-neutral-700 pt-2 text-right">
                            Quantity <span class="text-red-600">*</span>
                        </label>
                        <div class="md:col-span-9">
                            <input type="number" name="stock" [(ngModel)]="product.stock" required min="0"
                                class="w-32 border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none shadow-inner">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Images -->
            <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
                <h2 class="text-lg font-bold text-neutral-charcoal mb-6 pb-2 border-b border-neutral-100">Images</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <label class="md:col-span-3 text-sm font-bold text-neutral-700 pt-2 text-right">
                        Main Image URL
                    </label>
                    <div class="md:col-span-9">
                        <input type="text" name="image" [(ngModel)]="product.image" 
                            class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none shadow-inner" placeholder="https://...">
                        <p class="text-xs text-neutral-500 mt-1">Provide a direct link to your product image.</p>
                    </div>
                </div>
            </div>

            <!-- More Options -->
            <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
                <div class="flex items-start gap-3">
                    <div class="flex h-5 items-center">
                        <input id="bnpl" name="bnplEligible" type="checkbox" [(ngModel)]="product.bnplEligible"
                            class="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer">
                    </div>
                    <div class="text-sm">
                        <label for="bnpl" class="font-bold text-neutral-700">Enable Buy Now Pay Later</label>
                        <p class="text-neutral-500">Allow customers to purchase this item using Chommie BNPL credit.</p>
                    </div>
                </div>
            </div>

            <!-- Footer Actions -->
            <div class="flex justify-end items-center gap-4 pt-4 border-t border-neutral-200">
                <button type="button" routerLink="/dashboard"
                    class="btn-secondary py-2 px-6 rounded-md text-sm">
                    Cancel
                </button>
                <button type="submit" [disabled]="submitting()"
                    class="btn-primary py-2 px-8 rounded-md text-sm shadow-sm disabled:opacity-50">
                    {{ submitting() ? 'Saving...' : 'Save and Finish' }}
                </button>
            </div>

        </form>
      </div>
    </div>
  `
})
export class ProductCreateComponent {
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
  submitting = signal(false);

  constructor(private vendorService: VendorService, private router: Router) {}

  addVariant() {
    this.product.variants.push({
      name: '',
      options: [{ value: '', priceModifier: 0, stock: 10, image: '' }]
    });
  }

  removeVariant(index: number) {
    this.product.variants.splice(index, 1);
  }

  addOption(variantIndex: number) {
    this.product.variants[variantIndex].options.push({
      value: '', priceModifier: 0, stock: 10, image: ''
    });
  }

  removeOption(variantIndex: number, optionIndex: number) {
    this.product.variants[variantIndex].options.splice(optionIndex, 1);
  }

  toggleBadge(badge: string) {
    const idx = this.product.badges.indexOf(badge);
    if (idx > -1) {
      this.product.badges.splice(idx, 1);
    } else {
      this.product.badges.push(badge);
    }
  }

  addBulkTier() {
    this.product.bulkPricing.push({ minQuantity: 5, discountPercentage: 5 });
  }

  removeBulkTier(index: number) {
    this.product.bulkPricing.splice(index, 1);
  }

  onSubmit() {
    this.submitting.set(true);
    const productData = {
        ...this.product,
        images: this.product.image ? [this.product.image] : []
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