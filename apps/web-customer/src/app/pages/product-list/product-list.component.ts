import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ComparisonService } from '../../services/comparison.service';
import { TranslationService } from '../../services/translation.service';
import { DeviceService } from '../../services/device.service';
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE PRODUCT LIST UI -->
        <div class="w-full flex flex-col">
           <!-- Mobile Filter Chips -->
           <div class="sticky top-[152px] z-30 bg-white border-b border-neutral-200 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shadow-sm">
              <button (click)="resetFilters()" class="shrink-0 px-4 py-1.5 bg-neutral-100 rounded-full text-xs font-black uppercase tracking-widest border border-neutral-200">All</button>
              <button *ngFor="let cat of categories" 
                      (click)="filterByCategory(cat)"
                      class="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                      [ngClass]="selectedCategory() === cat ? 'bg-primary text-white shadow-md' : 'bg-white border border-neutral-200 text-neutral-600'">
                {{ cat }}
              </button>
           </div>

           <div class="p-4 bg-neutral-50/50 flex justify-between items-center">
              <span class="text-[10px] font-black uppercase tracking-widest text-neutral-400">{{ products().length }} Products Found</span>
              <div class="flex items-center gap-1">
                 <span class="text-[10px] font-bold text-neutral-500 uppercase">Sort:</span>
                 <select (change)="onSortChange($event)" class="text-[10px] font-black text-primary bg-transparent border-0 outline-none">
                    <option value="createdAt:desc">Newest</option>
                    <option value="price:asc">Price ↑</option>
                    <option value="price:desc">Price ↓</option>
                 </select>
              </div>
           </div>

           <div *ngIf="loading()" class="py-20 flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>

           <div *ngIf="!loading()" class="grid grid-cols-1 gap-1 bg-neutral-200">
              <div *ngFor="let product of products()" class="bg-white p-4 flex gap-4 transition-transform active:scale-[0.98]">
                 <div class="w-32 h-32 bg-neutral-50 rounded-xl p-2 flex items-center justify-center shrink-0" [routerLink]="['/products', product.id || product._id]">
                    <img [src]="product.images[0]" class="max-w-full max-h-full object-contain mix-blend-multiply">
                 </div>
                 <div class="flex-grow flex flex-col justify-between py-1">
                    <div class="space-y-1">
                       <h3 class="text-sm font-bold text-neutral-800 line-clamp-2 leading-tight" [routerLink]="['/products', product.id || product._id]">{{ product.name }}</h3>
                       
                       <div class="flex items-center gap-2">
                          <span class="text-amber-500 text-[10px]">★ {{ product.ratings || 0 }}</span>
                          <span class="text-neutral-400 text-[10px]">({{ product.numReviews || 0 }})</span>
                          <!-- Plus Badge Mobile -->
                          <span *ngIf="authService.isPlusMember()" class="bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-primary/20">Plus Arrival</span>
                       </div>

                       <div class="flex items-baseline gap-2">
                          <span class="text-lg font-black text-neutral-900">R{{ (product.discountPrice || product.price) | number:'1.0-0' }}</span>
                          <span *ngIf="product.discountPrice" class="text-xs text-neutral-400 line-through">R{{ product.price | number:'1.0-0' }}</span>
                       </div>
                    </div>
                    <div class="flex gap-2">
                       <button (click)="addToCart(product)" class="flex-grow bg-primary text-white text-[10px] font-black py-2 rounded-lg uppercase tracking-widest shadow-sm">Add to Cart</button>
                       <button (click)="toggleCompare(product)" class="px-3 border border-neutral-200 rounded-lg text-neutral-400">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      } @else {
        <!-- ORIGINAL DESKTOP UI (ENHANCED) -->
        <div class="shadow-sm border-b border-neutral-200 bg-white sticky top-[140px] lg:top-[156px] z-30">
          <div class="w-full px-4 py-3 flex justify-between items-center">
              <div class="text-sm text-neutral-charcoal font-medium">
                  <span class="font-black">{{ products().length }}</span> results for <span class="text-primary font-black italic">"{{ searchQuery || selectedCategory() || 'All Assets' }}"</span>
              </div>
              
              <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-neutral-400">Sequence by:</span>
                  <select 
                    (change)="onSortChange($event)" 
                    class="bg-neutral-50 border-2 border-neutral-200 text-[10px] font-black uppercase tracking-widest rounded-lg px-4 py-1.5 outline-none cursor-pointer hover:bg-neutral-100 transition-all"
                  >
                    <option value="createdAt:desc">Latest Node arrivals</option>
                    <option value="price:asc">Price: Ascending</option>
                    <option value="price:desc">Price: Descending</option>
                    <option value="ratings:desc">Top Neural Ratings</option>
                  </select>
              </div>
          </div>
        </div>

        <div class="w-full px-4 py-6">
          <div class="flex flex-col lg:flex-row gap-8">
            
            <!-- Sidebar Filters -->
            <aside class="w-full lg:w-64 flex-shrink-0 space-y-8">
              
              <!-- Chommie Plus Filter -->
              <div class="p-5 bg-primary/5 border border-primary/10 rounded-2xl space-y-3">
                 <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <h3 class="text-[10px] font-black uppercase tracking-widest text-primary">Plus Protocol</h3>
                 </div>
                 <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary">
                    <span class="text-xs font-bold text-neutral-600 group-hover:text-primary transition-colors">Plus-Eligible Logistics</span>
                 </label>
              </div>

              <!-- Department -->
              <div class="space-y-3">
                <h3 class="text-xs font-black uppercase tracking-widest text-neutral-400">Market Sectors</h3>
                <ul class="space-y-2 ml-1">
                  <li (click)="filterByCategory('')" class="cursor-pointer text-sm font-bold hover:text-primary transition-colors" [class.text-primary]="selectedCategory() === ''">Any Sector</li>
                  <li *ngFor="let cat of categories" 
                    (click)="filterByCategory(cat)"
                    class="cursor-pointer text-sm font-medium text-neutral-600 hover:text-primary transition-all flex items-center justify-between group"
                    [class.text-primary]="selectedCategory() === cat"
                    [class.font-black]="selectedCategory() === cat">
                    {{ cat }}
                    <svg class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
                  </li>
                </ul>
              </div>

              <!-- Price -->
              <div class="space-y-3">
                  <h3 class="text-xs font-black uppercase tracking-widest text-neutral-400">Valuation Range</h3>
                  <div class="space-y-2 text-sm font-bold text-neutral-600">
                     <div (click)="setPriceRange(0, 500)" class="cursor-pointer hover:text-primary transition-colors">Under R500</div>
                     <div (click)="setPriceRange(500, 1000)" class="cursor-pointer hover:text-primary transition-colors">R500 - R1,000</div>
                     <div (click)="setPriceRange(1000, 2000)" class="cursor-pointer hover:text-primary transition-colors">R1,000 - R2,000</div>
                     <div (click)="setPriceRange(2000, null)" class="cursor-pointer hover:text-primary transition-colors">Over R2,000</div>
                  </div>
              </div>
            </aside>

            <!-- Main Grid -->
            <main class="flex-grow">
              <div *ngIf="loading()" class="py-20 flex justify-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" *ngIf="!loading()">
                <div *ngFor="let product of products()" class="group relative flex flex-col bg-white border-2 border-neutral-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-500">
                  
                  <!-- Premium Badge Stack -->
                  <div class="absolute top-4 left-4 z-20 flex flex-col gap-2">
                     <div *ngIf="product.isLightningDeal" class="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest italic animate-pulse">Deal</div>
                     <div *ngIf="product.ratings >= 4.8" class="bg-[#131921] text-primary text-[9px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest border border-primary/30">Chommie Choice</div>
                  </div>

                  <!-- Image -->
                  <div class="relative h-64 p-6 flex items-center justify-center bg-neutral-50/50 cursor-pointer overflow-hidden" [routerLink]="['/products', product.id || product._id]">
                     <div class="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                     <img [src]="product.images[0]" [alt]="product.name" class="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110">
                  </div>

                  <!-- Info -->
                  <div class="p-6 flex flex-col flex-grow space-y-3">
                    <h2 class="text-sm font-bold text-[#222222] line-clamp-2 leading-tight group-hover:text-primary transition-colors cursor-pointer uppercase tracking-tight" [routerLink]="['/products', product.id || product._id]">
                      {{ product.name }}
                    </h2>
                    
                    <div class="flex items-center gap-2">
                         <div class="flex text-amber-400 text-xs">
                           <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product.ratings || 0) ? '★' : '☆' }}</span>
                         </div>
                         <span class="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">({{ product.numReviews || 0 }} signals)</span>
                    </div>

                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-black text-neutral-800 tracking-tighter italic">R{{ (product.discountPrice || product.price) | number:'1.0-0' }}</span>
                        <span *ngIf="product.discountPrice" class="text-xs text-neutral-400 line-through font-bold">R{{ product.price | number:'1.0-0' }}</span>
                    </div>
                    
                    <!-- Plus Membership Integration -->
                    <div class="pt-2 border-t border-neutral-50 flex items-center justify-between">
                       <div class="flex items-center gap-1.5">
                          <div class="w-5 h-5 bg-primary/10 rounded flex items-center justify-center text-primary">
                             <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          </div>
                          <span class="text-[9px] font-black uppercase tracking-widest text-emerald-600">Plus Delivery Tomorrow</span>
                       </div>
                    </div>

                    <div class="mt-auto pt-4">
                        <button (click)="addToCart(product)" class="w-full bg-[#FAF3E1] hover:bg-primary hover:text-white border-2 border-primary/10 text-[#222222] py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-sm">Initialize Cart</button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductListComponent implements OnInit {
  public authService = inject(AuthService);
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  public comparisonService = inject(ComparisonService);
  private route = inject(ActivatedRoute);

  products = signal<any[]>([]);
  loading = signal(true);
  searchQuery = '';
  
  // Filters State
  selectedCategory = signal('');
  selectedBrands = signal<string[]>([]);
  availableBrands = signal<string[]>(['Samsung', 'Apple', 'Sony', 'Nike', 'Adidas', 'Defy', 'Hisense']);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  minRating = signal<number | null>(null);
  inStockOnly = signal(false);
  onlyDeals = signal(false);
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  
  categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'];
  Math = Math;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) this.searchQuery = params['q'];
      if (params['category']) this.selectedCategory.set(params['category']);
      if (params['deals']) this.onlyDeals.set(params['deals'] === 'true');
      this.applyFilters();
    });
  }

  applyFilters() {
    this.loading.set(true);
    const filters: any = {
      query: this.searchQuery || undefined,
      category: this.selectedCategory() || undefined,
      minPrice: this.minPrice() !== null ? this.minPrice() : undefined,
      maxPrice: this.maxPrice() !== null ? this.maxPrice() : undefined,
      minRating: this.minRating() !== null ? this.minRating() : undefined,
      isLightningDeal: this.onlyDeals() ? true : undefined,
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder()
    };

    this.productService.getFilteredProducts(filters).subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  setPriceRange(min: number | null, max: number | null) {
    this.minPrice.set(min);
    this.maxPrice.set(max);
    this.applyFilters();
  }

  onSortChange(event: any) {
    const [field, order] = event.target.value.split(':');
    this.sortBy.set(field);
    this.sortOrder.set(order as 'asc' | 'desc');
    this.applyFilters();
  }

  resetFilters() {
    this.selectedCategory.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.minRating.set(null);
    this.onlyDeals.set(false);
    this.searchQuery = '';
    this.applyFilters();
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }

  toggleCompare(product: any) {
    if (this.comparisonService.compareList().some(p => (p.id || p._id) === (product.id || product._id))) {
      this.comparisonService.removeFromCompare(product.id || product._id);
    } else {
      this.comparisonService.addToCompare(product);
    }
  }
}