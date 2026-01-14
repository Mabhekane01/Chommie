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
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32">
      
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
    private route: ActivatedRoute
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