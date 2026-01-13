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
    <div class="bg-[#F0F2F2] min-h-screen">
      <!-- Navbar -->
      <nav class="bg-white border-b border-gray-300 px-6 py-2 flex justify-between items-center shadow-sm">
          <div class="flex items-center gap-4">
              <span class="text-xl font-bold text-primary">Chommie <span class="font-normal text-black text-sm uppercase tracking-wide">Seller Central</span></span>
              <div class="h-6 w-px bg-gray-300"></div>
              <a routerLink="/dashboard" class="text-sm font-bold text-gray-700 hover:text-action">Dashboard</a>
              <span class="text-sm font-bold text-[#E77600]">Add a Product</span>
          </div>
          <div class="text-sm text-gray-600">
              store_v123 | <a href="#" class="text-amazon-link hover:underline">Help</a>
          </div>
      </nav>

      <div class="p-6 max-w-[1000px] mx-auto">
        
        <!-- Tabs -->
        <div class="bg-white border border-gray-300 border-b-0 rounded-t-[4px] flex">
            <div class="px-6 py-3 border-b-2 border-[#E77600] font-bold text-[#111111] text-sm bg-white cursor-pointer">
                Vital Info
            </div>
            <div class="px-6 py-3 border-b border-gray-300 text-amazon-link hover:text-action hover:underline text-sm bg-[#F7FAFA] cursor-pointer">
                Variations
            </div>
            <div class="px-6 py-3 border-b border-gray-300 text-amazon-link hover:text-action hover:underline text-sm bg-[#F7FAFA] cursor-pointer">
                Offer
            </div>
            <div class="px-6 py-3 border-b border-gray-300 text-amazon-link hover:text-action hover:underline text-sm bg-[#F7FAFA] cursor-pointer">
                Images
            </div>
            <div class="flex-grow border-b border-gray-300 bg-[#F7FAFA]"></div>
        </div>

        <div class="bg-white border border-gray-300 border-t-0 p-8 shadow-sm">
            <h1 class="text-2xl font-normal text-[#111111] mb-6">Product Identity</h1>

            <form (ngSubmit)="onSubmit()" class="space-y-6 max-w-3xl">
                
                <div class="grid grid-cols-12 gap-4 items-center">
                    <label class="col-span-3 text-right text-sm font-bold text-gray-600">
                        Product Name <span class="text-red-700">*</span>
                    </label>
                    <div class="col-span-9">
                        <input type="text" name="name" [(ngModel)]="product.name" required
                            class="w-full border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none shadow-inner">
                        <p class="text-xs text-gray-500 mt-1">Include brand, series, and key features.</p>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-4 items-start">
                    <label class="col-span-3 text-right text-sm font-bold text-gray-600 mt-2">
                        Description <span class="text-red-700">*</span>
                    </label>
                    <div class="col-span-9">
                        <textarea name="description" rows="4" [(ngModel)]="product.description" required
                            class="w-full border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none shadow-inner"></textarea>
                    </div>
                </div>

                        <div class="mb-4">
                            <label class="block text-sm font-bold mb-1">Category</label>
                            <select [(ngModel)]="product.category" name="category" class="w-full p-2 border border-gray-300 rounded-sm text-sm focus:border-[#e77600] focus:shadow-outline-orange outline-none">
                                <option>Electronics</option>
                                <option>Fashion</option>
                                <option>Home & Kitchen</option>
                                <option>Books</option>
                            </select>
                        </div>

                        <!-- Badges -->
                        <div class="mb-4">
                            <label class="block text-sm font-bold mb-2">Badges</label>
                            <div class="flex gap-4">
                                <label class="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" [checked]="product.badges.includes('BEST_SELLER')" (change)="toggleBadge('BEST_SELLER')" class="w-4 h-4">
                                    Best Seller
                                </label>
                                <label class="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" [checked]="product.badges.includes('AMAZON_CHOICE')" (change)="toggleBadge('AMAZON_CHOICE')" class="w-4 h-4">
                                    Chommie's Choice
                                </label>
                            </div>
                        </div>

                <hr class="my-6 border-gray-200">
                <h2 class="text-xl font-normal text-[#111111] mb-6">Offer & Images</h2>

                <div class="grid grid-cols-12 gap-4 items-center">
                    <label class="col-span-3 text-right text-sm font-bold text-gray-600">
                        Your Price <span class="text-red-700">*</span>
                    </label>
                    <div class="col-span-9 flex items-center gap-2">
                        <span class="text-sm font-bold">ZAR</span>
                        <input type="number" name="price" [(ngModel)]="product.price" required min="0"
                            class="w-32 border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none shadow-inner text-right">
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-4 items-center">
                    <label class="col-span-3 text-right text-sm font-bold text-gray-600">
                        Quantity <span class="text-red-700">*</span>
                    </label>
                    <div class="col-span-9">
                        <input type="number" name="stock" [(ngModel)]="product.stock" required min="0"
                            class="w-32 border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none shadow-inner">
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-4 items-center">
                    <label class="col-span-3 text-right text-sm font-bold text-gray-600">
                        Main Image URL
                    </label>
                    <div class="col-span-9">
                        <input type="text" name="image" [(ngModel)]="product.image" 
                            class="w-full border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none shadow-inner" placeholder="https://">
                    </div>
                </div>

                <!-- Variations -->
                <div class="grid grid-cols-12 gap-4 items-start">
                    <div class="col-span-3 text-right text-sm font-bold text-gray-600 mt-2">Variations</div>
                    <div class="col-span-9 p-4 border border-gray-200 bg-gray-50 rounded-sm">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="font-bold text-xs uppercase text-gray-500">Add options like size or color</h4>
                            <button type="button" (click)="addVariant()" class="text-xs text-[#007185] hover:underline font-bold">+ Add Variation</button>
                        </div>

                        <div *ngFor="let variant of product.variants; let i = index" class="mb-4 p-3 border border-gray-300 bg-white rounded-sm">
                            <div class="flex gap-2 mb-2">
                                <input [(ngModel)]="variant.name" [name]="'vName' + i" placeholder="Variation Name (e.g. Color)" class="flex-grow p-1 border border-gray-400 rounded-[3px] text-sm focus:border-[#E77600] outline-none">
                                <button type="button" (click)="removeVariant(i)" class="text-red-700 text-xs font-bold hover:underline">Remove</button>
                            </div>

                            <div class="pl-4 border-l-2 border-gray-200 space-y-2">
                                <div *ngFor="let option of variant.options; let j = index" class="flex gap-2 items-center">
                                    <input [(ngModel)]="option.value" [name]="'vOptValue' + i + j" placeholder="Value (e.g. Blue)" class="w-1/4 p-1 border border-gray-400 rounded-[3px] text-xs">
                                    <input [(ngModel)]="option.priceModifier" [name]="'vOptPrice' + i + j" type="number" placeholder="+Price" class="w-1/5 p-1 border border-gray-400 rounded-[3px] text-xs">
                                    <input [(ngModel)]="option.stock" [name]="'vOptStock' + i + j" type="number" placeholder="Stock" class="w-1/5 p-1 border border-gray-400 rounded-[3px] text-xs">
                                    <input [(ngModel)]="option.image" [name]="'vOptImg' + i + j" placeholder="Img URL" class="flex-grow p-1 border border-gray-400 rounded-[3px] text-xs">
                                    <button type="button" (click)="removeOption(i, j)" class="text-gray-400 text-lg hover:text-red-700">×</button>
                                </div>
                                <button type="button" (click)="addOption(i)" class="text-[10px] text-[#007185] font-bold hover:underline">+ Add Option</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-4 items-center">
                    <div class="col-span-3"></div>
                    <div class="col-span-9">
                        <div class="flex items-center gap-2 p-2 bg-[#F0F2F2] border border-gray-300 rounded-[3px]">
                            <input id="bnpl" name="bnplEligible" type="checkbox" [(ngModel)]="product.bnplEligible"
                                class="h-4 w-4 text-action focus:ring-action border-gray-300 rounded">
                            <label for="bnpl" class="text-sm font-bold text-gray-700">Enable Chommie BNPL (Buy Now Pay Later)</label>
                        </div>
                    </div>
                </div>

                <!-- Bulk Pricing -->
                <div class="grid grid-cols-12 gap-4 items-start">
                    <div class="col-span-3 text-right text-sm font-bold text-gray-600 mt-2">Bulk Pricing</div>
                    <div class="col-span-9 p-4 border border-gray-200 bg-gray-50 rounded-sm">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs text-gray-500">Offer discounts for larger quantities</span>
                            <button type="button" (click)="addBulkTier()" class="text-xs text-[#007185] hover:underline font-bold">+ Add Tier</button>
                        </div>
                        <div *ngFor="let tier of product.bulkPricing; let i = index" class="flex gap-2 mb-2 items-center">
                            <span class="text-xs">Buy</span>
                            <input type="number" [(ngModel)]="tier.minQuantity" [name]="'tierQty' + i" placeholder="Qty" class="w-20 border rounded px-2 py-1 text-sm">
                            <span class="text-xs">+ items, get</span>
                            <input type="number" [(ngModel)]="tier.discountPercentage" [name]="'tierDisc' + i" placeholder="%" class="w-20 border rounded px-2 py-1 text-sm">
                            <span class="text-xs">% Off</span>
                            <button type="button" (click)="removeBulkTier(i)" class="text-red-600 ml-2">×</button>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="border-t border-gray-200 mt-8 pt-6 flex justify-end gap-4">
                    <button type="button" routerLink="/dashboard"
                        class="bg-white border border-gray-400 hover:bg-gray-50 text-black py-1 px-4 rounded-[3px] shadow-sm text-sm font-medium">
                        Cancel
                    </button>
                    <button type="submit" [disabled]="submitting()"
                        class="bg-action hover:bg-[#B12704] text-white py-1 px-4 rounded-[3px] shadow-sm text-sm font-medium border border-transparent disabled:opacity-50">
                        {{ submitting() ? 'Saving...' : 'Save and finish' }}
                    </button>
                </div>

            </form>
        </div>
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
    // Transform simple image string to array for backend
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
        alert('Failed to create product');
      }
    });
  }
}
