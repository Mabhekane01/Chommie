import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-amazon-bg min-h-screen py-8">
      <div class="container mx-auto px-4 max-w-[1200px]">
        
        <div class="flex flex-col md:flex-row gap-8">
            <!-- Left Sidebar (Glass) -->
            <div class="md:w-64 flex-shrink-0">
                <div class="glass-panel overflow-hidden">
                    <div class="bg-primary/10 p-4 border-b border-white/20 font-bold text-sm text-primary">Your Lists</div>
                    <div class="p-4 bg-white/40 border-l-4 border-action font-bold text-sm text-black">Wish List</div>
                    <div class="p-4 bg-white/20 text-sm text-gray-700 hover:text-action cursor-pointer transition-colors">Shopping List</div>
                    <div class="p-4 border-t border-white/20 text-xs text-action font-medium hover:underline cursor-pointer transition-all hover:pl-5">+ Create a List</div>
                </div>
            </div>

            <!-- Right: List Content (Glass) -->
            <div class="flex-grow glass-panel p-6">
                <div class="flex justify-between items-end border-b border-gray-200/50 pb-4 mb-6">
                    <h1 class="text-3xl font-light text-[#111111] tracking-tight">Wish List</h1>
                    <div class="flex gap-4 text-xs text-action font-bold">
                        <span class="hover:underline cursor-pointer">View as: List</span>
                        <span class="text-gray-300">|</span>
                        <span class="hover:underline cursor-pointer">Filter & Sort</span>
                    </div>
                </div>

                <div *ngIf="loading()" class="flex justify-center py-20">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-action"></div>
                </div>

                <div *ngIf="!loading() && (!wishlist() || wishlist()!.products.length === 0)" class="py-20 text-center">
                    <p class="text-gray-500 text-lg mb-6">Your list is empty. Add items you're interested in.</p>
                    <a routerLink="/products" class="glass-btn px-8 py-2 rounded-full">Continue shopping</a>
                </div>

                <div *ngIf="!loading() && wishlist() && wishlist()!.products.length > 0" class="divide-y divide-gray-200/30">
                    <div *ngFor="let product of wishlist()!.products" class="py-8 flex flex-col sm:flex-row gap-8 group">
                        
                        <!-- Product Image -->
                        <div class="w-44 h-44 flex-shrink-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-inner cursor-pointer relative overflow-hidden group-hover:shadow-lg transition-all" [routerLink]="['/products', product.id]">
                            <img *ngIf="product.images && product.images.length > 0" [src]="product.images[0]" [alt]="product.name" class="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110">
                        </div>

                        <!-- Product Details -->
                        <div class="flex-grow">
                            <h2 class="text-xl font-medium text-black hover:text-action hover:underline cursor-pointer mb-2 transition-colors" [routerLink]="['/products', product.id]">
                                {{ product.name }}
                            </h2>
                            <div class="flex items-center text-xs mb-3">
                                <div class="flex text-yellow-600">★★★★☆</div>
                                <span class="text-gray-500 ml-2">(45 reviews)</span>
                            </div>
                            <div class="text-2xl font-bold text-primary mb-3">
                                R{{ product.price | number:'1.2-2' }}
                            </div>
                            <div class="text-xs text-gray-500 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Added on {{ (product.addedAt || wishlist()!.updatedAt) | date:'mediumDate' }}
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="w-full sm:w-56 flex flex-col gap-3 justify-center">
                            <button (click)="moveToCart(product)" class="w-full glass-btn py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-xl transform transition-all active:scale-95">
                                Add to Cart
                            </button>
                            <button (click)="removeFromWishlist(product.id)" class="w-full bg-white/40 hover:bg-white/60 border border-white/60 text-[#111111] py-2 rounded-full text-sm shadow-sm transition-all text-center">
                                Delete
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>

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
    private cartService: CartService
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
