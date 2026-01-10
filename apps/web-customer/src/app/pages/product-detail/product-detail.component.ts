import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8" *ngIf="product()">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- Product Image -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <img *ngIf="product()!.images?.length" [src]="product()!.images[0]" [alt]="product()!.name" class="w-full h-96 object-contain p-4">
          <div *ngIf="!product()!.images?.length" class="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
        </div>

        <!-- Details -->
        <div>
          <h1 class="text-3xl font-bold mb-2">{{ product()!.name }}</h1>
          <div class="flex items-center mb-4">
            <span class="text-yellow-500 text-xl">★</span>
            <span class="font-bold ml-1">{{ product()!.ratings | number:'1.1-1' }}</span>
            <span class="text-gray-500 ml-2">({{ product()!.numReviews }} reviews)</span>
          </div>
          <p class="text-gray-600 mb-6 text-lg">{{ product()!.description }}</p>
          <div class="text-3xl font-bold text-green-800 mb-6">R{{ product()!.price | number:'1.2-2' }}</div>
          
          <div class="flex gap-4">
            <button (click)="addToCart()" class="flex-1 bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors shadow-md">
              Add to Cart
            </button>
            <button (click)="addToWishlist()" class="bg-white border-2 border-gray-200 text-gray-600 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              ❤️
            </button>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div class="mb-12" *ngIf="relatedProducts().length > 0">
        <h2 class="text-2xl font-bold mb-6">Customers also viewed</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div *ngFor="let p of relatedProducts()" class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer" [routerLink]="['/products', p.id || p._id]">
            <div class="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
              <img *ngIf="p.images?.length" [src]="p.images[0]" [alt]="p.name" class="object-cover h-full w-full">
            </div>
            <h3 class="font-semibold text-sm truncate">{{ p.name }}</h3>
            <p class="text-green-800 font-bold text-sm">R{{ p.price | number:'1.2-2' }}</p>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        <!-- Review Form -->
        <div class="mb-8 p-4 bg-gray-50 rounded-lg" *ngIf="userId">
          <h3 class="font-bold mb-4">Write a Review</h3>
          <div class="flex gap-2 mb-4">
            <span *ngFor="let star of [1,2,3,4,5]" 
                  (click)="newRating = star"
                  class="cursor-pointer text-2xl"
                  [ngClass]="star <= newRating ? 'text-yellow-500' : 'text-gray-300'">★</span>
          </div>
          <textarea [(ngModel)]="newComment" rows="3" class="w-full p-2 border rounded-lg mb-4" placeholder="Share your thoughts..."></textarea>
          <button (click)="submitReview()" [disabled]="submitting()" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
            Submit Review
          </button>
        </div>
        <div *ngIf="!userId" class="mb-8 text-gray-500 italic">Please sign in to write a review.</div>

        <!-- Review List -->
        <div class="space-y-6">
          <div *ngFor="let review of reviews()" class="border-b pb-6 last:border-0">
            <div class="flex justify-between items-start mb-2">
              <div>
                <span class="font-bold">{{ review.userName }}</span>
                <div class="text-yellow-500 text-sm">
                  <span *ngFor="let s of [1,2,3,4,5]">{{ s <= review.rating ? '★' : '☆' }}</span>
                </div>
              </div>
              <span class="text-gray-400 text-sm">{{ review.createdAt | date }}</span>
            </div>
            <p class="text-gray-700">{{ review.comment }}</p>
          </div>
          <div *ngIf="reviews().length === 0" class="text-center text-gray-500">No reviews yet. Be the first!</div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product = signal<any | null>(null);
  reviews = signal<any[]>([]);
  relatedProducts = signal<any[]>([]);
  userId = localStorage.getItem('user_id');
  newRating = 5;
  newComment = '';
  submitting = signal(false);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
        this.loadReviews(id);
        this.loadRelated(id);
      }
    });
  }

  loadProduct(id: string) {
    this.productService.getProduct(id).subscribe(p => this.product.set(p));
  }

  loadReviews(id: string) {
    this.productService.getReviews(id).subscribe(r => this.reviews.set(r));
  }

  loadRelated(id: string) {
    this.productService.getRelatedProducts(id).subscribe(rp => this.relatedProducts.set(rp));
  }

  addToCart() {
    if (this.product()) {
      this.cartService.addToCart(this.product()!);
    }
  }

  addToWishlist() {
    if (this.product() && this.userId) {
      this.productService.addToWishlist(this.userId, this.product()!.id || this.product()!._id).subscribe(() => {
        alert('Added to wishlist!');
      });
    }
  }

  submitReview() {
    if (!this.product() || !this.userId) return;
    
    this.submitting.set(true);
    const review = {
      productId: this.product()!.id || this.product()!._id,
      userId: this.userId,
      userName: 'Chommie User',
      rating: this.newRating,
      comment: this.newComment
    };

    this.productService.addReview(review).subscribe({
      next: (res) => {
        this.reviews.update(r => [res, ...r]);
        this.newComment = '';
        this.newRating = 5;
        this.submitting.set(false);
        this.loadProduct(this.product()!.id || this.product()!._id);
      },
      error: () => this.submitting.set(false)
    });
  }
}