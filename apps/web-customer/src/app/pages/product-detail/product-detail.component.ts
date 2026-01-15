import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { BnplService, TrustProfile } from '../../services/bnpl.service';
import { TranslationService } from '../../services/translation.service';
import { DeviceService } from '../../services/device.service';
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-product-detail',  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-40" [ngClass]="deviceService.isMobile() ? 'pt-2' : 'pt-16'" *ngIf="product()">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE UI -->
        <div class="w-full">
          <!-- Mobile Image Gallery -->
          <div class="relative bg-white aspect-square flex items-center justify-center p-4">
             <img [src]="getDisplayImage()" class="max-h-full max-w-full object-contain mix-blend-multiply" (click)="showLightbox.set(true)">
             <div class="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full font-bold">
               1 / {{ product()?.images?.length || 1 }}
             </div>
             <!-- Lightning Deal Badge -->
             <div *ngIf="product()!.isLightningDeal" class="absolute top-4 left-4 bg-red-700 text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-wider shadow-md">
               Lightning Deal
             </div>
          </div>

          <div class="px-4 space-y-4">
            <!-- Title & Brand -->
            <div class="pt-2">
              <div class="flex justify-between items-start gap-4">
                <h1 class="text-lg font-bold text-neutral-charcoal leading-tight">{{ product()!.name }}</h1>
                <button (click)="addToWishlist()" class="p-2 border border-neutral-200 rounded-full text-neutral-400 hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
              </div>
              <div class="flex items-center gap-1 mt-1">
                <div class="flex text-amber-500 text-xs">
                  <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product()!.ratings) ? '★' : '☆' }}</span>
                </div>
                <span class="text-xs text-primary font-bold ml-1">{{ product()!.numReviews }} ratings</span>
              </div>
            </div>

            <!-- Pricing Mobile -->
            <div class="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              <div class="flex items-baseline gap-2">
                <span class="text-red-700 text-3xl font-light" *ngIf="product()!.isLightningDeal || product()!.discountPrice">-{{ getDiscountPercent() }}%</span>
                <span class="text-3xl font-bold text-neutral-charcoal"><span class="text-sm font-medium relative -top-3">R</span>{{ getDisplayPrice() | number:'1.0-0' }}</span>
              </div>
              <div class="text-xs text-neutral-500 mt-1">
                List Price: <span class="line-through">R{{ product()!.price | number:'1.0-0' }}</span>
              </div>
              
              <!-- Trust Score Promo -->
              <div *ngIf="trustProfile() && product()!.trustScoreDiscount > 0" class="mt-4 p-3 rounded-lg border-l-4 shadow-sm" 
                   [ngClass]="(trustProfile()!.currentScore >= 700) ? 'bg-emerald-50 border-l-emerald-500 border-neutral-200' : 'bg-neutral-100 border-l-neutral-400 border-neutral-200'">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] font-black uppercase tracking-widest" [ngClass]="(trustProfile()!.currentScore >= 700) ? 'text-emerald-700' : 'text-neutral-500'">
                    Trust Benefit
                  </span>
                </div>
                <p class="text-xs text-neutral-600 font-medium">
                  {{ (trustProfile()!.currentScore >= 700) ? 'Extra ' + product()!.trustScoreDiscount + '% OFF applied automatically!' : 'Score 700+ to unlock extra ' + product()!.trustScoreDiscount + '% discount.' }}
                </p>
              </div>
            </div>

            <!-- Variants Mobile -->
            <div *ngIf="product()!.variants?.length" class="space-y-4">
              <div *ngFor="let variant of product()!.variants" class="space-y-2">
                 <h4 class="text-xs font-black uppercase text-neutral-400 tracking-wider">{{ variant.name }}: <span class="text-neutral-charcoal font-bold">{{ selectedVariants()[variant.name] }}</span></h4>
                 <div class="flex flex-wrap gap-2">
                    <button 
                      *ngFor="let option of variant.options" 
                      (click)="selectVariant(variant.name, option.value)"
                      class="px-4 py-2 text-xs font-bold border rounded-lg transition-all"
                      [ngClass]="selectedVariants()[variant.name] === option.value ? 'border-primary bg-primary text-white shadow-md scale-105' : 'border-neutral-200 text-neutral-600 bg-white'"
                    >
                      {{ option.value }}
                    </button>
                 </div>
              </div>
            </div>

            <!-- Buy Info / Shipping -->
            <div class="space-y-3 pt-2 text-sm">
               <div class="flex items-center gap-2 text-emerald-700 font-bold">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                 In Stock
               </div>
               <div class="text-neutral-600">
                 FREE delivery <span class="font-bold text-neutral-800">Tomorrow</span>
               </div>
               <div class="text-xs text-neutral-500">
                 Ships from <span class="font-bold">Chommie</span> • Sold by <span class="font-bold">Chommie Retail</span>
               </div>
            </div>

            <!-- Specifications Table (Amazon Grade) -->
            <div *ngIf="product()!.specifications" class="pt-6 border-t border-neutral-100">
               <h4 class="font-black text-xs uppercase text-neutral-400 tracking-widest mb-3">Specifications</h4>
               <div class="border border-neutral-200 rounded-lg overflow-hidden">
                  <div *ngFor="let spec of product()!.specifications | keyvalue" class="grid grid-cols-3 text-xs border-b border-neutral-100 last:border-0">
                     <div class="p-3 bg-neutral-50 font-bold text-neutral-500 border-r border-neutral-100">{{ spec.key }}</div>
                     <div class="p-3 col-span-2 text-neutral-700 bg-white">{{ spec.value }}</div>
                  </div>
               </div>
            </div>

            <!-- Description Mobile -->
            <div class="pt-6 border-t border-neutral-100">
               <h4 class="font-black text-xs uppercase text-neutral-400 tracking-widest mb-3">Product Description</h4>
               <p class="text-sm text-neutral-700 leading-relaxed">{{ product()!.description }}</p>
            </div>

            <!-- Reviews Mobile -->
            <div class="pt-8 border-t border-neutral-100 pb-10">
               <div class="flex justify-between items-center mb-6">
                 <h4 class="font-black text-xs uppercase text-neutral-400 tracking-widest">Customer Reviews</h4>
                 <span class="text-xs font-bold text-primary">{{ reviews().length }} total</span>
               </div>
               <div class="space-y-6">
                 <div *ngFor="let review of reviews().slice(0, 3)" class="space-y-2">
                   <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600">
                        {{ review.userName?.charAt(0) }}
                      </div>
                      <span class="text-xs font-bold text-neutral-800">{{ review.userName }}</span>
                   </div>
                   <div class="flex items-center gap-2">
                      <div class="flex text-amber-500 text-[10px]">
                         <span *ngFor="let s of [1,2,3,4,5]">{{ s <= review.rating ? '★' : '☆' }}</span>
                      </div>
                      <span *ngIf="review.verifiedPurchase" class="text-[10px] font-bold text-orange-700 uppercase tracking-tighter">Verified Purchase</span>
                   </div>
                   <p class="text-xs text-neutral-600 line-clamp-3 italic">"{{ review.comment }}"</p>
                 </div>
                 <button *ngIf="reviews().length > 3" class="w-full py-3 text-xs font-bold text-primary border border-primary/20 rounded-lg">Read all reviews</button>
               </div>
            </div>
          </div>

          <!-- Sticky Mobile Action Bar -->
          <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 z-[60] flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-slide-up">
            <div class="flex-grow flex gap-2">
              <button (click)="addToCart()" class="flex-1 bg-white border-2 border-primary text-primary font-black py-3 rounded-xl text-sm transition-transform active:scale-95 shadow-sm">
                Add to Cart
              </button>
              <button (click)="buyNow()" class="flex-1 bg-primary text-white font-black py-3 rounded-xl text-sm transition-transform active:scale-95 shadow-md">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      } @else {
        <!-- ORIGINAL DESKTOP UI (UNTOUCHED) -->
        <!-- Top Bar / Breadcrumbs -->
        <div class="border-b border-neutral-200 bg-white sticky top-[124px] z-20">
          <div class="w-full px-4 py-2 flex items-center text-xs text-neutral-500">
            <a routerLink="/" class="hover:underline hover:text-primary">Registry</a>
            <span class="mx-1">›</span>
            <a [routerLink]="['/products']" [queryParams]="{category: product()!.category}" class="hover:underline hover:text-primary">{{ product()!.category }}</a>
            <span class="mx-1">›</span>
            <span class="text-neutral-700 truncate max-w-[200px]">{{ product()!.name }}</span>
          </div>
        </div>

        <!-- Added to Cart Toast -->
        <div *ngIf="showAddedToCart()" class="fixed top-20 right-4 z-50 bg-white border border-l-4 border-l-emerald-500 rounded shadow-lg p-4 animate-slide-left max-w-sm flex items-start gap-3">
            <div class="text-emerald-500 mt-0.5">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div>
                <h4 class="font-bold text-neutral-charcoal text-sm">Added to Cart</h4>
                <div class="flex items-center gap-2 mt-2">
                    <img [src]="product()?.images[0]" class="w-8 h-8 object-contain">
                    <span class="text-xs text-neutral-600 line-clamp-1">{{ product()?.name }}</span>
                </div>
                <div class="mt-3 flex gap-2">
                    <button routerLink="/cart" class="btn-secondary text-xs py-1 px-3 rounded-md w-full">View Cart</button>
                    <button routerLink="/checkout" class="btn-primary text-xs py-1 px-3 rounded-md w-full">Checkout</button>
                </div>
            </div>
            <button (click)="showAddedToCart.set(false)" class="text-neutral-400 hover:text-neutral-600">×</button>
        </div>

        <div class="w-full px-4 py-6 animate-fade-in">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-32 items-start">
            
            <!-- Left: Image Gallery (Sticky) -->
            <div class="lg:col-span-5 lg:sticky lg:top-40">
               <div class="relative overflow-hidden group">
                  <div class="aspect-square flex items-center justify-center p-4 bg-white">
                     <img *ngIf="product()!.images?.length" [src]="getDisplayImage()" [alt]="product()!.name" class="max-h-full max-w-full object-contain mix-blend-multiply cursor-zoom-in" (click)="showLightbox.set(true)">
                  </div>
               </div>
               <!-- Thumbnails -->
               <div class="flex gap-2 mt-4 justify-center" *ngIf="product()!.images?.length > 1">
                  <div *ngFor="let img of product()!.images" 
                       (mouseover)="hoveredImage.set(img)"
                       class="w-10 h-10 border border-neutral-300 hover:border-primary rounded p-1 cursor-pointer transition-all"
                       [class.border-primary]="hoveredImage() === img">
                      <img [src]="img" class="w-full h-full object-contain">
                  </div>
               </div>
            </div>

            <!-- Center: Product Info -->
            <div class="lg:col-span-4 space-y-4">
              
              <div class="space-y-1">
                <h1 class="text-2xl font-medium text-neutral-charcoal leading-tight">{{ product()!.name }}</h1>
                
                <div class="flex items-center gap-1 text-sm">
                   <div class="flex text-amber-500 text-sm">
                      <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product()!.ratings) ? '★' : '☆' }}</span>
                   </div>
                   <span class="text-primary hover:underline cursor-pointer ml-1">{{ product()!.numReviews }} ratings</span>
                </div>
              </div>

              <div class="h-px bg-neutral-200"></div>

              <!-- Pricing -->
              <div class="space-y-1">
                 <div class="flex items-baseline gap-2">
                    <span class="text-red-700 text-2xl font-medium" *ngIf="product()!.isLightningDeal || product()!.discountPrice">-{{ getDiscountPercent() }}%</span>
                    <span class="text-3xl font-medium text-neutral-charcoal relative top-1"><span class="text-xs align-top top-1 relative">R</span>{{ getDisplayPrice() | number:'1.0-0' }}</span>
                 </div>
                 <div class="text-xs text-neutral-500" *ngIf="product()!.isLightningDeal || product()!.discountPrice">
                    List Price: <span class="line-through">R{{ product()!.price | number:'1.0-0' }}</span>
                 </div>
                 <div class="text-xs text-neutral-500 mt-2">
                    Prices include VAT.
                 </div>

                 <!-- Trust Score Benefit -->
                 <div *ngIf="trustProfile() && product()!.trustScoreDiscount > 0" class="mt-3 p-2 rounded border flex items-center gap-3 transition-all shadow-sm"
                      [ngClass]="(trustProfile()!.currentScore >= 700 || trustProfile()!.tier === 'GOLD' || trustProfile()!.tier === 'PLATINUM') ? 'bg-emerald-50 border-emerald-100' : 'bg-neutral-50 border-neutral-200 opacity-75'">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" 
                         [ngClass]="(trustProfile()!.currentScore >= 700) ? 'bg-emerald-500 text-white' : 'bg-neutral-400 text-white'">
                       {{ trustProfile()!.currentScore }}
                    </div>
                    <div>
                       <div class="text-xs font-bold" [ngClass]="(trustProfile()!.currentScore >= 700) ? 'text-emerald-700' : 'text-neutral-600'">
                          {{ (trustProfile()!.currentScore >= 700) ? 'Trust Discount Applied!' : 'Increase Trust Score for Discounts' }}
                       </div>
                       <div class="text-[10px] text-neutral-500">
                          {{ (trustProfile()!.currentScore >= 700) ? 'You saved an extra ' + product()!.trustScoreDiscount + '% thanks to your High Trust Score.' : 'Score 700+ to unlock an extra ' + product()!.trustScoreDiscount + '% discount.' }}
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Variants -->
              <div *ngIf="product()!.variants?.length" class="space-y-4 pt-2">
                <div *ngFor="let variant of product()!.variants" class="space-y-2">
                   <h4 class="text-xs font-bold text-neutral-600">{{ variant.name }}: <span class="font-normal text-neutral-800">{{ selectedVariants()[variant.name] }}</span></h4>
                   <div class="flex flex-wrap gap-2">
                      <button 
                        *ngFor="let option of variant.options" 
                        (click)="selectVariant(variant.name, option.value)"
                        class="px-3 py-1 text-xs border rounded-md transition-all shadow-sm"
                        [ngClass]="selectedVariants()[variant.name] === option.value ? 'border-primary ring-1 ring-primary bg-primary/5 font-bold' : 'border-neutral-300 hover:bg-neutral-50'"
                      >
                        {{ option.value }}
                      </button>
                   </div>
                </div>
              </div>

              <!-- Specifications (Amazon Grade) -->
              <div *ngIf="product()!.specifications" class="pt-6 border-t border-neutral-100">
                 <h4 class="font-bold text-sm mb-3">Product Details</h4>
                 <div class="grid grid-cols-2 gap-y-2 text-sm">
                    <ng-container *ngFor="let spec of product()!.specifications | keyvalue">
                       <div class="font-bold text-neutral-600">{{ spec.key }}</div>
                       <div class="text-neutral-800">{{ spec.value }}</div>
                    </ng-container>
                 </div>
              </div>

              <!-- Description -->
              <div class="pt-4">
                 <h4 class="font-bold text-sm mb-2">About this item</h4>
                 <ul class="list-disc pl-5 space-y-1 text-sm text-neutral-700 leading-normal">
                     <li>{{ product()!.description }}</li>
                     <li>High-performance engineered design.</li>
                     <li>Seamless integration with existing protocols.</li>
                     <li>Sustainable materials verified by Chommie Nexus.</li>
                 </ul>
              </div>
            </div>

            <!-- Right: Buy Box (Sticky) -->
            <div class="lg:col-span-3">
               <div class="border border-neutral-300 rounded-lg p-4 bg-white shadow-sm lg:sticky lg:top-40 space-y-4">
                  <div>
                    <div class="text-2xl font-medium text-neutral-charcoal mb-1"><span class="text-xs align-top relative top-1">R</span>{{ getDisplayPrice() | number:'1.0-0' }}</div>
                    <div class="text-sm text-neutral-600">
                        <span class="text-primary hover:underline cursor-pointer">FREE Returns</span>
                    </div>
                  </div>

                  <div class="text-sm">
                      <div class="text-emerald-700 font-bold mb-1">In Stock</div>
                      <div class="text-neutral-700 font-bold">Fastest delivery <span class="text-neutral-900">Tomorrow, Jan 16</span></div>
                      <div class="text-neutral-500 text-xs mt-1">Order within <span class="text-emerald-600 font-bold">4 hrs 12 mins</span></div>
                  </div>

                  <!-- Delivery Type Toggle -->
                  <div *ngIf="product()?.category === 'Home' || product()?.category === 'Beauty' || product()?.category === 'Grocery'" class="border border-neutral-300 rounded-md p-3 bg-neutral-50 space-y-3">
                      <div class="flex items-start gap-2 cursor-pointer" (click)="purchaseType.set('onetime')">
                          <input type="radio" name="purchaseType" [checked]="purchaseType() === 'onetime'" class="mt-1 text-primary focus:ring-primary">
                          <div class="text-sm">
                              <div class="font-bold text-neutral-800">One-time purchase</div>
                              <div class="text-neutral-800 font-medium">R{{ getDisplayPrice() | number:'1.0-0' }}</div>
                          </div>
                      </div>
                      
                      <div class="flex items-start gap-2 cursor-pointer" (click)="purchaseType.set('subscription')">
                          <input type="radio" name="purchaseType" [checked]="purchaseType() === 'subscription'" class="mt-1 text-primary focus:ring-primary">
                          <div class="text-sm">
                              <div class="font-bold text-neutral-800 flex items-center gap-1">
                                  Subscribe & Save
                                  <span class="text-[10px] font-normal text-emerald-700 bg-emerald-100 px-1 rounded">-5%</span>
                              </div>
                              <div class="text-neutral-800 font-medium">R{{ (getDisplayPrice() * 0.95) | number:'1.0-0' }}</div>
                          </div>
                      </div>
                  </div>

                  <div class="space-y-3">
                    <select [ngModel]="selectedQuantity()" (ngModelChange)="selectedQuantity.set($event)" class="w-full bg-neutral-100 border border-neutral-300 rounded-md py-1.5 px-2 text-sm shadow-sm focus:ring-primary focus:border-primary cursor-pointer font-bold">
                        <option *ngFor="let q of [1,2,3,4,5,6,7,8,9,10]" [value]="q">Qty: {{ q }}</option>
                    </select>

                    <button (click)="addToCart()" class="w-full btn-primary rounded-full py-2.5 text-sm shadow-sm font-bold transition-transform active:scale-95">
                        {{ ts.t('product.add_to_cart') }}
                    </button>
                    <button (click)="buyNow()" class="w-full bg-[#FA8900] hover:bg-[#E67A00] text-white border-transparent rounded-full py-2.5 text-sm shadow-sm cursor-pointer transition-colors font-bold active:scale-95">
                        {{ purchaseType() === 'subscription' ? 'Set Up Subscription' : ts.t('product.buy_now') }}
                    </button>
                  </div>

                  <div class="text-[11px] text-neutral-500 pt-2 space-y-1">
                      <div class="flex justify-between border-b border-neutral-100 pb-1">
                          <span>Ships from</span> <span class="font-bold text-neutral-700">Chommie.za</span>
                      </div>
                      <div class="flex justify-between border-b border-neutral-100 pb-1 pt-1">
                          <span>Sold by</span> <span class="text-primary hover:underline cursor-pointer font-bold">Chommie Retail</span>
                      </div>
                      <div class="flex justify-between pt-1">
                          <span>Returns</span> <span class="text-primary hover:underline cursor-pointer">Eligible for Return</span>
                      </div>
                  </div>

                  <button (click)="addToWishlist()" class="w-full text-center text-sm font-bold text-neutral-700 hover:text-primary border border-neutral-300 rounded-md px-3 py-2 shadow-sm bg-white mt-4">
                      Add to Registry
                  </button>
               </div>
            </div>

          </div>

          <div class="h-px bg-neutral-200 my-8"></div>

          <!-- Extra Content (Amazon Grade) -->
          <div class="space-y-16">
            
            <!-- Frequently Bought Together -->
            <section *ngIf="frequentlyBought().length > 0">
              <h2 class="text-xl font-bold text-neutral-charcoal mb-6">Frequently bought together</h2>
              <div class="flex flex-col md:flex-row items-center gap-8 p-8 border border-neutral-200 rounded-2xl bg-neutral-50/20 shadow-sm">
                 <div class="flex items-center gap-4">
                    <div class="w-32 h-32 border border-neutral-200 p-2 rounded-xl bg-white shadow-sm">
                      <img [src]="product()!.images[0]" class="object-contain h-full w-full">
                    </div>
                    <span class="text-2xl text-neutral-300 font-light">+</span>
                    <ng-container *ngFor="let p of frequentlyBought(); let last = last">
                      <div class="w-32 h-32 border border-neutral-200 p-2 rounded-xl bg-white cursor-pointer shadow-sm hover:ring-2 hover:ring-primary transition-all" [routerLink]="['/products', p.id || p._id]">
                        <img [src]="p.images[0]" class="object-contain h-full w-full">
                      </div>
                      <span *ngIf="!last" class="text-2xl text-neutral-300 font-light">+</span>
                    </ng-container>
                 </div>
                 
                 <div class="md:ml-auto md:border-l md:pl-10 border-neutral-200 space-y-4 min-w-[280px]">
                    <div class="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-3">
                        <svg class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1.193.985A1.993 1.993 0 009 6zm4 0V5a1 1 0 10-1.193.985A1.993 1.993 0 0013 6z" clip-rule="evenodd" /><path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" /></svg>
                        <div>
                           <div class="text-xs font-black text-emerald-700 uppercase tracking-widest">Bundle Discount</div>
                           <div class="text-[10px] text-emerald-600 font-bold">Extra {{ bundleDiscount * 100 }}% OFF applied</div>
                        </div>
                    </div>
                    <div>
                       <span class="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Total Bundle Price</span>
                       <div class="flex items-baseline gap-2">
                          <span class="text-3xl font-black text-red-700">R{{ getTotalPrice() | number:'1.0-0' }}</span>
                          <span class="text-sm text-neutral-400 line-through">R{{ getBundleOriginalPrice() | number:'1.0-0' }}</span>
                       </div>
                    </div>
                    <button (click)="addAllToCart()" class="btn-primary w-full py-3 rounded-xl shadow-md font-black uppercase text-xs tracking-widest transition-transform active:scale-95">
                       Add bundle to Cart
                    </button>
                 </div>
              </div>
            </section>

            <!-- Product Comparison Table -->
            <section *ngIf="comparisonProducts().length > 1">
              <h2 class="text-xl font-bold text-neutral-charcoal mb-6 border-b border-neutral-100 pb-4">Compare with similar items</h2>
              <div class="overflow-x-auto rounded-2xl border border-neutral-200 shadow-sm">
                 <table class="w-full text-left border-collapse bg-white">
                    <thead>
                       <tr class="bg-neutral-50">
                          <th class="p-6 border-b border-neutral-200 w-48 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Asset Attributes</th>
                          <th *ngFor="let p of comparisonProducts()" class="p-6 border-b border-neutral-200 min-w-[220px]">
                             <div class="space-y-3">
                                <div class="h-32 flex items-center justify-center p-2 bg-white rounded-lg border border-neutral-100">
                                   <img [src]="p.images[0]" class="max-h-full max-w-full object-contain mix-blend-multiply">
                                </div>
                                <div class="text-sm font-bold text-primary hover:underline cursor-pointer line-clamp-2 leading-tight h-10" [routerLink]="['/products', p.id || p._id]">{{ p.name }}</div>
                             </div>
                          </th>
                       </tr>
                    </thead>
                    <tbody class="text-sm">
                       <tr>
                          <td class="p-6 border-b border-neutral-100 font-bold bg-neutral-50/30 text-xs text-neutral-500 uppercase">Customer Rating</td>
                          <td *ngFor="let p of comparisonProducts()" class="p-6 border-b border-neutral-100">
                             <div class="flex items-center gap-1.5">
                                <span class="text-amber-500 font-bold">★ {{ p.ratings }}</span>
                                <span class="text-neutral-400 text-xs">({{ p.numReviews }})</span>
                             </div>
                          </td>
                       </tr>
                       <tr>
                          <td class="p-6 border-b border-neutral-100 font-bold bg-neutral-50/30 text-xs text-neutral-500 uppercase">Market Price</td>
                          <td *ngFor="let p of comparisonProducts()" class="p-6 border-b border-neutral-100">
                             <span class="text-lg font-black text-neutral-800 tracking-tighter">R{{ p.price | number:'1.0-0' }}</span>
                          </td>
                       </tr>
                       <tr>
                          <td class="p-6 border-b border-neutral-100 font-bold bg-neutral-50/30 text-xs text-neutral-500 uppercase">Nexus Category</td>
                          <td *ngFor="let p of comparisonProducts()" class="p-6 border-b border-neutral-100">
                             <span class="px-2 py-1 bg-neutral-100 rounded-md text-[10px] font-black text-neutral-600 uppercase tracking-widest">{{ p.category }}</span>
                          </td>
                       </tr>
                       <tr>
                          <td class="p-6 border-b border-neutral-100 font-bold bg-neutral-50/30 text-xs text-neutral-500 uppercase">BNPL Ready</td>
                          <td *ngFor="let p of comparisonProducts()" class="p-6 border-b border-neutral-100">
                             <span *ngIf="p.bnplEligible" class="text-emerald-600 font-black flex items-center gap-1 text-[10px] uppercase">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                Eligible
                             </span>
                             <span *ngIf="!p.bnplEligible" class="text-neutral-300 font-bold text-[10px] uppercase">Not Enabled</span>
                          </td>
                       </tr>
                       <tr>
                          <td class="p-6 border-b border-neutral-100 font-bold bg-neutral-50/30 text-xs text-neutral-500 uppercase">Logistics</td>
                          <td *ngFor="let p of comparisonProducts()" class="p-6 border-b border-neutral-100">
                             <span class="text-xs font-bold text-neutral-700">FREE One-Day Delivery</span>
                          </td>
                       </tr>
                       <tr>
                          <td class="p-6 bg-neutral-50/30"></td>
                          <td *ngFor="let p of comparisonProducts()" class="p-6">
                             <button (click)="p._id === product()._id ? addToCart() : cartService.addToCart(p)" class="w-full btn-secondary text-[10px] font-black uppercase tracking-widest py-2 rounded-lg shadow-sm active:scale-95 transition-transform">
                                Add to Cart
                             </button>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
            </section>

            <!-- Recommendations (Browsing History Based) -->
            <section *ngIf="alsoViewedProducts().length > 0">
              <h2 class="text-xl font-bold text-neutral-charcoal mb-6 border-b border-neutral-100 pb-4">Inspired by your browsing history</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div *ngFor="let p of alsoViewedProducts()" class="group cursor-pointer" [routerLink]="['/products', p.id || p._id]">
                  <div class="aspect-square border border-neutral-200 rounded-2xl p-4 flex items-center justify-center bg-white group-hover:shadow-md group-hover:border-primary/20 transition-all relative overflow-hidden">
                     <img [src]="p.images[0]" [alt]="p.name" class="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500">
                     <div *ngIf="p.isLightningDeal" class="absolute top-3 left-3 bg-red-700 text-white text-[9px] font-black px-2 py-0.5 rounded-sm uppercase shadow-sm">DEAL</div>
                  </div>
                  <div class="mt-3 space-y-1 px-1">
                     <a class="text-sm font-bold text-primary group-hover:text-red-700 group-hover:underline line-clamp-2 leading-tight h-10 transition-colors">{{ p.name }}</a>
                     <div class="flex items-center gap-1">
                        <div class="flex text-amber-500 text-[10px]">
                           <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(p.ratings) ? '★' : '☆' }}</span>
                        </div>
                        <span class="text-neutral-400 text-[10px]">({{ p.numReviews }})</span>
                     </div>
                     <div class="text-base font-black text-neutral-800 tracking-tight">R{{ p.price | number:'1.0-0' }}</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- AI Insight Summary (Enhanced) -->
            <section *ngIf="productInsight()" class="bg-neutral-50 rounded-[2rem] p-10 border border-neutral-200 shadow-inner relative overflow-hidden">
               <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
               
               <div class="flex items-center gap-4 mb-8 relative z-10">
                  <div class="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20 text-white">
                     <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                     <h2 class="text-2xl font-black text-neutral-charcoal tracking-tighter uppercase">Chommie AI Insight</h2>
                     <p class="text-[10px] text-neutral-400 uppercase tracking-[0.3em] font-black">Neural Analysis of 1,200+ Customer Signals</p>
                  </div>
                  <div class="ml-auto flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-neutral-200 text-[10px] font-black text-neutral-400 shadow-sm">
                     <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     LIVE ANALYSIS ACTIVE
                  </div>
               </div>
    
               <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                  <div class="lg:col-span-2 space-y-6">
                     <p class="text-neutral-700 leading-relaxed italic text-2xl font-medium tracking-tight">
                        "{{ productInsight().summary }}"
                     </p>
                     <div class="flex flex-wrap gap-3">
                        <span *ngFor="let p of productInsight().pros" class="px-4 py-2 bg-white border border-emerald-100 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                           <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                           {{ p }}
                        </span>
                     </div>
                  </div>
                  <div class="bg-white p-8 rounded-[2rem] border border-neutral-100 space-y-6 shadow-xl">
                     <div class="flex justify-between items-end">
                        <span class="text-xs font-black text-neutral-400 uppercase tracking-widest">SENTIMENT SCORE</span>
                        <span class="text-lg font-black text-emerald-600 uppercase">{{ productInsight().sentiment }}</span>
                     </div>
                     <div class="h-3 bg-neutral-50 rounded-full overflow-hidden border border-neutral-100 p-0.5">
                        <div class="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-inner" [style.width.%]="productInsight().sentiment === 'Highly Positive' ? 95 : 75"></div>
                     </div>
                     <div class="text-[10px] text-neutral-400 font-bold leading-relaxed uppercase tracking-tighter">
                        This synthesis is computed by Chommie Neural Engine based on massive customer feedback and technical metadata.
                     </div>
                  </div>
               </div>
            </section>
    
            <!-- Customer Reviews (Amazon Grade) -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">             
               <!-- Left: Rating Snapshot -->
               <div class="lg:col-span-4 space-y-8">
                  <h2 class="text-2xl font-black text-neutral-charcoal tracking-tighter uppercase border-b border-neutral-100 pb-4">Customer Reviews</h2>
                  <div class="space-y-4">
                     <div class="flex items-center gap-3">
                        <div class="flex text-amber-500 text-2xl">
                           <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product()!.ratings) ? '★' : '☆' }}</span>
                        </div>
                        <span class="text-2xl font-black text-neutral-800 tracking-tight">{{ product()!.ratings }} out of 5</span>
                     </div>
                     <div class="text-sm font-bold text-neutral-400 uppercase tracking-widest">{{ product()!.numReviews }} Global Ratings</div>
                  </div>

                  <!-- Histogram -->
                  <div class="space-y-3">
                     <div *ngFor="let star of [5,4,3,2,1]" class="flex items-center gap-4 text-sm group cursor-pointer">
                        <span class="w-14 text-primary font-black text-xs hover:text-action transition-colors">{{ star }} star</span>
                        <div class="flex-grow h-5 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 p-0.5">
                           <div class="h-full bg-amber-400 rounded-md shadow-inner transition-all group-hover:bg-amber-500" [style.width.%]="star === 5 ? 70 : (star === 4 ? 20 : 5)"></div>
                        </div>
                        <span class="w-10 text-right text-neutral-400 font-bold text-xs">{{ star === 5 ? '70%' : (star === 4 ? '20%' : '5%') }}</span>
                     </div>
                  </div>

                  <div class="pt-10 border-t border-neutral-100">
                     <h3 class="font-black text-lg text-neutral-800 mb-2 uppercase tracking-tight">Review this product</h3>
                     <p class="text-sm text-neutral-500 mb-6 font-medium">Share your thoughts with other customers</p>
                     <button class="w-full btn-secondary py-3 rounded-xl border-2 border-neutral-200 font-black text-xs uppercase tracking-widest hover:bg-neutral-50 transition-all shadow-sm" (click)="newComment = ' '">Write a customer review</button>
                     
                     <!-- Write Review Form (Enhanced) -->
                     <div *ngIf="newComment !== ''" class="mt-6 p-6 bg-neutral-50 rounded-2xl border-2 border-neutral-200 space-y-4 animate-fade-in shadow-xl relative">
                        <button (click)="newComment = ''" class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 text-xl font-bold">×</button>
                        <div>
                           <label class="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Rating</label>
                           <div class="flex gap-2 text-amber-500 text-2xl">
                              <span *ngFor="let s of [1,2,3,4,5]" (click)="newRating = s" class="cursor-pointer hover:scale-125 transition-transform">{{ s <= newRating ? '★' : '☆' }}</span>
                           </div>
                        </div>
                        <div>
                           <label class="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Comment</label>
                           <textarea [(ngModel)]="newComment" rows="4" class="w-full text-sm border-2 border-neutral-200 rounded-xl p-4 bg-white focus:border-primary focus:ring-0 outline-none transition-all shadow-inner" placeholder="What did you like or dislike?"></textarea>
                        </div>
                        <div class="flex justify-end pt-2">
                           <button (click)="submitReview()" [disabled]="submitting()" class="btn-primary font-black uppercase tracking-[0.2em] text-[10px] px-8 py-3 rounded-xl shadow-lg disabled:opacity-50">
                              {{ submitting() ? 'Submitting...' : 'Post Review' }}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               <!-- Right: Reviews List -->
               <div class="lg:col-span-8">
                  <h3 class="font-black text-lg text-neutral-800 mb-8 uppercase tracking-tight border-b border-neutral-100 pb-4">Top reviews from South Africa</h3>
                  
                  <div *ngIf="reviews().length === 0" class="py-20 text-center bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200">
                     <p class="text-neutral-400 font-bold text-sm uppercase tracking-widest">No reviews detected in this sector.</p>
                  </div>

                  <div class="space-y-10">
                     <div *ngFor="let review of reviews()" class="animate-fade-in">
                        <div class="flex items-center gap-3 mb-4">
                           <div class="w-10 h-10 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center text-xs font-black text-neutral-400 shadow-sm">
                              {{ review.userName?.charAt(0) || 'U' }}
                           </div>
                           <span class="text-sm font-black text-neutral-800 uppercase tracking-tighter">{{ review.userName }}</span>
                        </div>
                        <div class="flex items-center gap-3 mb-3">
                           <div class="flex text-amber-500 text-sm">
                              <span *ngFor="let s of [1,2,3,4,5]">{{ s <= review.rating ? '★' : '☆' }}</span>
                           </div>
                           <span class="text-sm font-black text-neutral-800 tracking-tight">{{ review.title || 'Great Purchase' }}</span>
                        </div>
                        <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Reviewed in South Africa on {{ review.createdAt | date:'longDate' }}</div>
                        <div class="text-[10px] text-orange-700 font-black uppercase tracking-[0.15em] mb-4 flex items-center gap-1" *ngIf="review.verifiedPurchase">
                           <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                           Verified Purchase
                        </div>
                        
                        <p class="text-base text-neutral-700 leading-relaxed mb-6 font-medium">{{ review.comment }}</p>

                        <div class="flex gap-3 mb-6" *ngIf="review.images?.length">
                           <img *ngFor="let img of review.images" [src]="img" class="w-24 h-24 object-cover border-2 border-neutral-100 rounded-2xl cursor-pointer hover:border-primary/50 hover:scale-105 transition-all shadow-sm">
                        </div>

                        <div class="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                           <span *ngIf="review.helpfulVotes > 0" class="text-emerald-600">{{ review.helpfulVotes }} helpful signals</span>
                           <button (click)="onHelpfulClick(review._id)" class="px-6 py-2 border-2 border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all text-neutral-700 shadow-sm">
                              Helpful
                           </button>
                           <button class="hover:text-red-600 transition-colors">Report Abuse</button>
                        </div>
                        <div class="h-px bg-neutral-100 mt-10"></div>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      }
    </div>

    <!-- Lightbox (Amazon Grade) -->
    <div *ngIf="showLightbox()" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-10 animate-fade-in" (click)="showLightbox.set(false)">
        <button class="absolute top-10 right-10 text-white/40 hover:text-white text-4xl font-light">&times;</button>
        <div class="max-w-5xl w-full h-full flex flex-col md:flex-row gap-10 items-center justify-center" (click)="$event.stopPropagation()">
            <div class="flex-grow flex items-center justify-center h-[70vh]">
                <img [src]="hoveredImage() || product()!.images[0]" class="max-h-full max-w-full object-contain filter drop-shadow-2xl">
            </div>
            <div class="w-full md:w-32 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[70vh] scrollbar-hide">
                <div *ngFor="let img of product()!.images" 
                     (click)="hoveredImage.set(img)"
                     class="w-20 h-20 md:w-24 md:h-24 border-2 border-white/10 rounded-xl p-2 cursor-pointer hover:border-primary transition-all shrink-0 bg-white/5"
                     [class.border-primary]="hoveredImage() === img">
                    <img [src]="img" class="w-full h-full object-contain">
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
export class ProductDetailComponent implements OnInit, OnDestroy {
  product = signal<any | null>(null);
  reviews = signal<any[]>([]);
  questions = signal<any[]>([]);
  newQuestion = signal('');
  relatedProducts = signal<any[]>([]);
  alsoViewedProducts = signal<any[]>([]);
  frequentlyBought = signal<any[]>([]);
  comparisonProducts = signal<any[]>([]);
  productInsight = signal<any | null>(null);
  userId = localStorage.getItem('user_id');
  newRating = 5;
  newComment = '';
  newImages = ''; 
  submitting = signal(false);
  Math = Math;
  timeRemaining = signal<string>('');
  timerInterval: any;
  selectedVariants = signal<Record<string, string>>({});
  selectedQuantity = signal<number>(1);
  purchaseType = signal<'onetime' | 'subscription'>('onetime');
  currentLocation = signal(localStorage.getItem('delivery_location') || 'South Africa');
  trustProfile = signal<TrustProfile | null>(null);
  
  // UI States
  showLightbox = signal(false);
  hoveredImage = signal<string | null>(null);

  bundleDiscount = 0.05; // 5% discount for bundle

  bnplInstallments = computed(() => {
    const price = this.getDisplayPrice();
    const quantity = this.selectedQuantity();
    const total = price * quantity;
    return {
      firstPayment: total / 2,
      secondPayment: total / 2,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    };
  });

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private bnplService: BnplService,
    public ts: TranslationService,
    private router: Router,
    public deviceService: DeviceService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
        this.loadReviews(id);
        this.loadQuestions(id);
        this.loadRelated(id);
        this.loadAlsoViewed(id);
        this.loadFrequentlyBought(id);
        this.loadComparison(id);
        this.loadProductInsight(id);
        this.addToHistory(id);
        if (this.userId) {
            this.loadTrustProfile(this.userId);
        }
      }
    });
    this.startTimer();
  }

  loadTrustProfile(userId: string) {
    this.bnplService.getProfile(userId).subscribe({
        next: (profile) => this.trustProfile.set(profile),
        error: () => console.warn('Could not load trust profile')
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  getDiscountPercent() {
    if (!this.product()) return 0;
    const original = this.product()!.price;
    const current = this.getDisplayPrice();
    return Math.round(((original - current) / original) * 100);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.product()?.dealEndsAt) {
        const now = new Date().getTime();
        const end = new Date(this.product()!.dealEndsAt).getTime();
        const diff = end - now;

        if (diff <= 0) {
          this.timeRemaining.set('Deal ended');
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        this.timeRemaining.set(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
  }

  getClaimedPercentage() {
    if (!this.product()?.lightningDealStock) return 0;
    return Math.min(100, Math.round((this.product()!.lightningDealSold / this.product()!.lightningDealStock) * 100));
  }

  selectVariant(name: string, value: string) {
    this.selectedVariants.update(v => ({ ...v, [name]: value }));
  }

  getDisplayPrice(): number {
    if (!this.product()) return 0;
    let price = (this.product()!.isLightningDeal ? this.product()!.discountPrice : this.product()!.price) || 0;
    
    // Apply Trust Score Discount if eligible
    const profile = this.trustProfile();
    if (profile && this.product()!.trustScoreDiscount > 0) {
        if (profile.currentScore >= 700 || profile.tier === 'GOLD' || profile.tier === 'PLATINUM') {
            price = price * (1 - this.product()!.trustScoreDiscount / 100);
        }
    }

    if (this.product()?.bulkPricing && this.product()!.bulkPricing.length > 0) {
        const quantity = this.selectedQuantity();
        const tiers = [...this.product()!.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
        const applicableTier = tiers.find(t => quantity >= t.minQuantity);
        if (applicableTier) {
            price = price * (1 - applicableTier.discountPercentage / 100);
        }
    }

    if (this.product()!.variants) {
      this.product()!.variants.forEach((v: any) => {
        const selectedValue = this.selectedVariants()[v.name];
        if (selectedValue) {
          const option = v.options.find((o: any) => o.value === selectedValue);
          if (option?.priceModifier) {
            price += option.priceModifier;
          }
        }
      });
    }
    return price;
  }

  getDisplayImage(): string {
    if (!this.product()) return '';
    if (this.hoveredImage()) return this.hoveredImage()!;
    if (this.product()!.variants) {
      for (const v of this.product()!.variants) {
        const selectedValue = this.selectedVariants()[v.name];
        const option = v.options.find((o: any) => o.value === selectedValue);
        if (option?.image) return option.image;
      }
    }
    return this.product()!.images?.[0] || '';
  }

  addToHistory(id: string) {
    const history = JSON.parse(localStorage.getItem('recent_history') || '[]');
    const updated = [id, ...history.filter((i: string) => i !== id)].slice(0, 6);
    localStorage.setItem('recent_history', JSON.stringify(updated));
  }

  trackCategoryView(category: string) {
    if (!this.userId) return;
    this.authService.updateFavoriteCategory(this.userId, category).subscribe();
  }

  loadProduct(id: string) {
    this.productService.getProduct(id).subscribe(p => {
      this.product.set(p);
      this.trackCategoryView(p.category);
      if (p.variants) {
        const defaults: any = {};
        p.variants.forEach((v: any) => {
          if (v.options?.length) {
            defaults[v.name] = v.options[0].value;
          }
        });
        this.selectedVariants.set(defaults);
      }
    });
  }

  loadQuestions(id: string) {
    this.productService.getQuestions(id).subscribe(q => this.questions.set(q));
  }

  submitQuestion() {
    if (!this.userId || !this.newQuestion().trim()) return;
    const data = {
        productId: this.product().id || this.product()._id,
        userId: this.userId,
        userName: localStorage.getItem('user_name') || 'Chommie User',
        text: this.newQuestion()
    };
    this.productService.askQuestion(data).subscribe({
        next: (res) => {
            this.questions.update(q => [res, ...q]);
            this.newQuestion.set('');
        },
        error: () => console.error('Failed to post question')
    });
  }

  loadReviews(id: string) {
    this.productService.getReviews(id).subscribe(r => this.reviews.set(r));
  }

  loadRelated(id: string) {
    this.productService.getRelatedProducts(id).subscribe(rp => this.relatedProducts.set(rp));
  }

  loadAlsoViewed(id: string) {
    this.productService.getAlsoViewedProducts(id).subscribe(av => this.alsoViewedProducts.set(av));
  }

  loadFrequentlyBought(id: string) {
    this.productService.getFrequentlyBoughtTogether(id).subscribe(fb => this.frequentlyBought.set(fb));
  }

  loadComparison(id: string) {
    this.productService.getProductComparison(id).subscribe(cp => this.comparisonProducts.set(cp));
  }

  loadProductInsight(id: string) {
    this.productService.getProductInsight(id).subscribe(insight => this.productInsight.set(insight));
  }

  getTotalPrice() {
    let total = this.getDisplayPrice();
    this.frequentlyBought().forEach(p => total += p.price);
    // Apply bundle discount if there are items in frequently bought
    if (this.frequentlyBought().length > 0) {
        total = total * (1 - this.bundleDiscount);
    }
    return total;
  }

  getBundleOriginalPrice() {
    let total = this.getDisplayPrice();
    this.frequentlyBought().forEach(p => total += p.price);
    return total;
  }

  addAllToCart() {
    const discountFactor = 1 - this.bundleDiscount;
    
    // Add main product with discount
    const mainProduct = {
        ...this.product()!,
        price: this.getDisplayPrice() * discountFactor,
        selectedVariants: this.selectedVariants()
    };
    this.cartService.addToCart(mainProduct, this.selectedQuantity());

    // Add frequently bought items with discount
    this.frequentlyBought().forEach(p => {
        const bundleItem = {
            ...p,
            price: p.price * discountFactor
        };
        this.cartService.addToCart(bundleItem);
    });

    this.showAddedToCart.set(true);
    setTimeout(() => this.showAddedToCart.set(false), 3000);
  }

  showAddedToCart = signal(false);

  addToCart(silent = false) {
    if (this.product()) {
      const productToCart = {
        ...this.product()!,
        price: this.getDisplayPrice(),
        selectedVariants: this.selectedVariants()
      };
      this.cartService.addToCart(productToCart, this.selectedQuantity());
      
      if (!silent) {
          this.showAddedToCart.set(true);
          setTimeout(() => this.showAddedToCart.set(false), 3000);
      }
    }
  }

  buyNow() {
    if (!this.userId) {
        this.router.navigate(['/login']);
        return;
    }

    if (this.purchaseType() === 'subscription') {
        alert('Subscription setup is not yet active in this demo.');
        return;
    }

    // "One Click Buy" simulation
    const hasDefaultAddress = true; // Mock check
    const hasDefaultPayment = true; // Mock check

    if (hasDefaultAddress && hasDefaultPayment) {
        if (confirm(`Place order now for R${this.getDisplayPrice() * this.selectedQuantity()} using your default payment method?`)) {
            // Directly create order
            const orderData = {
                userId: this.userId,
                email: localStorage.getItem('user_email') || 'user@example.com',
                paymentMethod: 'CARD', // Default
                items: [{
                    productId: this.product().id || this.product()._id,
                    productName: this.product().name,
                    productImage: this.product().images?.[0] || '',
                    quantity: this.selectedQuantity(),
                    price: this.getDisplayPrice(),
                    vendorId: this.product().vendorId,
                    selectedVariants: this.selectedVariants()
                }],
                shippingAddress: 'Default Address', 
                status: 'PENDING'
            };
            
            this.orderService.createOrder(orderData).subscribe({
                next: (order) => {
                    this.router.navigate(['/orders']);
                    alert('Order placed successfully!');
                },
                error: () => alert('Failed to place order.')
            });
            return;
        }
    }

    // Fallback to cart checkout
    this.addToCart(true);
    this.router.navigate(['/checkout']);
  }

  addToWishlist() {
    if (!this.userId) {
        this.router.navigate(['/login']);
        return;
    }
    if (this.product()) {
      this.productService.addToWishlist(this.userId, this.product()!.id || this.product()!._id).subscribe();
    }
  }

  onHelpfulClick(reviewId: string) {
    this.productService.voteHelpful(reviewId).subscribe(() => {
      this.reviews.update(reviews => 
        reviews.map(r => r._id === reviewId ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r)
      );
    });
  }

  submitReview() {
    if (!this.product() || !this.userId) return;
    this.submitting.set(true);
    const review = {
      productId: this.product()!.id || this.product()!._id,
      userId: this.userId,
      userName: 'Chommie User',
      rating: this.newRating,
      comment: this.newComment,
      images: this.newImages.split(',').map(s => s.trim()).filter(s => !!s)
    };
    this.productService.addReview(review).subscribe({
      next: (res) => {
        this.reviews.update(r => [res, ...r]);
        this.newComment = '';
        this.newRating = 5;
        this.newImages = '';
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }
}