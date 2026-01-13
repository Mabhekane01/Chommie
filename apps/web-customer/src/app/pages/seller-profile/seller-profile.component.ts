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
    <div class="bg-white min-h-screen pb-12">
      <!-- Seller Banner -->
      <div class="bg-[#F7F7F7] border-b border-gray-200 py-8">
        <div class="container mx-auto px-4 max-w-[1200px]">
          <div class="flex flex-col md:flex-row gap-6 items-center md:items-end">
            <div class="w-32 h-32 bg-white border border-gray-300 rounded-sm flex items-center justify-center shadow-sm">
              <span class="text-4xl font-bold text-primary">{{ (seller()?.storeName || 'S')[0] }}</span>
            </div>
            <div class="flex-grow text-center md:text-left">
              <h1 class="text-3xl font-bold text-[#111111] mb-2">{{ seller()?.storeName || 'Chommie Seller' }}</h1>
              <div class="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div class="flex text-yellow-500">
                  <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(seller()?.sellerRating || 0) ? '★' : '☆' }}</span>
                </div>
                <span class="text-amazon-link text-sm font-bold">{{ (seller()?.sellerRating || 0) | number:'1.1-1' }} out of 5 stars</span>
                <span class="text-gray-400 text-sm">({{ seller()?.numSellerRatings || 0 }} ratings)</span>
              </div>
            </div>
            <div class="flex gap-3">
              <button class="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded-[20px] text-sm font-bold shadow-sm transition-colors">
                Follow
              </button>
              <button class="bg-[#FFA41C] border border-[#FF8F00] hover:bg-[#FF8F00] px-4 py-1.5 rounded-[20px] text-sm font-bold shadow-sm transition-colors">
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8 max-w-[1200px]">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Sidebar -->
          <div class="lg:col-span-3">
            <h3 class="font-bold text-sm mb-4 uppercase text-gray-500">About Seller</h3>
            <p class="text-sm text-gray-700 leading-relaxed mb-6">
              {{ seller()?.storeDescription || 'This seller has not provided a description yet.' }}
            </p>
            
            <hr class="mb-6">
            
            <h3 class="font-bold text-sm mb-4 uppercase text-gray-500">Seller Information</h3>
            <div class="text-xs space-y-2 text-gray-600">
              <div class="flex justify-between">
                <span>Business Name:</span>
                <span class="font-bold">{{ seller()?.storeName }}</span>
              </div>
              <div class="flex justify-between">
                <span>Location:</span>
                <span class="font-bold">South Africa</span>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-9">
            <!-- Tabs -->
            <div class="flex border-b border-gray-200 mb-6 gap-8">
              <button (click)="activeTab.set('products')" class="pb-3 text-sm font-bold border-b-2 transition-colors" [class.border-action]="activeTab() === 'products'" [class.text-action]="activeTab() === 'products'" [class.border-transparent]="activeTab() !== 'products'">Products</button>
              <button (click)="activeTab.set('reviews')" class="pb-3 text-sm font-bold border-b-2 transition-colors" [class.border-action]="activeTab() === 'reviews'" [class.text-action]="activeTab() === 'reviews'" [class.border-transparent]="activeTab() !== 'reviews'">Seller Reviews</button>
            </div>

            <!-- Products View -->
            <div *ngIf="activeTab() === 'products'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div *ngFor="let p of products()" class="border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div class="aspect-square bg-gray-50 flex items-center justify-center p-4 cursor-pointer" [routerLink]="['/products', p._id]">
                  <img [src]="p.images[0]" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform">
                </div>
                <div class="p-4">
                  <h4 class="text-sm font-medium line-clamp-2 mb-1 hover:text-action cursor-pointer" [routerLink]="['/products', p._id]">{{ p.name }}</h4>
                  <div class="text-lg font-bold text-[#B12704] mb-2">R{{ p.price | number:'1.2-2' }}</div>
                  <div class="flex text-yellow-500 text-xs mb-2">
                    <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(p.ratings) ? '★' : '☆' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviews View -->
            <div *ngIf="activeTab() === 'reviews'" class="space-y-6">
              <div *ngFor="let r of reviews()" class="border-b border-gray-100 pb-6 last:border-0">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-yellow-500 text-sm">
                    <span *ngFor="let s of [1,2,3,4,5]">{{ s <= r.rating ? '★' : '☆' }}</span>
                  </span>
                  <span class="text-sm font-bold">{{ r.userName }}</span>
                  <span *ngIf="r.verifiedPurchase" class="text-xs text-[#C45500] font-bold">Verified Purchase</span>
                </div>
                <div class="text-xs text-gray-500 mb-2">{{ r.createdAt | date }}</div>
                <p class="text-sm text-gray-700 leading-relaxed">{{ r.comment }}</p>
              </div>
              <div *ngIf="reviews().length === 0" class="text-center py-12 text-gray-500">
                No seller reviews yet.
              </div>
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
  reviews = signal<any[]>([]);
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
        this.loadReviews(vendorId);
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

  loadReviews(id: string) {
    // Need to add getSellerReviews to ProductService
    this.productService.getSellerReviews(id).subscribe(data => this.reviews.set(data));
  }
}
