import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ComparisonService } from '../../services/comparison.service';
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-4 max-w-[1500px]">
      <div class="flex flex-col md:flex-row gap-6">
        
        <!-- Sidebar Filters (Col 3) -->
        <aside class="w-full md:w-64 flex-shrink-0 space-y-6">
          <!-- Department -->
          <div>
            <h3 class="font-bold text-sm mb-2">Department</h3>
            <ul class="text-sm space-y-1">
              <li 
                (click)="filterByCategory('')" 
                [class.font-bold]="selectedCategory() === ''"
                class="cursor-pointer hover:text-action transition-colors"
              >All Departments</li>
              <li 
                *ngFor="let cat of categories" 
                (click)="filterByCategory(cat)"
                [class.font-bold]="selectedCategory() === cat"
                class="cursor-pointer hover:text-action transition-colors pl-2"
              >{{ cat }}</li>
            </ul>
          </div>
          
          <!-- Brands -->
          <div *ngIf="availableBrands().length > 0">
            <h3 class="font-bold text-sm mb-2">Brands</h3>
            <ul class="text-sm space-y-1">
              <li *ngFor="let brand of availableBrands()" class="flex items-center gap-2">
                 <input type="checkbox" [checked]="selectedBrands().includes(brand)" (change)="toggleBrand(brand)" class="rounded border-gray-300 text-action focus:ring-action cursor-pointer">
                 <span class="text-gray-700 hover:text-action cursor-pointer" (click)="toggleBrand(brand)">{{ brand }}</span>
              </li>
            </ul>
          </div>

          <!-- Customer Review -->
          <div>
            <h3 class="font-bold text-sm mb-2">Customer Reviews</h3>
            <ul class="text-sm space-y-1">
              <li (click)="setRating(4)" class="cursor-pointer flex items-center gap-1 hover:text-action group">
                <span class="text-yellow-500">★★★★</span><span class="text-gray-300">★</span> 
                <span [class.font-bold]="minRating() === 4" class="group-hover:underline">& Up</span>
              </li>
              <li (click)="setRating(3)" class="cursor-pointer flex items-center gap-1 hover:text-action group">
                <span class="text-yellow-500">★★★</span><span class="text-gray-300">★★</span> 
                <span [class.font-bold]="minRating() === 3" class="group-hover:underline">& Up</span>
              </li>
              <li (click)="setRating(2)" class="cursor-pointer flex items-center gap-1 hover:text-action group">
                <span class="text-yellow-500">★★</span><span class="text-gray-300">★★★</span> 
                <span [class.font-bold]="minRating() === 2" class="group-hover:underline">& Up</span>
              </li>
              <li (click)="setRating(1)" class="cursor-pointer flex items-center gap-1 hover:text-action group">
                <span class="text-yellow-500">★</span><span class="text-gray-300">★★★★</span> 
                <span [class.font-bold]="minRating() === 1" class="group-hover:underline">& Up</span>
              </li>
            </ul>
          </div>

          <!-- Price Range -->
          <div>
            <h3 class="font-bold text-sm mb-2">Price</h3>
            <div class="flex flex-col gap-2">
               <button (click)="setPriceRange(0, 500)" class="text-sm text-left hover:text-action" [class.font-bold]="maxPrice() === 500">Under R500</button>
               <button (click)="setPriceRange(500, 1000)" class="text-sm text-left hover:text-action" [class.font-bold]="minPrice() === 500 && maxPrice() === 1000">R500 to R1,000</button>
               <button (click)="setPriceRange(1000, 2000)" class="text-sm text-left hover:text-action" [class.font-bold]="minPrice() === 1000 && maxPrice() === 2000">R1,000 to R2,000</button>
               <button (click)="setPriceRange(2000, null)" class="text-sm text-left hover:text-action" [class.font-bold]="minPrice() === 2000">R2,000 & Above</button>
               
               <div class="flex gap-2 items-center mt-2">
                  <input type="number" [(ngModel)]="customMin" placeholder="Min" class="w-full border rounded px-2 py-1 text-xs">
                  <input type="number" [(ngModel)]="customMax" placeholder="Max" class="w-full border rounded px-2 py-1 text-xs">
                  <button (click)="applyCustomPrice()" class="border rounded px-2 py-1 text-xs hover:bg-gray-50">Go</button>
               </div>
            </div>
          </div>

          <!-- Availability -->
          <div>
            <h3 class="font-bold text-sm mb-2">Availability</h3>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" [checked]="inStockOnly()" (change)="toggleInStock()" class="rounded border-gray-300 text-action focus:ring-action">
              Include Out of Stock
            </label>
          </div>

          <!-- Deals -->
          <div>
            <h3 class="font-bold text-sm mb-2">Deals & Discounts</h3>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" [checked]="onlyDeals()" (change)="toggleDeals()" class="rounded border-gray-300 text-action focus:ring-action">
              Today's Deals
            </label>
          </div>
        </aside>

        <!-- Main Content (Col 9) -->
        <main class="flex-grow">
          <!-- Top Bar -->
          <div class="flex justify-between items-center mb-4 pb-4 border-b">
            <div class="text-sm">
              <span class="font-bold">{{ products().length }}</span> results
              <span *ngIf="searchQuery"> for <span class="text-[#c45500] font-bold">"{{ searchQuery }}"</span></span>
            </div>
            
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-600">Sort by:</label>
              <select 
                (change)="onSortChange($event)" 
                class="bg-gray-100 border border-gray-300 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-action shadow-sm"
              >
                <option value="createdAt:desc">Featured</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="ratings:desc">Avg. Customer Review</option>
                <option value="createdAt:desc">Newest Arrivals</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading()" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-action"></div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading() && products().length === 0" class="text-center py-20">
            <p class="text-gray-500 text-lg">No products found matching your criteria.</p>
            <button (click)="resetFilters()" class="mt-4 text-amazon-link hover:underline">Clear all filters</button>
          </div>

          <!-- Product Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let product of products()" class="flex flex-col border border-gray-200 rounded-sm overflow-hidden bg-white group hover:shadow-lg transition-shadow">
              
              <!-- Image -->
              <div class="h-64 flex items-center justify-center p-4 cursor-pointer relative" [routerLink]="['/products', product.id || product._id]">
                <img *ngIf="product.images?.length" [src]="product.images[0]" [alt]="product.name" class="object-contain h-full w-full transition-transform group-hover:scale-105">
                <div *ngIf="!product.images?.length" class="text-gray-400 text-xs">No Image</div>
                
                <div *ngIf="product.bnplEligible" class="absolute top-2 left-2 bg-[#1B4332] text-white text-[10px] font-bold px-2 py-1 rounded">
                    BNPL AVAILABLE
                </div>
              </div>

              <!-- Info -->
              <div class="p-4 flex flex-col flex-grow">
                <div class="flex flex-wrap gap-1 mb-1" *ngIf="product.badges?.length">
                   <div *ngFor="let badge of product.badges">
                      <div *ngIf="badge === 'BEST_SELLER'" class="bg-[#E47911] text-white text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-tighter">
                         Best Seller
                      </div>
                   </div>
                </div>
                <h2 class="text-sm font-medium leading-snug mb-1 text-black cursor-pointer hover:text-action line-clamp-2" [routerLink]="['/products', product.id || product._id]">
                  {{ product.name }}
                </h2>

                <div class="flex items-center mb-1">
                     <div class="flex text-yellow-500 text-sm">
                       <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product.ratings || 0) ? '★' : '☆' }}</span>
                     </div>
                     <span class="text-xs text-amazon-link ml-1 hover:underline cursor-pointer">{{ product.numReviews || 0 }}</span>
                </div>
                
                <div class="mb-1">
                  <span class="text-lg font-medium text-black">R{{ product.price | number:'1.2-2' }}</span>
                </div>

                <div class="text-xs text-gray-600 mb-4">
                    Get it by <span class="font-bold">Tomorrow, Jan 13</span>
                    <br>
                    FREE Delivery to <span class="font-bold">{{ currentLocation() }}</span>
                </div>

                <div class="mt-auto">
                    <button (click)="addToCart(product)" class="w-full bg-action hover:bg-action-hover text-white py-1.5 rounded-full text-xs font-medium shadow-sm transition-colors mb-2">
                      Add to Cart
                    </button>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" 
                            [checked]="comparisonService.compareList().includes(product)"
                            (change)="toggleCompare(product)"
                            class="rounded border-gray-300 text-action focus:ring-action">
                        <label class="text-xs text-gray-600 cursor-pointer" (click)="toggleCompare(product)">Compare</label>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Floating Comparison Bar -->
      <div *ngIf="comparisonService.compareList().length > 0" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-2 z-50 animate-slide-up">
          <div class="container mx-auto max-w-[1500px] flex justify-between items-center">
              <div class="flex items-center gap-4">
                  <div *ngFor="let item of comparisonService.compareList()" class="relative group">
                      <div class="w-12 h-12 border border-gray-200 rounded bg-white flex items-center justify-center overflow-hidden">
                          <img [src]="item.images[0]" class="max-h-full max-w-full object-contain">
                      </div>
                      <button (click)="comparisonService.removeFromCompare(item.id || item._id)" class="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                  <span class="text-sm text-gray-700 ml-2">{{ comparisonService.compareList().length }} items selected</span>
              </div>
              <a routerLink="/compare" class="bg-[#F0C14B] border border-[#a88734] hover:bg-[#F4D078] text-[#111111] px-6 py-1.5 rounded-[20px] text-sm font-bold shadow-sm transition-colors">
                  Compare
              </a>
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