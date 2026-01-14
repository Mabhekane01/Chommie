import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32 pt-6">
      <div class="w-full px-6 animate-fade-in">
        <h1 class="text-2xl font-bold mb-6">Your Wish Lists</h1>
        
        <div class="flex flex-col lg:flex-row gap-6">
            
            <!-- Left Sidebar: Lists Management -->
            <aside class="w-full lg:w-64 flex-shrink-0 space-y-4">
                <div class="bg-white border border-neutral-300 rounded-lg p-4 shadow-sm">
                    <h3 class="font-bold text-sm text-[#222222] mb-4 border-b border-neutral-100 pb-2 uppercase tracking-tight">{{ ts.t('nav.wishlist') }}</h3>
                    <ul class="space-y-1">
                        <li class="bg-neutral-100 rounded-md">
                            <a class="block px-3 py-2 text-sm font-bold text-primary border-l-4 border-primary">{{ ts.t('nav.wishlist') }}</a>
                        </li>
                        <li class="hover:bg-neutral-50 rounded-md transition-colors">
                            <a class="block px-3 py-2 text-sm text-neutral-600">Shopping List</a>
                        </li>
                    </ul>
                    <button class="w-full mt-6 text-xs text-primary font-bold hover:underline flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        Create a List
                    </button>
                </div>
            </aside>

            <!-- Main Content: List Details -->
            <main class="flex-grow">
                <div class="bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
                    
                    <!-- List Header -->
                    <div class="p-6 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-start">
                        <div>
                            <h1 class="text-2xl font-medium text-[#222222] mb-1">{{ ts.t('wishlist.title') }}</h1>
                            <p class="text-xs text-neutral-500">Public • Created for you</p>
                        </div>
                        <div class="flex gap-3">
                            <button class="text-xs font-bold text-neutral-600 hover:text-primary transition-colors">Send list to others</button>
                            <span class="text-neutral-300">|</span>
                            <button class="text-xs font-bold text-neutral-600 hover:text-primary transition-colors">More</button>
                        </div>
                    </div>

                    <!-- Toolbar -->
                    <div class="px-6 py-3 border-b border-neutral-100 flex justify-between items-center bg-white">
                        <div class="flex items-center gap-4">
                            <input type="text" placeholder="Search this list" class="border border-neutral-300 rounded-[3px] px-2 py-1 text-xs w-48 focus:border-primary outline-none">
                            <select class="border border-neutral-300 bg-neutral-100 rounded-[3px] px-2 py-1 text-xs outline-none cursor-pointer">
                                <option>Filter & Sort</option>
                            </select>
                        </div>
                    </div>

                    <!-- List Content -->
                    <div class="p-6">
                        <!-- Loading State -->
                        <div *ngIf="loading()" class="py-20 flex justify-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>

                        <!-- Empty State -->
                        <div *ngIf="!loading() && (!wishlist() || wishlist()!.products.length === 0)" class="py-20 text-center">
                            <div class="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg class="w-12 h-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <p class="text-lg font-bold text-[#222222] mb-2">{{ ts.t('wishlist.empty') }}</p>
                            <p class="text-sm text-neutral-500 mb-8">{{ ts.t('wishlist.add_items') }}</p>
                            <a routerLink="/products" class="btn-primary py-2 px-8 rounded-[3px] text-xs inline-block">Continue shopping</a>
                        </div>

                        <!-- Items List -->
                        <div *ngIf="!loading() && wishlist() && wishlist()!.products.length > 0" class="divide-y divide-neutral-100">
                            <div *ngFor="let product of wishlist()!.products" class="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row gap-6">
                                
                                <!-- Product Image -->
                                <div class="w-full md:w-40 h-40 flex-shrink-0 flex items-center justify-center cursor-pointer" [routerLink]="['/products', product.id]">
                                    <img *ngIf="product.images && product.images.length > 0" [src]="product.images[0]" [alt]="product.name" class="max-w-full max-h-full object-contain mix-blend-multiply">
                                </div>

                                <!-- Product Info -->
                                <div class="flex-grow space-y-2">
                                    <h2 class="text-base font-medium text-[#222222] hover:text-primary hover:underline cursor-pointer leading-snug line-clamp-2" [routerLink]="['/products', product.id]">
                                        {{ product.name }}
                                    </h2>
                                    <div class="flex items-center gap-1 text-xs">
                                        <div class="flex text-amber-500">
                                            <span *ngFor="let s of [1,2,3,4,5]">★</span>
                                        </div>
                                        <span class="text-neutral-500">(124)</span>
                                    </div>
                                    <div class="flex items-baseline gap-2">
                                        <span class="text-xl font-bold text-[#222222]">R{{ product.price | number:'1.0-0' }}</span>
                                        <span class="text-xs text-neutral-500 bg-neutral-100 px-1 rounded" *ngIf="product.bnplEligible">BNPL Available</span>
                                    </div>
                                    <p class="text-[11px] text-neutral-500">Added {{ (product.addedAt || wishlist()!.updatedAt) | date:'MMMM d, y' }}</p>
                                </div>

                                <!-- Actions -->
                                <div class="w-full md:w-48 flex flex-col gap-2 justify-start pt-2">
                                    <button (click)="moveToCart(product)" class="btn-primary py-1.5 rounded-[3px] text-xs w-full font-normal shadow-sm">
                                        {{ ts.t('product.add_to_cart') }}
                                    </button>
                                    <button (click)="removeFromWishlist(product.id)" class="btn-secondary py-1 rounded-[3px] text-[11px] w-full font-normal shadow-sm">
                                        Delete item
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </main>

      </div>
    </div>
  `
})
export class WishlistComponent implements OnInit {
  wishlist = signal<any | null>(null);
  loading = signal(true);
  userId = localStorage.getItem('user_id');

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public ts: TranslationService
  ) {}

  ngOnInit() {
    if (this.userId) {
      this.loadWishlist();
    } else {
      this.loading.set(false);
    }
  }

  loadWishlist() {
    this.loading.set(true);
    this.productService.getWishlist(this.userId!).subscribe({
      next: (data) => {
        this.wishlist.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  removeFromWishlist(productId: string) {
    this.productService.removeFromWishlist(this.userId!, productId).subscribe(updated => {
      this.wishlist.set(updated);
    });
  }

  moveToCart(product: any) {
    this.cartService.addToCart(product);
    this.removeFromWishlist(product.id);
  }
}