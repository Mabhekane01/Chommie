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
import { MembershipPromoComponent } from '../../components/membership-promo/membership-promo.component';
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-product-detail',  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MembershipPromoComponent],
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

            <!-- Buy Info / Shipping -->
            <div class="space-y-3 pt-2 text-sm">
               <div class="flex items-center gap-2 text-emerald-700 font-bold" *ngIf="product()!.stock > 0">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                 In Stock
               </div>
               <div class="flex items-center gap-2 text-red-600 font-bold animate-pulse" *ngIf="product()!.stock > 0 && product()!.stock <= (product()!.lowStockThreshold || 10)">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                 Only {{ product()!.stock }} left in stock - order soon.
               </div>
               <div class="text-neutral-600">
                 FREE delivery <span class="font-bold text-neutral-800">{{ deliveryEstimation()?.formattedDate || 'Tomorrow' }}</span>
               </div>
               <!-- Loyalty Reward Points -->
               <div class="flex items-center gap-2 bg-amber-50 border border-amber-100 p-2 rounded-lg">
                  <span class="w-5 h-5 bg-amber-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold">C</span>
                  <span class="text-xs text-amber-900 font-medium">
                    Earn <span class="font-bold">{{ rewardPoints() }}</span> Chommie Points 
                    <span *ngIf="authService.isPlusMember()" class="text-primary font-black">(2x Plus Bonus!)</span>
                  </span>
               </div>
               <div class="text-xs text-neutral-500">
                 Ships from <span class="font-bold">Chommie</span> • Sold by <span class="font-bold">Chommie Retail</span>
               </div>
            </div>

            <!-- Description Mobile -->
            <div class="pt-6 border-t border-neutral-100">
               <h4 class="font-black text-xs uppercase text-neutral-400 tracking-widest mb-3">Product Description</h4>
               <p class="text-sm text-neutral-700 leading-relaxed">{{ product()!.description }}</p>
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
        <!-- ORIGINAL DESKTOP UI -->
        <!-- Top Bar / Breadcrumbs -->
        <div class="border-b border-neutral-200 bg-white sticky top-[140px] lg:top-[156px] z-20">
          <div class="w-full px-4 py-2 flex items-center text-xs text-neutral-500">
            <a routerLink="/" class="hover:underline hover:text-primary">Registry</a>
            <span class="mx-1">›</span>
            <a [routerLink]="['/products']" [queryParams]="{category: product()!.category}" class="hover:underline hover:text-primary">{{ product()!.category }}</a>
            <span class="mx-1">›</span>
            <span class="text-neutral-700 truncate max-w-[200px]">{{ product()!.name }}</span>
          </div>
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
                    <span class="text-3xl font-medium text-neutral-charcoal relative top-1"><span class="text-xs align-top relative top-1">R</span>{{ getDisplayPrice() | number:'1.0-0' }}</span>
                 </div>
                 <div class="text-xs text-neutral-500" *ngIf="product()!.isLightningDeal || product()!.discountPrice">
                    List Price: <span class="line-through">R{{ product()!.price | number:'1.0-0' }}</span>
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

                 <!-- Price History Sparkline -->
                 <div class="mt-6 p-4 border border-neutral-200 rounded-xl bg-neutral-50/30">
                    <div class="flex justify-between items-center mb-3">
                       <span class="text-[10px] font-black uppercase tracking-widest text-neutral-400">Market Valuation Trend</span>
                       <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                          <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
                          Stable
                       </span>
                    </div>
                    <div class="h-12 w-full relative">
                       <svg class="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
                          <path d="M0 15 L10 14 L20 16 L30 12 L40 13 L50 8 L60 9 L70 11 L80 7 L90 8 L100 5" 
                                fill="none" stroke="#FF6D1F" stroke-width="1.5" stroke-linecap="round" />
                          <circle cx="100" cy="5" r="1.5" fill="#FF6D1F" />
                       </svg>
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

              <!-- Description -->
              <div class="pt-4">
                 <h4 class="font-bold text-sm mb-2">About this item</h4>
                 <ul class="list-disc pl-5 space-y-1 text-sm text-neutral-700 leading-normal">
                     <li>{{ product()!.description }}</li>
                 </ul>
              </div>
            </div>

            <!-- Right: Buy Box -->
            <div class="lg:col-span-3">
               <div class="border border-neutral-300 rounded-lg p-4 bg-white shadow-sm lg:sticky lg:top-40 space-y-4">
                  <div>
                    <div class="text-2xl font-medium text-neutral-charcoal mb-1"><span class="text-xs align-top relative top-1">R</span>{{ getDisplayPrice() | number:'1.0-0' }}</div>
                  </div>

                  <div class="text-sm">
                      <div class="text-emerald-700 font-bold mb-1" *ngIf="product()!.stock > 0">In Stock</div>
                      <div class="text-red-700 font-bold mb-2 animate-pulse" *ngIf="product()!.stock > 0 && product()!.stock <= (product()!.lowStockThreshold || 10)">
                         Only {{ product()!.stock }} left in stock - order soon.
                      </div>
                      <div class="text-neutral-700 font-bold">Fastest delivery <span class="text-neutral-900">{{ deliveryEstimation()?.formattedDate || 'Tomorrow' }}</span></div>
                      <div class="mt-2 text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-100 flex items-center gap-1.5">
                         <span class="w-4 h-4 bg-amber-400 text-white rounded-full flex items-center justify-center text-[8px] font-bold">C</span>
                         <span>Earn <span class="font-bold">{{ rewardPoints() }}</span> points <span *ngIf="authService.isPlusMember()" class="text-primary font-black">(2x)</span></span>
                      </div>
                  </div>

                  <div class="space-y-3">
                    <!-- Bulk Savings Table -->
                    <div *ngIf="product()!.bulkPricing?.length" class="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                       <h5 class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Bulk Asset Discounts</h5>
                       <div class="space-y-1.5">
                          <div *ngFor="let tier of product()!.bulkPricing" class="flex justify-between text-xs">
                             <span class="text-neutral-600">Buy {{ tier.minQuantity }}+ units</span>
                             <span class="font-black text-emerald-600">Save {{ tier.discountPercentage }}%</span>
                          </div>
                       </div>
                    </div>

                    <select [ngModel]="selectedQuantity()" (ngModelChange)="selectedQuantity.set($event)" class="w-full bg-neutral-100 border border-neutral-300 rounded-md py-1.5 px-2 text-sm shadow-sm focus:ring-primary focus:border-primary cursor-pointer font-bold">
                        <option *ngFor="let q of [1,2,3,4,5,6,7,8,9,10]" [value]="q">Qty: {{ q }}</option>
                    </select>

                    <button (click)="addToCart()" class="w-full btn-primary rounded-full py-2.5 text-sm shadow-sm font-bold transition-transform active:scale-95">
                        Add to Cart
                    </button>
                    <button (click)="buyNow()" class="w-full bg-[#FA8900] hover:bg-[#E67A00] text-white border-transparent rounded-full py-2.5 text-sm shadow-sm cursor-pointer transition-colors font-bold active:scale-95">
                        Buy Now
                    </button>
                  </div>

                  <div class="text-[11px] text-neutral-500 pt-2 space-y-1">
                      <div class="flex justify-between border-b border-neutral-100 pb-1">
                          <span>Ships from</span> <span class="font-bold text-neutral-700">Chommie.za</span>
                      </div>
                      <div class="flex justify-between border-b border-neutral-100 pb-1 pt-1">
                          <span>Sold by</span> 
                          <div class="flex flex-col items-end">
                             <span class="text-primary hover:underline cursor-pointer font-bold text-right">Chommie Retail</span>
                             <span class="text-[8px] font-black text-emerald-600 uppercase tracking-tighter flex items-center gap-0.5">
                                <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                                Verified Global Seller
                             </span>
                          </div>
                      </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Customer Questions & Answers -->
          <section class="space-y-8 mt-16">
             <h2 class="text-2xl font-black text-neutral-charcoal tracking-tighter uppercase border-b border-neutral-100 pb-4">Customer Questions & Answers</h2>
             <div class="relative max-w-2xl group">
                <input type="text" [(ngModel)]="newQuestion" (keyup.enter)="submitQuestion()" placeholder="Have a question?" class="w-full pl-12 pr-4 py-3 bg-white border-2 border-neutral-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium shadow-sm">
             </div>
             <div class="space-y-6">
                <div *ngFor="let q of questions()" class="flex gap-4">
                   <span class="font-bold text-neutral-800 uppercase text-xs">Question:</span>
                   <p class="text-sm text-primary">{{ q.text }}</p>
                </div>
             </div>
          </section>

          <!-- Customer Reviews -->
          <section class="mt-16 pt-16 border-t border-neutral-100">
             <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <!-- Left: Review Stats -->
                <div class="lg:col-span-4">
                   <h2 class="text-xl font-bold mb-4">Customer Reviews</h2>
                   <div class="flex items-center gap-2 mb-1">
                      <div class="flex text-amber-500 text-lg">
                         <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product()!.ratings) ? '★' : '☆' }}</span>
                      </div>
                      <span class="font-bold text-lg">{{ product()!.ratings }} out of 5</span>
                   </div>
                   <div class="text-sm text-neutral-500 mb-6">{{ product()!.numReviews }} global ratings</div>
                   
                   <!-- Review Form (Simplified) -->
                   <div class="bg-neutral-50 p-6 rounded-xl border border-neutral-200" *ngIf="userId">
                      <h3 class="font-bold text-sm mb-4">Review this product</h3>
                      <p class="text-xs text-neutral-600 mb-4">Share your thoughts with other customers</p>
                      
                      <div class="space-y-3 mb-4">
                        <div class="flex gap-1 text-amber-500 cursor-pointer">
                           <span *ngFor="let s of [1,2,3,4,5]" (click)="newRating = s">{{ s <= newRating ? '★' : '☆' }}</span>
                        </div>
                        <textarea [(ngModel)]="newComment" placeholder="What did you like or dislike?" class="w-full p-3 border border-neutral-300 rounded-lg text-sm outline-none focus:border-primary h-24"></textarea>
                        <input type="text" [(ngModel)]="newImages" placeholder="Image URLs (comma separated)" class="w-full p-2 border border-neutral-300 rounded-lg text-xs outline-none focus:border-primary">
                      </div>

                      <button (click)="submitReview()" [disabled]="submitting()" class="w-full py-2 bg-white border border-neutral-300 rounded-full text-sm font-bold hover:bg-neutral-50 transition-colors shadow-sm">
                         {{ submitting() ? 'Submitting...' : 'Write a customer review' }}
                      </button>
                   </div>
                </div>

                <!-- Right: Review List -->
                <div class="lg:col-span-8 space-y-8">
                   <div *ngFor="let review of reviews()" class="space-y-2 border-b border-neutral-100 pb-8 last:border-0">
                      <div class="flex items-center gap-3">
                         <div class="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold text-xs uppercase">
                            {{ review.userName?.charAt(0) }}
                         </div>
                         <span class="text-sm font-medium">{{ review.userName }}</span>
                      </div>
                      
                      <div class="flex items-center gap-2">
                         <div class="flex text-amber-500 text-xs">
                            <span *ngFor="let s of [1,2,3,4,5]">{{ s <= review.rating ? '★' : '☆' }}</span>
                         </div>
                         <span class="font-bold text-sm">{{ review.title || 'Verified Purchase' }}</span>
                      </div>

                      <div class="flex items-center gap-2" *ngIf="review.verified">
                         <span class="text-[10px] font-black uppercase tracking-widest text-[#C45500]">Verified Purchase</span>
                      </div>

                      <p class="text-sm text-neutral-800 leading-relaxed">{{ review.comment }}</p>

                      <!-- Review Images -->
                      <div class="flex gap-2 mt-3" *ngIf="review.images?.length">
                         <img *ngFor="let img of review.images" [src]="img" class="w-20 h-20 object-cover rounded border border-neutral-200 cursor-pointer hover:opacity-80 transition-opacity">
                      </div>

                      <div class="flex items-center gap-4 mt-4 text-xs text-neutral-500">
                         <button (click)="onHelpfulClick(review._id)" class="px-4 py-1 border border-neutral-300 rounded shadow-sm hover:bg-neutral-50 transition-colors font-medium">
                            Helpful ({{ review.helpfulVotes || 0 }})
                         </button>
                         <span class="hover:underline cursor-pointer">Report</span>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          <!-- Membership Promo -->
          <div class="mt-16">
            <app-membership-promo></app-membership-promo>
          </div>
        </div>
      }
    </div>

    <!-- Lightbox -->
    <div *ngIf="showLightbox()" class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" (click)="showLightbox.set(false)">
        <img [src]="hoveredImage() || product()!.images[0]" class="max-h-[90vh] max-w-full object-contain">
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
  newQuestion = '';
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
  deliveryEstimation = signal<any | null>(null);
  
  rewardPoints = computed(() => {
    const price = this.getDisplayPrice();
    const multiplier = this.authService.isPlusMember() ? 2 : 1;
    return Math.floor(price * multiplier);
  });
  
  // UI States
  showLightbox = signal(false);
  hoveredImage = signal<string | null>(null);

  bundleDiscount = 0.05;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public cartService: CartService,
    public authService: AuthService,
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
        this.loadDeliveryEstimation(id);
        this.addToHistory(id);
        if (this.userId) {
            this.loadTrustProfile(this.userId);
        }
      }
    });
    this.startTimer();
  }

  loadDeliveryEstimation(id: string) {
    // Try to get zip code from user addresses or prompt
    const zipCode = '2000'; // Default to Jozi for now or get from profile
    this.productService.getDeliveryEstimation(id, zipCode).subscribe(est => {
      this.deliveryEstimation.set(est);
    });
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

  selectVariant(name: string, value: string) {
    this.selectedVariants.update(v => ({ ...v, [name]: value }));
  }

  getDisplayPrice(): number {
    if (!this.product()) return 0;
    let price = (this.product()!.isLightningDeal ? this.product()!.discountPrice : this.product()!.price) || 0;
    const profile = this.trustProfile();
    if (profile && this.product()!.trustScoreDiscount > 0) {
        if (profile.currentScore >= 700 || profile.tier === 'GOLD' || profile.tier === 'PLATINUM') {
            price = price * (1 - this.product()!.trustScoreDiscount / 100);
        }
    }
    return price;
  }

  getDisplayImage(): string {
    if (!this.product()) return '';
    return this.hoveredImage() || this.product()!.images?.[0] || '';
  }

  addToHistory(id: string) {
    const history = JSON.parse(localStorage.getItem('recent_history') || '[]');
    const updated = [id, ...history.filter((i: string) => i !== id)].slice(0, 6);
    localStorage.setItem('recent_history', JSON.stringify(updated));
  }

  loadProduct(id: string) {
    this.productService.getProduct(id).subscribe(p => {
      this.product.set(p);
      if (p.variants) {
        const defaults: any = {};
        p.variants.forEach((v: any) => {
          if (v.options?.length) defaults[v.name] = v.options[0].value;
        });
        this.selectedVariants.set(defaults);
      }
    });
  }

  loadQuestions(id: string) {
    this.productService.getQuestions(id).subscribe(q => this.questions.set(q));
  }

  submitQuestion() {
    if (!this.userId || !this.newQuestion.trim()) return;
    const data = {
        productId: this.product().id || this.product()._id,
        userId: this.userId,
        userName: localStorage.getItem('user_name') || 'Chommie User',
        text: this.newQuestion
    };
    this.productService.askQuestion(data).subscribe({
        next: (res) => {
            this.questions.update(q => [res, ...q]);
            this.newQuestion = '';
        }
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

  showAddedToCart = signal(false);

  addToCart() {
    if (this.product()) {
      const productToCart = {
        ...this.product()!,
        price: this.getDisplayPrice(),
        selectedVariants: this.selectedVariants()
      };
      this.cartService.addToCart(productToCart, this.selectedQuantity());
      this.showAddedToCart.set(true);
      setTimeout(() => this.showAddedToCart.set(false), 3000);
    }
  }

  buyNow() {
    this.addToCart();
    this.router.navigate(['/checkout']);
  }

  addToWishlist() {
    if (!this.userId) {
        this.router.navigate(['/login']);
        return;
    }
    this.productService.addToWishlist(this.userId, this.product()!.id || this.product()!._id).subscribe();
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
    
    // Support comma-separated image URLs for now
    const imagesArray = this.newImages ? this.newImages.split(',').map(s => s.trim()) : [];
    
    const review = {
      productId: this.product()!.id || this.product()!._id,
      userId: this.userId,
      userName: localStorage.getItem('user_name') || 'Chommie User',
      rating: this.newRating,
      title: 'Customer Review',
      comment: this.newComment,
      images: imagesArray
    };
    this.productService.addReview(review).subscribe({
      next: (res) => {
        this.reviews.update(r => [res, ...r]);
        this.newComment = '';
        this.newImages = '';
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }
}