import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { TranslationService } from '../../services/translation.service';
import { DeviceService } from '../../services/device.service';
import { MembershipPromoComponent } from '../../components/membership-promo/membership-promo.component';
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MembershipPromoComponent],
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
          <section class="px-4 py-6 bg-white overflow-x-auto scrollbar-hide flex gap-8 border-b border-neutral-200">
             <div *ngFor="let cat of featuredCategories" class="flex flex-col items-center gap-2 shrink-0" [routerLink]="['/products']" [queryParams]="{category: cat.name}">
                <div class="w-20 h-20 rounded-full border-2 border-primary shadow-md overflow-hidden bg-neutral-50">
                   <img [src]="cat.image" class="w-full h-full object-cover">
                </div>
                <span class="text-[11px] font-black text-neutral-800 uppercase tracking-tighter">{{ cat.name }}</span>
             </div>
          </section>

          <!-- Mobile Lightning Deals -->
          <section *ngIf="lightningDeals().length > 0" class="bg-white p-4 border-b border-neutral-200">
             <div class="flex justify-between items-center mb-4">
                <h2 class="text-base font-black text-neutral-charcoal uppercase tracking-tight">Deals of the Day</h2>
                <a routerLink="/products" [queryParams]="{deals: true}" class="text-xs font-bold text-primary">See All</a>
             </div>
             <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
                <div *ngFor="let deal of lightningDeals()" class="min-w-[140px] w-[140px] snap-start flex flex-col group" [routerLink]="['/products', deal.id || deal._id]">
                   <div class="aspect-square bg-neutral-50 rounded-sm p-2 flex items-center justify-center relative mb-2 border border-neutral-100">
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

          <!-- Mobile Recommendations -->
          <section class="bg-white p-4 border-b border-neutral-200">
             <h2 class="text-base font-black text-neutral-charcoal uppercase tracking-tight mb-4">Recommended for You</h2>
             <div class="grid grid-cols-2 gap-3">
                <div *ngFor="let p of personalizedProducts().length > 0 ? personalizedProducts() : electronics().slice(0, 4)" 
                     class="border border-neutral-200 rounded-sm p-3 flex flex-col bg-neutral-50/50"
                     [routerLink]="['/products', p.id || p._id]">
                   <div class="aspect-square mb-2 flex items-center justify-center bg-white rounded-sm p-2 border border-neutral-100">
                      <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                   </div>
                   <h3 class="text-[11px] font-bold text-neutral-700 line-clamp-2 h-8 leading-tight uppercase tracking-tighter">{{ p.name }}</h3>
                   <div class="mt-2 flex justify-between items-center">
                      <span class="text-sm font-black text-primary">R{{ p.price | number:'1.0-0' }}</span>
                      <span *ngIf="p.stock <= (p.lowStockThreshold || 10)" class="text-[8px] font-black text-red-600 uppercase tracking-tighter italic">Only {{ p.stock }} left</span>
                   </div>
                </div>
             </div>
          </section>

        </div>
      } @else {
        <!-- DESKTOP UI (ENHANCED & BOXY) -->
        <!-- 1. Hero Banner Carousel -->
        <section class="relative bg-neutral-100 overflow-hidden group">
          <div class="relative h-[500px]">
              <div *ngFor="let slide of slides; let i = index" 
                   class="absolute inset-0 transition-opacity duration-700 ease-in-out"
                   [ngClass]="{'opacity-100 z-10': i === currentSlide(), 'opacity-0 z-0': i !== currentSlide()}">
                  <img [src]="slide.image" class="w-full h-full object-cover object-center">
                  <div class="absolute inset-0 bg-gradient-to-r from-neutral-900/60 to-transparent flex items-center">
                      <div class="w-full px-12">
                          <div class="max-w-xl text-white space-y-6 animate-fade-in-up">
                              <h2 class="text-6xl font-header font-black leading-tight tracking-tight shadow-black drop-shadow-md italic uppercase">
                                  {{ ts.t(slide.title) }}
                              </h2>
                              <p class="text-xl font-medium text-neutral-100 drop-shadow-md">
                                  {{ ts.t(slide.subtitle) }}
                              </p>
                              <a [routerLink]="slide.link" class="bg-primary hover:bg-[#E67A00] text-white inline-block py-3 px-10 text-base font-black uppercase tracking-[0.2em] rounded-sm shadow-xl transition-all hover:scale-105">
                                  {{ ts.t(slide.cta) }}
                              </a>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </section>
      
        <!-- 2. Featured Categories (Boxy Grid) -->
        <section class="py-12 w-full px-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            <div *ngFor="let cat of featuredCategories" class="bg-white border border-neutral-300 rounded-sm p-0 flex flex-col group cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden" [routerLink]="['/products']" [queryParams]="{category: cat.name}">
              <div class="p-5 border-b border-neutral-100">
                <h3 class="text-lg font-black text-neutral-800 uppercase tracking-tighter">{{ cat.name }}</h3>
              </div>
              <div class="aspect-square flex items-center justify-center overflow-hidden relative">
                 <div class="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 z-10"></div>
                 <img [src]="cat.image" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
              </div>
              <div class="p-5 bg-white">
                <span class="text-[10px] font-black text-primary uppercase tracking-widest group-hover:underline">{{ ts.t('nav.explore_home') }}</span>
              </div>
            </div>
          </div>
        </section>
      
        <!-- 3. Lightning Deals (Boxy) -->
        <section *ngIf="lightningDeals().length > 0" class="py-12 bg-white border-y border-neutral-300">
           <div class="w-full px-8">
              <div class="flex items-center justify-between mb-8 border-b border-neutral-100 pb-4">
                 <div class="flex items-baseline gap-4">
                    <h2 class="text-2xl font-black text-[#222222] uppercase tracking-tighter italic">Limited-Time Deals</h2>
                    <span class="text-xs font-bold text-neutral-400 uppercase tracking-widest italic">Ends in: {{ timeRemaining() }}</span>
                 </div>
                 <a routerLink="/products" [queryParams]="{deals: true}" class="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">See all deals</a>
              </div>
      
              <div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                 <div *ngFor="let deal of lightningDeals()" class="min-w-[240px] bg-white border border-neutral-200 rounded-sm overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col p-4">
                    <div class="relative h-48 bg-neutral-50 rounded-sm border border-neutral-100 p-4 flex items-center justify-center mb-4">
                       <span class="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-black px-2 py-1 rounded-none uppercase">Deal</span>
                       <img [src]="deal.images[0]" class="max-h-full max-w-full object-contain mix-blend-multiply transition-transform group-hover:scale-110">
                    </div>
                    <h3 class="text-xs font-bold text-[#222222] line-clamp-2 h-8 mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">{{ deal.name }}</h3>
                    <div class="flex items-baseline gap-2 mb-4">
                       <span class="text-2xl font-black text-neutral-800 tracking-tighter">R{{ deal.discountPrice | number:'1.0-0' }}</span>
                       <span class="text-xs text-neutral-400 line-through font-bold">R{{ deal.price | number:'1.0-0' }}</span>
                    </div>
                    <button [routerLink]="['/products', deal.id || deal._id]" class="w-full btn-primary py-2 rounded-sm text-[10px] font-black uppercase tracking-widest">View Product</button>
                 </div>
              </div>
           </div>
        </section>

        <!-- Chommie Plus Membership (Boxy Ad Style) -->
        <app-membership-promo></app-membership-promo>

        <!-- Buy It Again (Personalized Horizontal Scroll) -->
        <section *ngIf="buyItAgainProducts().length > 0" class="py-12 bg-white border-y border-neutral-300">
           <div class="w-full px-8">
              <h2 class="text-2xl font-black text-neutral-800 mb-8 uppercase tracking-tighter italic">Buy It Again</h2>
              <div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                 <div *ngFor="let p of buyItAgainProducts()" class="min-w-[200px] bg-neutral-50 border border-neutral-200 rounded-sm p-4 hover:shadow-md transition-all flex flex-col group cursor-pointer" [routerLink]="['/products', p.id || p._id]">
                    <div class="aspect-square flex items-center justify-center bg-white rounded-sm border border-neutral-100 mb-3 p-2">
                       <img [src]="p.images[0]" class="max-h-full max-w-full object-contain mix-blend-multiply">
                    </div>
                    <div class="flex-grow">
                       <h3 class="text-[10px] font-bold text-neutral-800 uppercase tracking-tight line-clamp-1 mb-1">{{ p.name }}</h3>
                       <div class="text-sm font-black text-neutral-900">R{{ p.price | number:'1.0-0' }}</div>
                       <div *ngIf="p.stock <= (p.lowStockThreshold || 10)" class="text-[9px] font-black text-red-600 uppercase mt-1 italic animate-pulse">Low Stock: {{ p.stock }} left</div>
                    </div>
                    <button class="mt-4 w-full bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black py-2 rounded-sm uppercase tracking-widest transition-colors">Add to Cart</button>
                 </div>
              </div>
           </div>
        </section>
        
        <!-- 5. Discovery Matrix (Standardized Grid) -->
        <section *ngIf="personalizedProducts().length > 0" class="py-12 bg-neutral-100 border-y border-neutral-200">
            <div class="w-full px-8">
               <h2 class="text-2xl font-black text-neutral-800 mb-8 uppercase tracking-tighter italic">Recommended for You</h2>
               <div class="grid grid-cols-4 gap-6">
                  <div *ngFor="let p of personalizedProducts().slice(0, 8)" class="bg-white border border-neutral-300 rounded-sm p-6 hover:shadow-xl transition-all duration-500 flex flex-col">
                      <div class="aspect-square flex items-center justify-center bg-neutral-50 rounded-sm border border-neutral-100 mb-4 p-4">
                          <img [src]="p.images[0]" class="max-h-full max-w-full object-contain mix-blend-multiply">
                      </div>
                      <a [routerLink]="['/products', p.id || p._id]" class="text-xs font-bold text-[#222222] hover:text-primary transition-colors line-clamp-2 h-8 uppercase tracking-tight">{{ p.name }}</a>
                      <div class="mt-4 flex justify-between items-end">
                          <span class="text-xl font-black text-neutral-800 tracking-tighter">R{{ p.price | number:'1.0-0' }}</span>
                          <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">In Stock</span>
                      </div>
                  </div>
               </div>
            </div>
        </section>

        <!-- 7. Style Discovery (Themed & Boxy) -->
        <section class="py-20 bg-white border-y border-neutral-200 relative overflow-hidden">
           <div class="max-w-[1400px] mx-auto px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div class="w-full lg:w-1/2 space-y-10">
                 <div class="space-y-4">
                    <div class="inline-flex items-center gap-2 px-4 py-1 bg-[#FAF3E1] border border-[#F5E7C6] rounded-sm">
                       <span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#222222]">Curated Style</span>
                    </div>
                    <h2 class="text-6xl font-black tracking-tighter italic text-[#222222] uppercase">Find Your Perfect <span class="text-primary underline decoration-8 underline-offset-12">Style</span></h2>
                 </div>
                 <p class="text-neutral-500 text-lg font-medium leading-relaxed max-w-xl">
                    Explore the latest fashion collections. High-quality apparel and accessories designed for comfort and everyday reliability.
                 </p>
                 <div class="flex gap-4">
                    <button routerLink="/products" [queryParams]="{category: 'Fashion'}" class="bg-[#131921] hover:bg-neutral-800 text-white px-12 py-4 rounded-sm font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all active:scale-95">Shop Now</button>
                    <button routerLink="/products" [queryParams]="{category: 'Fashion'}" class="bg-white border-2 border-neutral-200 text-neutral-800 px-12 py-4 rounded-sm font-black uppercase text-xs tracking-[0.2em] hover:bg-neutral-50 transition-all">View All</button>
                 </div>
              </div>
              <div class="w-full lg:w-1/2 flex gap-6">
                 <div class="flex-grow aspect-[3/4] bg-neutral-100 border border-neutral-200 rounded-sm overflow-hidden relative group cursor-pointer shadow-xl">
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-700">
                    <div class="absolute bottom-8 left-8 border-l-4 border-primary pl-4 text-white drop-shadow-lg">
                       <span class="text-[10px] font-black uppercase tracking-[0.3em]">Trending</span>
                       <div class="text-xl font-black uppercase italic tracking-tighter">Women's Collection</div>
                    </div>
                 </div>
                 <div class="flex-grow aspect-[3/4] bg-neutral-100 border border-neutral-200 rounded-sm overflow-hidden relative group cursor-pointer shadow-xl translate-y-12">
                    <img src="https://images.unsplash.com/photo-1539106602053-d18a8824c623?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-700">
                    <div class="absolute bottom-8 left-8 border-l-4 border-primary pl-4 text-white drop-shadow-lg">
                       <span class="text-[10px] font-black uppercase tracking-[0.3em]">Essentials</span>
                       <div class="text-xl font-black uppercase italic tracking-tighter">Men's Apparel</div>
                    </div>
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
  buyItAgainProducts = signal<any[]>([]);
  personalizedProducts = signal<any[]>([]);
  electronics = signal<any[]>([]);
  userId = localStorage.getItem('user_id');
  Math = Math;
  timeRemaining = signal<string>('00:00:00');
  timerInterval: any;
  
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
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1000' }, 
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Home', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Beauty', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=1000' }
  ];

  constructor(private productService: ProductService, public ts: TranslationService, public deviceService: DeviceService) {}

  ngOnInit() {
    this.loadLightningDeals();
    this.loadRecentHistory();
    this.loadElectronics();
    if (this.userId) {
        this.loadPersonalizedRecommendations();
        this.loadPurchasedProducts();
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
      }, 5000);
  }

  nextSlide() {
      this.currentSlide.update(curr => (curr + 1) % this.slides.length);
  }

  prevSlide() {
      this.currentSlide.update(curr => (curr - 1 + this.slides.length) % this.slides.length);
  }

  goToSlide(index: number) {
      this.currentSlide.set(index);
      clearInterval(this.carouselInterval);
      this.startCarousel();
  }

  startTimer() {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      
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

  loadPurchasedProducts() {
    if (!this.userId) return;
    this.productService.getPurchasedProductIds(this.userId).subscribe(ids => {
        if (ids.length > 0) {
            const promises = ids.slice(0, 10).map(id => this.productService.getProduct(id).toPromise());
            Promise.all(promises).then(products => {
                this.buyItAgainProducts.set(products.filter(p => !!p));
            });
        }
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
    let history = JSON.parse(localStorage.getItem('recent_history') || '[]');
    
    // Cleanup invalid legacy IDs
    if (history.some((id: string) => id.length < 24)) {
        localStorage.removeItem('recent_history');
        history = [];
    }

    if (history.length > 0) {
      const promises = history.slice(0, 10).map((id: string) => 
        this.productService.getProduct(id).toPromise()
      );
      Promise.all(promises).then(products => {
        this.recentProducts.set(products.filter(p => !!p));
      });
    }
  }
}