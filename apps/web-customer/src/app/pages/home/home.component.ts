import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative pb-12">
      <!-- Hero Carousel (Static for now) -->
      <div class="relative h-[600px] overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-t from-amazon-bg to-transparent z-10"></div>
        <img src="https://m.media-amazon.com/images/I/61lwJy4B8PL._SX3000_.jpg" class="w-full h-full object-cover">
        
        <!-- Welcome Overlay Card -->
        <div class="absolute bottom-40 left-8 z-20 hidden md:block">
            <div class="bg-white p-6 shadow-xl rounded-sm w-80">
                <h2 class="text-xl font-bold mb-2">Welcome to Chommie</h2>
                <p class="text-sm text-gray-600 mb-4">Shop the latest deals and enjoy BNPL flexibility on your favorite items.</p>
                <a routerLink="/products" class="block w-full bg-[#FFA41C] hover:bg-[#FF8F00] text-center py-2 rounded-md text-sm font-medium transition-colors">
                    Start Shopping
                </a>
            </div>
        </div>
      </div>

      <!-- Main Content Overlapping Hero -->
      <div class="container mx-auto px-4 -mt-64 relative z-20 max-w-[1500px]">
        
        <!-- Category Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div *ngFor="let cat of featuredCategories" class="bg-white p-5 shadow-sm rounded-sm flex flex-col">
            <h3 class="text-xl font-bold mb-3">{{ cat.name }}</h3>
            <div class="flex-grow aspect-square mb-3 overflow-hidden">
                <img [src]="cat.image" [alt]="cat.name" class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" [routerLink]="['/products']" [queryParams]="{category: cat.name}">
            </div>
            <a [routerLink]="['/products']" [queryParams]="{category: cat.name}" class="text-sm text-amazon-link hover:text-action hover:underline">Shop now</a>
          </div>
        </div>

        <!-- Lightning Deals Section -->
        <div class="bg-white p-5 shadow-sm rounded-sm mb-8" *ngIf="lightningDeals().length > 0">
           <div class="flex items-center gap-4 mb-4">
              <h2 class="text-xl font-bold">Today's Lightning Deals</h2>
              <a routerLink="/products" class="text-sm text-amazon-link hover:underline">See all deals</a>
           </div>
           <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              <div *ngFor="let deal of lightningDeals()" class="min-w-[200px] max-w-[200px] group cursor-pointer" [routerLink]="['/products', deal.id || deal._id]">
                 <div class="aspect-square bg-gray-100 flex items-center justify-center mb-2 overflow-hidden">
                    <img [src]="deal.images[0]" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform">
                 </div>
                 <div class="flex items-center gap-2 mb-1">
                    <span class="bg-[#CC0C39] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">Up to 40% off</span>
                    <span class="text-[#CC0C39] text-xs font-bold uppercase">Deal</span>
                 </div>
                 <div class="text-sm font-bold text-black">R{{ deal.discountPrice | number:'1.2-2' }}</div>
                 <div class="text-xs text-gray-500 line-through">R{{ deal.price | number:'1.2-2' }}</div>
                 <div class="text-xs text-gray-700 line-clamp-2 mt-1">{{ deal.name }}</div>
              </div>
           </div>
        </div>

        <!-- Recently Viewed Section -->
        <div class="bg-white p-5 shadow-sm rounded-sm mb-8" *ngIf="recentProducts().length > 0">
           <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold">Inspired by your browsing history</h2>
           </div>
           <div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              <div *ngFor="let p of recentProducts()" class="min-w-[160px] max-w-[160px] cursor-pointer group" [routerLink]="['/products', p.id || p._id]">
                 <div class="h-40 flex items-center justify-center mb-2">
                    <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                 </div>
                 <div class="text-amazon-link text-sm group-hover:underline group-hover:text-action line-clamp-2 mb-1">{{ p.name }}</div>
                 <div class="flex text-yellow-500 text-xs mb-1">
                    <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(p.ratings) ? '★' : '☆' }}</span>
                    <span class="text-amazon-link ml-1">({{ p.numReviews }})</span>
                 </div>
                 <div class="text-black text-lg font-medium">R{{ p.price | number:'1.2-2' }}</div>
              </div>
           </div>
        </div>

        <!-- Personalized Recommendations -->
        <div class="bg-white p-5 shadow-sm rounded-sm mb-8" *ngIf="personalizedProducts().length > 0">
           <h2 class="text-xl font-bold mb-4">Recommended for you</h2>
           <div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              <div *ngFor="let p of personalizedProducts()" class="min-w-[160px] max-w-[160px] cursor-pointer group" [routerLink]="['/products', p.id || p._id]">
                 <div class="h-40 flex items-center justify-center mb-2">
                    <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                 </div>
                 <div class="text-amazon-link text-sm group-hover:underline group-hover:text-action line-clamp-2 mb-1">{{ p.name }}</div>
                 <div class="flex text-yellow-500 text-xs mb-1">
                    <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(p.ratings) ? '★' : '☆' }}</span>
                    <span class="text-amazon-link ml-1">({{ p.numReviews }})</span>
                 </div>
                 <div class="text-black text-lg font-medium">R{{ p.price | number:'1.2-2' }}</div>
              </div>
           </div>
        </div>

        <!-- Trending in Electronics (Example Category Strip) -->
        <div class="bg-white p-5 shadow-sm rounded-sm mb-8">
           <h2 class="text-xl font-bold mb-4">Trending in Electronics</h2>
           <div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              <div *ngFor="let p of electronics()" class="min-w-[160px] max-w-[160px] cursor-pointer group" [routerLink]="['/products', p.id || p._id]">
                 <div class="h-40 flex items-center justify-center mb-2">
                    <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                 </div>
                 <div class="text-black text-sm group-hover:text-action line-clamp-2 mb-1">{{ p.name }}</div>
                 <div class="text-[#B12704] text-lg font-medium">R{{ p.price | number:'1.2-2' }}</div>
              </div>
           </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class HomeComponent implements OnInit {
  lightningDeals = signal<any[]>([]);
  recentProducts = signal<any[]>([]);
  personalizedProducts = signal<any[]>([]);
  electronics = signal<any[]>([]);
  userId = localStorage.getItem('user_id');
  Math = Math;

  featuredCategories = [
    { name: 'Electronics', image: 'https://m.media-amazon.com/images/I/41-8qH7Yp2L._SY160_.jpg' },
    { name: 'Fashion', image: 'https://m.media-amazon.com/images/I/41B2E0W2JCL._SY160_.jpg' },
    { name: 'Home', image: 'https://m.media-amazon.com/images/I/31WfIu7C4lL._SY160_.jpg' },
    { name: 'Beauty', image: 'https://m.media-amazon.com/images/I/31S63p-mSjL._SY160_.jpg' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadLightningDeals();
    this.loadRecentHistory();
    this.loadElectronics();
    if (this.userId) {
        this.loadPersonalizedRecommendations();
    }
  }

  loadPersonalizedRecommendations() {
    if (!this.userId) return;
    this.productService.getPersonalizedRecommendations(this.userId).subscribe(data => {
        this.personalizedProducts.set(data.slice(0, 10));
    });
  }

  loadLightningDeals() {
    this.productService.getFilteredProducts({ isLightningDeal: true }).subscribe(data => {
      this.lightningDeals.set(data.slice(0, 10));
    });
  }

  loadElectronics() {
    this.productService.getFilteredProducts({ category: 'Electronics' }).subscribe(data => {
      this.electronics.set(data.slice(0, 10));
    });
  }

  loadRecentHistory() {
    const history = JSON.parse(localStorage.getItem('recent_history') || '[]');
    if (history.length > 0) {
      // Fetch details for first 10 items in history
      const promises = history.slice(0, 10).map((id: string) => 
        this.productService.getProduct(id).toPromise()
      );
      
      Promise.all(promises).then(products => {
        this.recentProducts.set(products.filter(p => !!p));
      });
    }
  }
}
