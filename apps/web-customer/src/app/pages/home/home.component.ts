import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { TranslationService } from '../../services/translation.service';
import { DeviceService } from '../../services/device.service';
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative min-h-screen bg-[#FAF3E1] text-neutral-charcoal overflow-x-hidden pb-10">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE HOME UI -->
        <div class="flex flex-col gap-2">
          
          <!-- Mobile Hero Carousel -->
          <section class="relative bg-white overflow-hidden h-[200px]">
            <div class="relative h-full">
                <div *ngFor="let slide of slides; let i = index" 
                     class="absolute inset-0 transition-opacity duration-700 ease-in-out"
                     [ngClass]="{'opacity-100 z-10': i === currentSlide(), 'opacity-0 z-0': i !== currentSlide()}">
                    <img [src]="slide.image" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                        <div class="text-white">
                            <h2 class="text-xl font-black leading-tight">{{ ts.t(slide.title) }}</h2>
                            <p class="text-xs opacity-90">{{ ts.t(slide.subtitle) }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Indicators -->
            <div class="absolute bottom-2 right-4 z-20 flex gap-1">
                <div *ngFor="let s of slides; let i = index" 
                     class="w-1.5 h-1.5 rounded-full"
                     [ngClass]="i === currentSlide() ? 'bg-primary' : 'bg-white/50'">
                </div>
            </div>
          </section>

          <!-- Mobile Quick Categories (Bubbles) -->
          <section class="px-4 py-4 bg-white overflow-x-auto scrollbar-hide flex gap-6">
             <div *ngFor="let cat of featuredCategories" class="flex flex-col items-center gap-1 shrink-0" [routerLink]="['/products']" [queryParams]="{category: cat.name}">
                <div class="w-16 h-16 rounded-full border-2 border-primary/10 overflow-hidden bg-neutral-50 p-1">
                   <img [src]="cat.image" class="w-full h-full object-cover rounded-full">
                </div>
                <span class="text-[10px] font-bold text-neutral-600 uppercase tracking-tighter">{{ cat.name }}</span>
             </div>
          </section>

          <!-- Mobile Lightning Deals -->
          <section *ngIf="lightningDeals().length > 0" class="bg-white p-4">
             <div class="flex justify-between items-center mb-4">
                <h2 class="text-base font-black text-neutral-charcoal uppercase tracking-tight">Deals of the Day</h2>
                <a routerLink="/products" [queryParams]="{deals: true}" class="text-xs font-bold text-primary">See All</a>
             </div>
             <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
                <div *ngFor="let deal of lightningDeals()" class="min-w-[140px] w-[140px] snap-start flex flex-col group" [routerLink]="['/products', deal.id || deal._id]">
                   <div class="aspect-square bg-neutral-50 rounded-lg p-2 flex items-center justify-center relative mb-2">
                      <span class="absolute top-1 left-1 bg-red-700 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm">-{{ ((deal.price - deal.discountPrice) / deal.price) | percent:'1.0-0' }}</span>
                      <img [src]="deal.images[0]" class="max-h-full max-w-full object-contain">
                   </div>
                   <div class="space-y-0.5 px-1">
                      <div class="flex items-baseline gap-1">
                         <span class="text-sm font-black text-neutral-800">R{{ deal.discountPrice | number:'1.0-0' }}</span>
                         <span class="text-[10px] text-neutral-400 line-through">R{{ deal.price | number:'1.0-0' }}</span>
                      </div>
                      <div class="text-[10px] text-neutral-500 truncate">{{ deal.name }}</div>
                   </div>
                </div>
             </div>
          </section>

          <!-- Mobile Recommendations (Grid) -->
          <section class="bg-white p-4">
             <h2 class="text-base font-black text-neutral-charcoal uppercase tracking-tight mb-4">Recommended for You</h2>
             <div class="grid grid-cols-2 gap-3">
                <div *ngFor="let p of personalizedProducts().length > 0 ? personalizedProducts() : electronics().slice(0, 4)" 
                     class="border border-neutral-100 rounded-xl p-3 flex flex-col bg-neutral-50/50"
                     [routerLink]="['/products', p.id || p._id]">
                   <div class="aspect-square mb-2 flex items-center justify-center bg-white rounded-lg p-2">
                      <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                   </div>
                   <h3 class="text-[11px] font-bold text-neutral-700 line-clamp-2 h-8 leading-tight">{{ p.name }}</h3>
                   <div class="mt-2 text-sm font-black text-primary">R{{ p.price | number:'1.0-0' }}</div>
                </div>
             </div>
          </section>

          <!-- Mobile Trending -->
          <section class="bg-[#1B4332] p-6 text-white">
             <div class="flex justify-between items-center mb-4">
                <h2 class="text-base font-black uppercase tracking-widest">Trending Now</h2>
                <div class="w-10 h-1 bg-white/20 rounded-full"></div>
             </div>
             <div class="flex gap-4 overflow-x-auto scrollbar-hide">
                <div *ngFor="let p of electronics().slice(4, 8)" class="min-w-[120px] w-[120px]" [routerLink]="['/products', p.id || p._id]">
                   <div class="aspect-square bg-white rounded-2xl p-3 mb-2 flex items-center justify-center shadow-lg">
                      <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                   </div>
                   <div class="text-[10px] font-black uppercase tracking-tighter text-white/80 line-clamp-1">Electronics</div>
                   <div class="text-xs font-bold truncate">R{{ p.price | number:'1.0-0' }}</div>
                </div>
             </div>
          </section>

        </div>
      } @else {
        <!-- ORIGINAL DESKTOP UI (UNTOUCHED) -->
        <!-- 1. Hero Banner Carousel -->
        <section class="relative bg-neutral-100 overflow-hidden group">
          <!-- Slides -->
          <div class="relative h-[300px] md:h-[400px] lg:h-[500px]">
              <div *ngFor="let slide of slides; let i = index" 
                   class="absolute inset-0 transition-opacity duration-700 ease-in-out"
                   [ngClass]="{'opacity-100 z-10': i === currentSlide(), 'opacity-0 z-0': i !== currentSlide()}">
                  
                  <!-- Background Image -->
                  <img [src]="slide.image" class="w-full h-full object-cover object-center">
                  
                  <!-- Content Overlay -->
                  <div class="absolute inset-0 bg-gradient-to-r from-neutral-900/60 to-transparent flex items-center">
                      <div class="w-full px-6 md:px-12">
                          <div class="max-w-xl text-white space-y-6 animate-fade-in-up">
                              <h2 class="text-4xl md:text-6xl font-header font-black leading-tight tracking-tight shadow-black drop-shadow-md">
                                  {{ ts.t(slide.title) }}
                              </h2>
                              <p class="text-lg md:text-xl font-medium text-neutral-100 drop-shadow-md">
                                  {{ ts.t(slide.subtitle) }}
                              </p>
                              <a [routerLink]="slide.link" class="btn-primary inline-block py-3 px-8 text-sm md:text-base font-bold uppercase tracking-wider rounded-md shadow-lg transform hover:scale-105 transition-transform">
                                  {{ ts.t(slide.cta) }}
                              </a>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Carousel Controls -->
          <button (click)="prevSlide()" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-transparent hover:bg-black/20 text-white/50 hover:text-white border border-white/20 p-2 rounded-full transition-all focus:outline-none backdrop-blur-sm h-12 w-12 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button (click)="nextSlide()" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-transparent hover:bg-black/20 text-white/50 hover:text-white border border-white/20 p-2 rounded-full transition-all focus:outline-none backdrop-blur-sm h-12 w-12 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>

          <!-- Indicators -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              <button *ngFor="let slide of slides; let i = index" 
                      (click)="goToSlide(i)"
                      class="w-2.5 h-2.5 rounded-full transition-all"
                      [ngClass]="{'bg-white w-8': i === currentSlide(), 'bg-white/40 hover:bg-white/60': i !== currentSlide()}">
              </button>
          </div>
        </section>
      
        <!-- 2. Featured Categories (Grid) -->
        <section class="py-10 w-full px-4">
          <h2 class="text-xl font-header font-bold text-neutral-charcoal mb-6">{{ ts.t('nav.wishlist') }}</h2>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div *ngFor="let cat of featuredCategories" class="group relative aspect-[4/5] bg-white border border-neutral-300 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow" [routerLink]="['/products']" [queryParams]="{category: cat.name}">
              <img [src]="cat.image" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
              
              <div class="absolute bottom-0 left-0 right-0 p-4">
                <h3 class="text-lg font-bold font-header text-white mb-1">{{ cat.name }}</h3>
                <span class="text-xs text-white/80 hover:underline">{{ ts.t('nav.explore_home') }}</span>
              </div>
            </div>
          </div>
        </section>
      
        <!-- 3. Lightning Deals (Horizontal Scroll) -->
        <section *ngIf="lightningDeals().length > 0" class="py-10 bg-white border-y border-neutral-300">
           <div class="w-full px-4">
              <div class="flex items-center gap-4 mb-6">
                 <h2 class="text-xl font-header font-bold text-neutral-charcoal">{{ ts.t('nav.deals') }} <span class="text-sm font-normal text-neutral-500 ml-2">Temporary Valuation Drops</span></h2>
                 <a routerLink="/products" [queryParams]="{deals: true}" class="text-sm text-primary hover:underline ml-auto">See all deals</a>
              </div>
      
              <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                 <div *ngFor="let deal of lightningDeals()" class="min-w-[200px] md:min-w-[240px] bg-white border border-neutral-300 rounded-lg overflow-hidden group hover:shadow-md transition-shadow snap-start flex flex-col">
                    <div class="relative h-48 p-4 flex items-center justify-center bg-neutral-50">
                       <span class="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-sm">
                         -{{ ((deal.price - deal.discountPrice) / deal.price) | percent:'1.0-0' }}
                       </span>
                       <img [src]="deal.images[0]" class="max-h-full max-w-full object-contain mix-blend-multiply">
                    </div>
      
                    <div class="p-4 flex flex-col flex-grow">
                       <h3 class="text-sm font-medium line-clamp-2 mb-2 text-neutral-charcoal group-hover:text-primary transition-colors cursor-pointer" [routerLink]="['/products', deal.id || deal._id]">{{ deal.name }}</h3>
                       
                       <div class="mt-auto">
                           <div class="flex items-baseline gap-2">
                              <span class="text-lg font-bold text-neutral-charcoal">R{{ deal.discountPrice | number:'1.0-0' }}</span>
                              <span class="text-xs text-neutral-500 line-through">R{{ deal.price | number:'1.0-0' }}</span>
                           </div>
                           <button [routerLink]="['/products', deal.id || deal._id]" class="w-full mt-3 btn-primary text-xs py-1.5">View Deal</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      
        <!-- 4. Recently Viewed -->
        <section *ngIf="recentProducts().length > 0" class="py-10 w-full px-4">
           <h2 class="text-xl font-header font-bold text-neutral-charcoal mb-6">Your Browsing History</h2>
           <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <div *ngFor="let p of recentProducts()" class="min-w-[140px] w-[140px] space-y-2 group cursor-pointer" [routerLink]="['/products', p.id || p._id]">
                 <div class="h-32 bg-white border border-neutral-300 rounded-lg p-2 flex items-center justify-center hover:shadow-sm transition-shadow">
                    <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                 </div>
                 <div class="text-xs text-primary group-hover:underline truncate">{{ p.name }}</div>
              </div>
           </div>
        </section>
        
        <!-- 5. Discovery Matrix (Standardized Grid) -->
        <section *ngIf="personalizedProducts().length > 0" class="py-10 bg-neutral-100 border-y border-neutral-200">
            <div class="w-full px-4">
               <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-header font-bold text-neutral-charcoal">{{ ts.t('sidebar.shop_by_dept') }}</h2>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <!-- Large Discovery Node -->
                  <div class="lg:col-span-2 bg-white border border-neutral-300 rounded-lg p-6 flex flex-col justify-between shadow-sm">
                     <div class="space-y-1 mb-4">
                        <h3 class="text-lg font-bold text-neutral-charcoal">Logic Leap</h3>
                        <p class="text-sm text-neutral-500">Assets aligned with your core signature</p>
                     </div>

                     <div class="grid grid-cols-2 gap-4">
                        <div *ngFor="let p of personalizedProducts().slice(0, 2)" class="border border-neutral-200 rounded-md p-2 hover:border-primary/50 cursor-pointer bg-white" [routerLink]="['/products', p.id || p._id]">
                           <img [src]="p.images[0]" class="w-full h-32 object-contain mb-2">
                           <div class="text-center">
                              <span class="text-sm font-bold text-neutral-charcoal">R{{ p.price | number:'1.0-0' }}</span>
                           </div>
                        </div>
                     </div>

                     <div class="mt-4">
                        <a routerLink="/products" class="text-sm text-primary hover:underline">See all recommendations -></a>
                     </div>
                  </div>

                  <!-- Product Grid Items -->
                  <div *ngFor="let p of personalizedProducts().slice(2, 6)" class="bg-white border border-neutral-300 rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow">
                      <div class="h-40 flex items-center justify-center mb-4 cursor-pointer" [routerLink]="['/products', p.id || p._id]">
                          <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                      </div>
                      <a [routerLink]="['/products', p.id || p._id]" class="text-sm font-medium text-neutral-charcoal hover:text-primary line-clamp-2 mb-2">{{ p.name }}</a>
                      <div class="mt-auto">
                          <span class="text-lg font-bold text-neutral-charcoal">R{{ p.price | number:'1.0-0' }}</span>
                      </div>
                  </div>
               </div>
            </div>
        </section>
        
        <!-- 6. Trending Electronics (Dense Grid) -->
        <section class="py-10 w-full px-4">
           <div class="flex items-center justify-between mb-6">
               <h2 class="text-xl font-header font-bold text-neutral-charcoal">Trending in Electronics</h2>
               <a [routerLink]="['/products']" [queryParams]="{category: 'Electronics'}" class="text-sm text-primary hover:underline">See more</a>
           </div>
           
           <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div *ngFor="let p of electronics()" class="group bg-white border border-neutral-300 rounded-lg p-3 hover:shadow-md transition-shadow" [routerLink]="['/products', p.id || p._id]">
                  <div class="h-32 flex items-center justify-center mb-2">
                      <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                  </div>
                  <div class="space-y-1">
                      <h3 class="text-xs font-medium text-neutral-charcoal line-clamp-2 group-hover:text-primary transition-colors">{{ p.name }}</h3>
                      <div class="text-sm font-bold text-neutral-charcoal">R{{ p.price | number:'1.0-0' }}</div>
                  </div>
              </div>
           </div>
        </section>
      }
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
  timeRemaining = signal<string>('00:00:00');
  timerInterval: any;
  
  // Carousel State
  currentSlide = signal(0);
  carouselInterval: any;
  slides = [
    {
        image: 'https://m.media-amazon.com/images/I/71qid7QFWJL._SX3000_.jpg',
        title: 'hero.welcome',
        subtitle: 'hero.subtitle',
        cta: 'product.buy_now',
        link: '/products?category=Electronics'
    },
    {
        image: 'https://m.media-amazon.com/images/I/61lwJy4B8PL._SX3000_.jpg',
        title: 'nav.home_kitchen',
        subtitle: 'Upgrade your living space with our top picks.',
        cta: 'nav.explore_home',
        link: '/products?category=Home'
    },
    {
        image: 'https://m.media-amazon.com/images/I/711Y9Al9RNL._SX3000_.jpg',
        title: 'nav.beauty_essentials',
        subtitle: 'Discover top-rated beauty and personal care.',
        cta: 'nav.shop_beauty',
        link: '/products?category=Beauty'
    }
  ];

  featuredCategories = [
    { name: 'Electronics', image: 'https://m.media-amazon.com/images/I/71c5W9NxibL._AC_SL1500_.jpg' }, 
    { name: 'Fashion', image: 'https://m.media-amazon.com/images/I/71F7tW+1uXL._AC_UY1000_.jpg' },
    { name: 'Home', image: 'https://m.media-amazon.com/images/I/81+3yZ8q0AL._AC_SL1500_.jpg' },
    { name: 'Beauty', image: 'https://m.media-amazon.com/images/I/61+4T0hWcUL._AC_SL1001_.jpg' }
  ];

  constructor(private productService: ProductService, public ts: TranslationService, public deviceService: DeviceService) {}

  ngOnInit() {
    this.loadLightningDeals();
    this.loadRecentHistory();
    this.loadElectronics();
    if (this.userId) {
        this.loadPersonalizedRecommendations();
    }
    this.startTimer();
    this.startCarousel();
  }
  
  ngOnDestroy() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      if (this.carouselInterval) clearInterval(this.carouselInterval);
  }

  startCarousel() {
      this.carouselInterval = setInterval(() => {
          this.nextSlide();
      }, 5000); // 5 seconds per slide
  }

  nextSlide() {
      this.currentSlide.update(curr => (curr + 1) % this.slides.length);
  }

  prevSlide() {
      this.currentSlide.update(curr => (curr - 1 + this.slides.length) % this.slides.length);
  }

  goToSlide(index: number) {
      this.currentSlide.set(index);
      // Reset timer on manual interaction
      clearInterval(this.carouselInterval);
      this.startCarousel();
  }

  startTimer() {
      const end = new Date();
      end.setHours(23, 59, 59, 999); // End of today
      
      this.timerInterval = setInterval(() => {
          const now = new Date().getTime();
          const distance = end.getTime() - now;
          
          if (distance < 0) {
              this.timeRemaining.set('EXPIRED');
              return;
          }
          
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          this.timeRemaining.set(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
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
