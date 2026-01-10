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
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">My Wishlist</h1>

      <div *ngIf="loading()" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>

      <div *ngIf="!loading() && (!wishlist() || wishlist()!.products.length === 0)" class="text-center py-10 bg-white rounded-lg shadow">
        <p class="text-gray-500 text-xl mb-4">Your wishlist is empty.</p>
        <button routerLink="/products" class="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800 transition-colors">
          Explore Products
        </button>
      </div>

      <div *ngIf="!loading() && wishlist() && wishlist()!.products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div *ngFor="let product of wishlist()!.products" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
          <button (click)="removeFromWishlist(product.id)" class="absolute top-2 right-2 bg-red-100 p-1 rounded-full text-red-600 hover:bg-red-200 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <div class="h-48 bg-gray-200 flex items-center justify-center cursor-pointer" [routerLink]="['/products', product.id]">
            <img *ngIf="product.images && product.images.length > 0" [src]="product.images[0]" [alt]="product.name" class="object-cover h-full w-full">
            <span *ngIf="!product.images || product.images.length === 0" class="text-gray-400">No Image</span>
          </div>
          <div class="p-4">
            <h2 class="text-lg font-semibold mb-2 truncate cursor-pointer hover:text-green-700" [routerLink]="['/products', product.id]">{{ product.name }}</h2>
            <div class="flex justify-between items-center mb-4">
              <span class="text-xl font-bold text-green-800">R{{ product.price | number:'1.2-2' }}</span>
            </div>
            <button (click)="moveToCart(product)" class="w-full bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition-colors shadow-sm">
              Add to Cart
            </button>
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
