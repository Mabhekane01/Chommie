import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
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
           <div class="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shadow-sm">
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
                       <div class="flex items-center gap-1">
                          <span class="text-amber-500 text-[10px]">★ {{ product.ratings || 0 }}</span>
                          <span class="text-neutral-400 text-[10px]">({{ product.numReviews || 0 }})</span>
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
        <!-- ORIGINAL DESKTOP UI (UNTOUCHED) -->
        <!-- Top Bar / Breadcrumbs & Result Count -->
        <div class="shadow-sm border-b border-neutral-200 bg-white sticky top-[124px] z-30">
          <div class="w-full px-4 py-3 flex justify-between items-center">
              <div class="text-sm text-neutral-charcoal">
                  <span class="font-bold">{{ products().length }}</span> results for <span class="text-primary font-bold">"{{ searchQuery || selectedCategory() || 'All Products' }}"</span>
              </div>
              
              <div class="flex items-center gap-2">
                  <span class="text-xs text-neutral-500">Sort by:</span>
                  <select 
                    (change)="onSortChange($event)" 
                    class="bg-neutral-100 border border-neutral-300 text-xs rounded-md px-2 py-1 outline-none cursor-pointer hover:bg-neutral-200"
                  >
                    <option value="createdAt:desc">Newest Arrivals</option>
                    <option value="price:asc">Price: Low to High</option>
                    <option value="price:desc">Price: High to Low</option>
                    <option value="ratings:desc">Avg. Customer Review</option>
                  </select>
              </div>
          </div>
        </div>

        <div class="w-full px-4 py-6">
          <div class="flex flex-col lg:flex-row gap-6">
            
            <!-- Sidebar Filters (Amazon Style) -->
            <aside class="w-full lg:w-64 flex-shrink-0 space-y-6">
              
              <!-- Department -->
              <div class="space-y-2">
                <h3 class="font-bold text-sm text-neutral-charcoal">Delivery Day</h3>
                <label class="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary">
                   <span class="text-sm">Get It by Tomorrow</span>
                </label>
              </div>

              <!-- Department -->
              <div class="space-y-2">
                <h3 class="font-bold text-sm text-neutral-charcoal">{{ ts.t('sidebar.shop_by_dept') }}</h3>
                <ul class="space-y-1 ml-1">
                  <li 
                    (click)="filterByCategory('')" 
                    class="cursor-pointer text-sm hover:text-primary transition-colors"
                    [class.font-bold]="selectedCategory() === ''"
                  >
                    Any Department
                  </li>
                  <li 
                    *ngFor="let cat of categories" 
                    (click)="filterByCategory(cat)"
                    class="cursor-pointer text-sm hover:text-primary transition-colors"
                    [class.font-bold]="selectedCategory() === cat"
                  >
                    {{ cat }}
                  </li>
                </ul>
              </div>

              <!-- Brands -->
              <div class="space-y-2">
                  <h3 class="font-bold text-sm text-neutral-charcoal">Brands</h3>
                  <div class="space-y-1">
                      <label *ngFor="let brand of availableBrands()" class="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" [checked]="selectedBrands().includes(brand)" (change)="toggleBrand(brand)" class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary">
                          <span class="text-sm group-hover:text-primary transition-colors">{{ brand }}</span>
                      </label>
                  </div>
              </div>

              <!-- Customer Reviews -->
              <div class="space-y-2">
                  <h3 class="font-bold text-sm text-neutral-charcoal">Avg. Customer Review</h3>
                  <div class="space-y-1">
                      <div (click)="setRating(4)" class="flex items-center gap-1 cursor-pointer hover:text-primary text-sm group">
                          <span class="text-amber-400">★★★★☆</span> <span class="text-neutral-600 group-hover:text-primary">& Up</span>
                      </div>
                      <div (click)="setRating(3)" class="flex items-center gap-1 cursor-pointer hover:text-primary text-sm group">
                          <span class="text-amber-400">★★★☆☆</span> <span class="text-neutral-600 group-hover:text-primary">& Up</span>
                      </div>
                      <div (click)="setRating(2)" class="flex items-center gap-1 cursor-pointer hover:text-primary text-sm group">
                          <span class="text-amber-400">★★☆☆☆</span> <span class="text-neutral-600 group-hover:text-primary">& Up</span>
                      </div>
                  </div>
              </div>

              <!-- Price -->
              <div class="space-y-2">
                  <h3 class="font-bold text-sm text-neutral-charcoal">Price</h3>
                  <div class="space-y-1 text-sm ml-1">
                     <div (click)="setPriceRange(0, 500)" class="cursor-pointer hover:text-primary">Under R500</div>
                     <div (click)="setPriceRange(500, 1000)" class="cursor-pointer hover:text-primary">R500 - R1,000</div>
                     <div (click)="setPriceRange(1000, 2000)" class="cursor-pointer hover:text-primary">R1,000 - R2,000</div>
                     <div (click)="setPriceRange(2000, null)" class="cursor-pointer hover:text-primary">Over R2,000</div>
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                      <input [(ngModel)]="customMin" type="number" placeholder="Min" class="w-16 px-2 py-1 border border-neutral-300 rounded text-xs">
                      <input [(ngModel)]="customMax" type="number" placeholder="Max" class="w-16 px-2 py-1 border border-neutral-300 rounded text-xs">
                      <button (click)="applyCustomPrice()" class="px-3 py-1 bg-white border border-neutral-300 rounded text-xs hover:bg-neutral-50 shadow-sm">Go</button>
                  </div>
              </div>

              <!-- Availability -->
              <div class="space-y-2">
                   <h3 class="font-bold text-sm text-neutral-charcoal">Availability</h3>
                   <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" [checked]="inStockOnly()" (change)="toggleInStock()" class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary">
                      <span class="text-sm">Include Out of Stock</span>
                   </label>
              </div>
              
              <div class="space-y-2">
                   <h3 class="font-bold text-sm text-neutral-charcoal">Special Offers</h3>
                   <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" [checked]="onlyDeals()" (change)="toggleDeals()" class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary">
                      <span class="text-sm text-primary font-medium">Lightning Deals</span>
                   </label>
              </div>
            </aside>

            <!-- Main Grid -->
            <main class="flex-grow">
              
              <div *ngIf="loading()" class="py-20 flex justify-center">
                  <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" *ngIf="!loading()">
                <div *ngFor="let product of products()" class="group relative flex flex-col bg-white border border-neutral-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow">
                  
                  <!-- Badge -->
                  <div class="absolute top-2 left-2 z-20 flex flex-col gap-1">
                     <div *ngIf="product.isLightningDeal" class="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm uppercase">
                        Deal
                     </div>
                  </div>

                  <!-- Image -->
                  <div class="relative h-56 p-4 flex items-center justify-center bg-neutral-50 cursor-pointer" [routerLink]="['/products', product.id || product._id]">
                     <img [src]="product.images[0]" [alt]="product.name" class="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105">
                  </div>

                  <!-- Info -->
                  <div class="p-3 flex flex-col flex-grow space-y-2">
                    <h2 class="text-sm font-medium text-neutral-charcoal line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer" [routerLink]="['/products', product.id || product._id]">
                      {{ product.name }}
                    </h2>
                    
                    <div class="flex items-center gap-1 text-xs">
                         <span class="text-amber-500 font-bold">{{ product.ratings || 0 }}</span>
                         <div class="flex text-amber-500">
                           <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product.ratings || 0) ? '★' : '☆' }}</span>
                         </div>
                         <span class="text-neutral-400">({{ product.numReviews || 0 }})</span>
                    </div>

                    <div class="mt-1">
                      <div class="flex items-baseline gap-1.5">
                          <span class="text-lg font-bold text-neutral-charcoal">R{{ (product.discountPrice || product.price) | number:'1.0-0' }}</span>
                          <span *ngIf="product.discountPrice" class="text-xs text-neutral-500 line-through">R{{ product.price | number:'1.0-0' }}</span>
                      </div>
                    </div>
                    
                    <div class="text-[10px] text-neutral-500">
                      Get it as soon as <span class="font-bold text-neutral-700">Tomorrow, Jan 15</span>
                    </div>

                    <div class="mt-auto pt-3">
                        <button (click)="addToCart(product)" class="w-full btn-primary py-1.5 text-xs">{{ ts.t('product.add_to_cart') }}</button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>

          <!-- Floating Comparison Bar -->
          <div *ngIf="comparisonService.compareList().length > 0" class="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-300 shadow-2xl p-4 z-50 animate-slide-up">
              <div class="w-full px-6 flex justify-between items-center">
                  <div class="flex items-center gap-4">
                      <h3 class="font-bold text-sm text-neutral-charcoal">Compare Items ({{ comparisonService.compareList().length }})</h3>
                      <div class="flex gap-2">
                          <div *ngFor="let item of comparisonService.compareList().slice(0, 4)" class="w-10 h-10 border border-neutral-200 rounded bg-white p-1">
                              <img [src]="item.images[0]" class="w-full h-full object-contain">
                          </div>
                      </div>
                  </div>
                  <div class="flex items-center gap-3">
                     <button (click)="comparisonService.clearComparison()" class="text-sm text-neutral-500 hover:text-neutral-700 hover:underline">Clear</button>
                     <a routerLink="/compare" class="btn-primary py-2 px-6 text-sm">Compare</a>
                  </div>
              </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products = signal<any[]>([]);
  loading = signal(true);
  searchQuery = '';
  
  // Filters State
  selectedCategory = signal('');
  selectedBrands = signal<string[]>([]);
  availableBrands = signal<string[]>(['Samsung', 'Apple', 'Sony', 'Nike', 'Adidas', 'Defy', 'Hisense']); // Mock brands for now
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  minRating = signal<number | null>(null);
  inStockOnly = signal(false);
  onlyDeals = signal(false);
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  
  customMin = '';
  customMax = '';

  categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'];
  Math = Math;
  currentLocation = signal(localStorage.getItem('delivery_location') || 'South Africa');
  private searchSubject = new Subject<string>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public comparisonService: ComparisonService,
    public ts: TranslationService,
    private route: ActivatedRoute,
    public deviceService: DeviceService
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      if (params['deals']) {
        this.onlyDeals.set(params['deals'] === 'true');
      }
      if (params['filter'] === 'buy-again') {
          // In a real app, fetch from orderService.getOrders()
          this.searchQuery = 'Previously Purchased';
      }
      this.applyFilters();
    });
  }

  applyFilters() {
    this.loading.set(true);
    const filters: any = {
      query: this.searchQuery || undefined,
      category: this.selectedCategory() || undefined,
      brands: this.selectedBrands().length ? this.selectedBrands() : undefined,
      minPrice: this.minPrice() !== null ? this.minPrice() : undefined,
      maxPrice: this.maxPrice() !== null ? this.maxPrice() : undefined,
      minRating: this.minRating() !== null ? this.minRating() : undefined,
      inStock: this.inStockOnly() ? true : undefined,
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

  toggleBrand(brand: string) {
    this.selectedBrands.update(brands => {
      if (brands.includes(brand)) {
        return brands.filter(b => b !== brand);
      } else {
        return [...brands, brand];
      }
    });
    this.applyFilters();
  }

  filterByCategory(category: string) {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  setRating(rating: number) {
    this.minRating.set(rating);
    this.applyFilters();
  }

  setPriceRange(min: number | null, max: number | null) {
    this.minPrice.set(min);
    this.maxPrice.set(max);
    this.applyFilters();
  }

  applyCustomPrice() {
    const min = this.customMin ? parseFloat(this.customMin) : null;
    const max = this.customMax ? parseFloat(this.customMax) : null;
    this.setPriceRange(min, max);
  }

  toggleInStock() {
    this.inStockOnly.update(v => !v);
    this.applyFilters();
  }

  toggleDeals() {
    this.onlyDeals.update(v => !v);
    this.applyFilters();
  }

  onSortChange(event: any) {
    const [field, order] = event.target.value.split(':');
    this.sortBy.set(field);
    this.sortOrder.set(order as 'asc' | 'desc');
    this.applyFilters();
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  resetFilters() {
    this.selectedCategory.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.minRating.set(null);
    this.inStockOnly.set(false);
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
