import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-seller-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32">
      
      <!-- Seller Banner -->
      <div class="bg-neutral-50 border-b border-neutral-200">
        <div class="w-full px-6 py-8">
          <div class="flex flex-col md:flex-row gap-8 items-start md:items-center">
            
            <!-- Logo -->
            <div class="w-24 h-24 border border-neutral-300 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
               <span class="text-4xl font-header font-bold text-neutral-400">{{ (seller()?.storeName || 'S')[0] }}</span>
            </div>

            <div class="flex-grow space-y-2">
               <h1 class="text-3xl font-normal text-neutral-charcoal">{{ seller()?.storeName || 'Chommie Retail' }} Storefront</h1>
               
               <div class="flex items-center gap-4 text-sm text-neutral-600">
                  <div class="flex items-center gap-1">
                     <span class="font-bold text-neutral-800">{{ (seller()?.sellerRating || 4.5) | number:'1.1-1' }}</span>
                     <div class="flex text-amber-500 text-sm">
                       <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(seller()?.sellerRating || 4.5) ? '★' : '☆' }}</span>
                     </div>
                  </div>
                  <span class="text-neutral-300">|</span>
                  <span class="text-primary hover:underline cursor-pointer">{{ seller()?.numSellerRatings || 120 }} ratings</span>
                  <span class="text-neutral-300">|</span>
                  <span class="text-emerald-700 font-bold">98% positive</span> in the last 12 months
               </div>

               <p class="text-sm text-neutral-500 max-w-2xl leading-relaxed">
                 {{ seller()?.storeDescription || 'Authorized Chommie retailer providing high-quality goods with fast shipping and excellent customer service.' }}
               </p>
            </div>

            <div class="flex flex-col gap-2 min-w-[150px]">
               <button class="btn-primary py-1.5 px-4 text-sm rounded shadow-sm w-full">Ask a question</button>
               <button class="btn-secondary py-1.5 px-4 text-sm rounded shadow-sm w-full border border-neutral-300 bg-white">Follow Seller</button>
            </div>

          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="w-full px-6 py-8 animate-fade-in">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Sidebar -->
          <aside class="lg:col-span-3 space-y-6">
             <!-- Search Store -->
             <div class="border border-neutral-300 rounded-md p-4 bg-white">
                <h3 class="font-bold text-sm text-neutral-800 mb-3">Search this store</h3>
                <div class="flex">
                   <input type="text" class="w-full border border-neutral-300 border-r-0 rounded-l-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary">
                   <button class="bg-neutral-200 border border-neutral-300 rounded-r-sm px-3 hover:bg-neutral-300">
                      <svg class="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                   </button>
                </div>
             </div>

             <!-- Categories -->
             <div class="border border-neutral-300 rounded-md p-4 bg-white">
                <h3 class="font-bold text-sm text-neutral-800 mb-3">Departments</h3>
                <ul class="space-y-2 text-sm text-neutral-600">
                   <li class="hover:text-primary cursor-pointer font-bold">See All Products</li>
                   <li class="hover:text-primary cursor-pointer">Electronics</li>
                   <li class="hover:text-primary cursor-pointer">Home & Kitchen</li>
                   <li class="hover:text-primary cursor-pointer">Fashion</li>
                </ul>
             </div>
          </aside>

          <!-- Product Grid -->
          <div class="lg:col-span-9">
             <div class="flex justify-between items-center mb-6">
                <h2 class="font-bold text-lg text-neutral-800">Products from {{ seller()?.storeName || 'this seller' }}</h2>
                <select class="border border-neutral-300 rounded-sm py-1 px-2 text-sm bg-neutral-50 outline-none">
                   <option>Featured</option>
                   <option>Price: Low to High</option>
                   <option>Price: High to Low</option>
                   <option>Avg. Customer Review</option>
                </select>
             </div>

             <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div *ngFor="let p of products()" class="border border-neutral-200 rounded-md bg-white p-4 hover:shadow-lg transition-shadow">
                   <div class="h-40 flex items-center justify-center mb-4 cursor-pointer" [routerLink]="['/products', p._id]">
                      <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                   </div>
                   <div class="space-y-1">
                      <a [routerLink]="['/products', p._id]" class="text-sm font-medium text-neutral-800 hover:text-primary hover:underline line-clamp-2 leading-snug">
                         {{ p.name }}
                      </a>
                      <div class="flex items-center gap-1 text-xs">
                         <span class="text-amber-500 font-bold">★★★★☆</span>
                         <span class="text-neutral-400">({{ p.numReviews || 0 }})</span>
                      </div>
                      <div class="text-lg font-bold text-neutral-charcoal">
                         R{{ p.price | number:'1.0-0' }}
                      </div>
                      <div class="text-xs text-neutral-500">
                         Ships from Chommie
                      </div>
                   </div>
                </div>
             </div>

             <!-- Pagination Mock -->
             <div class="flex justify-center mt-8 gap-2 text-sm">
                <button class="px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50" disabled>Previous</button>
                <button class="px-3 py-1 border border-neutral-300 bg-neutral-100 rounded font-bold">1</button>
                <button class="px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-50">2</button>
                <button class="px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-50">3</button>
                <button class="px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-50">Next</button>
             </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SellerProfileComponent implements OnInit {
  seller = signal<any | null>(null);
  products = signal<any[]>([]);
  activeTab = signal<'products' | 'reviews'>('products');
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const vendorId = params['id'];
      if (vendorId) {
        this.loadSeller(vendorId);
        this.loadProducts(vendorId);
      }
    });
  }

  loadSeller(id: string) {
    this.authService.getProfile(id).subscribe(data => this.seller.set(data));
  }

  loadProducts(id: string) {
    this.productService.getProductsByCategory('').subscribe(all => {
      // Temporary filtering until getProductsByVendor is added
      this.products.set((all as any[]).filter(p => p.vendorId === id));
    });
  }
}