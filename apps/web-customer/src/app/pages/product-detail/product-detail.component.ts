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
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-product-detail',  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-40 pt-16" *ngIf="product()">
      
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
                   <img *ngIf="product()!.images?.length" [src]="getDisplayImage()" [alt]="product()!.name" class="max-h-full max-w-full object-contain mix-blend-multiply cursor-zoom-in">
                </div>
             </div>
             <!-- Thumbnails -->
             <div class="flex gap-2 mt-4 justify-center" *ngIf="product()!.images?.length > 1">
                <div *ngFor="let img of product()!.images" class="w-10 h-10 border border-neutral-300 hover:border-primary rounded p-1 cursor-pointer">
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
               <div *ngIf="trustProfile() && product()!.trustScoreDiscount > 0" class="mt-3 p-2 rounded border flex items-center gap-3 transition-all"
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
                      class="px-3 py-1 text-xs border rounded-md transition-all"
                      [ngClass]="selectedVariants()[variant.name] === option.value ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-neutral-300 hover:bg-neutral-50'"
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
                   <!-- Mock Features -->
                   <li>High-performance engineered design.</li>
                   <li>Seamless integration with existing protocols.</li>
                   <li>Sustainable materials verified by Nexus.</li>
               </ul>
            </div>
          </div>

          <!-- Right: Buy Box (Sticky) -->
          <div class="lg:col-span-3">
             <div class="border border-neutral-300 rounded-lg p-4 bg-white shadow-sm lg:sticky lg:top-40">
                <div class="text-2xl font-medium text-neutral-charcoal mb-2"><span class="text-xs align-top relative top-1">R</span>{{ getDisplayPrice() | number:'1.0-0' }}</div>
                
                <div class="text-sm text-neutral-600 mb-4">
                    <span class="text-primary hover:underline cursor-pointer">FREE Returns</span>
                </div>

                <div class="text-sm text-neutral-600 mb-4">
                    <span class="text-emerald-700 font-bold">In Stock</span>
                </div>

                <!-- Core Offerings / Value Props -->
                <div class="grid grid-cols-3 gap-2 mb-6">
                    <div class="flex flex-col items-center text-center p-2 border border-neutral-200 rounded-md bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-help group relative">
                        <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span class="text-[10px] font-bold text-neutral-700 leading-tight">BNPL <br> No Credit Check</span>
                        <!-- Tooltip -->
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-neutral-800 text-white text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            Pay in 4 interest-free installments. No credit checks required. Approval based on Chommie Trust Score.
                        </div>
                    </div>
                    <div class="flex flex-col items-center text-center p-2 border border-neutral-200 rounded-md bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-help group relative">
                        <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <span class="text-[10px] font-bold text-neutral-700 leading-tight">Society <br> First</span>
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-neutral-800 text-white text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            Empowering local communities. A portion of this sale supports local development funds.
                        </div>
                    </div>
                    <div class="flex flex-col items-center text-center p-2 border border-neutral-200 rounded-md bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-help group relative">
                        <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <span class="text-[10px] font-bold text-neutral-700 leading-tight">One-Day <br> Delivery</span>
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-neutral-800 text-white text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            Guaranteed delivery by tomorrow 9PM if ordered within the next 4 hours.
                        </div>
                    </div>
                </div>

                <div class="mb-4 space-y-3">
                   <!-- Delivery Type Toggle -->
                   <div *ngIf="product()?.category === 'Home' || product()?.category === 'Beauty' || product()?.category === 'Grocery'" class="border border-neutral-300 rounded-md p-3 bg-neutral-50">
                       <div class="flex items-start gap-2 mb-2 cursor-pointer" (click)="purchaseType.set('onetime')">
                           <input type="radio" name="purchaseType" [checked]="purchaseType() === 'onetime'" class="mt-1 text-primary focus:ring-primary">
                           <div>
                               <div class="font-bold text-sm text-neutral-800">One-time purchase</div>
                               <div class="text-sm font-bold text-neutral-800">R{{ getDisplayPrice() | number:'1.0-0' }}</div>
                           </div>
                       </div>
                       
                       <div class="flex items-start gap-2 cursor-pointer" (click)="purchaseType.set('subscription')">
                           <input type="radio" name="purchaseType" [checked]="purchaseType() === 'subscription'" class="mt-1 text-primary focus:ring-primary">
                           <div>
                               <div class="font-bold text-sm text-neutral-800 flex items-center gap-1">
                                   Subscribe & Save
                                   <span class="text-xs font-normal text-emerald-700 bg-emerald-100 px-1 rounded">-5%</span>
                               </div>
                               <div class="text-sm font-bold text-neutral-800">R{{ (getDisplayPrice() * 0.95) | number:'1.0-0' }}</div>
                               <div class="text-xs text-neutral-600 mt-1" *ngIf="purchaseType() === 'subscription'">
                                   <select class="border border-neutral-300 rounded-sm py-1 px-1 text-xs bg-white mt-1">
                                       <option>Deliver every 1 month (Most common)</option>
                                       <option>Deliver every 2 months</option>
                                       <option>Deliver every 3 months</option>
                                       <option>Deliver every 6 months</option>
                                   </select>
                               </div>
                           </div>
                       </div>
                   </div>

                   <select [ngModel]="selectedQuantity()" (ngModelChange)="selectedQuantity.set($event)" class="w-full bg-neutral-100 border border-neutral-300 rounded-md py-1 px-2 text-sm shadow-sm focus:ring-primary focus:border-primary cursor-pointer">
                        <option *ngFor="let q of [1,2,3,4,5,6,7,8,9,10]" [value]="q">Qty: {{ q }}</option>
                    </select>
                </div>

                <div class="space-y-2">
                    <button (click)="addToCart()" class="w-full btn-primary rounded-full py-2 text-sm shadow-sm">
                        {{ ts.t('product.add_to_cart') }}
                    </button>
                    <button (click)="buyNow()" class="w-full bg-primary-light hover:bg-primary text-white border-transparent rounded-full py-2 text-sm shadow-sm cursor-pointer transition-colors">
                        {{ purchaseType() === 'subscription' ? 'Set Up Subscription' : ts.t('product.buy_now') }}
                    </button>
                    <div class="text-center mt-1">
                        <span class="text-xs text-neutral-500 flex items-center justify-center gap-1">
                            <svg class="w-3 h-3 text-neutral-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg>
                            Secure transaction
                        </span>
                    </div>
                </div>

                <div class="text-xs text-neutral-500 mt-4 space-y-1">
                    <div class="grid grid-cols-2">
                        <span>Ships from</span> <span>Chommie</span>
                    </div>
                    <div class="grid grid-cols-2">
                        <span>Sold by</span> <span class="text-primary hover:underline cursor-pointer">Chommie Retail</span>
                    </div>
                </div>

                <div class="h-px bg-neutral-200 my-4"></div>

                <button (click)="addToWishlist()" class="w-full text-left text-sm text-neutral-700 hover:text-primary border border-neutral-300 rounded-md px-3 py-1 shadow-sm bg-white">
                    Add to List
                </button>
             </div>
          </div>

        </div>

        <div class="h-px bg-neutral-200 my-8"></div>

        <!-- Extra Content -->
        <div class="space-y-12">
          
          <section *ngIf="frequentlyBought().length > 0">
            <h2 class="text-xl font-bold text-neutral-charcoal mb-4">Frequently bought together</h2>
            <div class="flex flex-col md:flex-row items-center gap-6 p-6 border border-neutral-200 rounded-lg bg-neutral-50/30">
               <div class="flex items-center gap-2">
                  <div class="w-32 h-32 border border-neutral-200 p-2 rounded bg-white shadow-sm">
                    <img [src]="product()!.images[0]" class="object-contain h-full w-full">
                  </div>
                  <span class="text-xl text-neutral-400 font-bold">+</span>
                  <ng-container *ngFor="let p of frequentlyBought(); let last = last">
                    <div class="w-32 h-32 border border-neutral-200 p-2 rounded bg-white cursor-pointer shadow-sm hover:ring-1 hover:ring-primary" [routerLink]="['/products', p.id || p._id]">
                      <img [src]="p.images[0]" class="object-contain h-full w-full">
                    </div>
                    <span *ngIf="!last" class="text-xl text-neutral-400 font-bold">+</span>
                  </ng-container>
               </div>
               
               <div class="md:ml-auto md:border-l md:pl-6 border-neutral-200 space-y-3 min-w-[240px]">
                  <div class="bg-emerald-50 border border-emerald-100 p-2 rounded-md mb-2">
                      <span class="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1.193.985A1.993 1.993 0 009 6zm4 0V5a1 1 0 10-1.193.985A1.993 1.993 0 0013 6z" clip-rule="evenodd" /><path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" /></svg>
                          Bundle Discount Applied: {{ bundleDiscount * 100 }}% OFF
                      </span>
                  </div>
                  <div>
                     <span class="block text-sm text-neutral-600">Total price:</span>
                     <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-bold text-red-700">R{{ getTotalPrice() | number:'1.0-0' }}</span>
                        <span class="text-sm text-neutral-500 line-through">R{{ getBundleOriginalPrice() | number:'1.0-0' }}</span>
                     </div>
                  </div>
                  <button (click)="addAllToCart()" class="btn-primary w-full py-2 rounded-md shadow-sm font-medium">
                     Add bundle to Cart
                  </button>
               </div>
            </div>
          </section>

          <section *ngIf="comparisonProducts().length > 1">
            <h2 class="text-xl font-bold text-neutral-charcoal mb-6">Compare with similar items</h2>
            <div class="overflow-x-auto rounded-lg border border-neutral-200">
               <table class="w-full text-left border-collapse bg-white">
                  <thead>
                     <tr class="bg-neutral-50">
                        <th class="p-4 border-b border-neutral-200 w-48 text-sm font-bold text-neutral-600 uppercase tracking-wider">Features</th>
                        <th *ngFor="let p of comparisonProducts()" class="p-4 border-b border-neutral-200 min-w-[200px]">
                           <div class="space-y-2">
                              <div class="h-32 flex items-center justify-center p-2">
                                 <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                              </div>
                              <div class="text-sm font-bold text-primary hover:underline cursor-pointer line-clamp-2" [routerLink]="['/products', p.id || p._id]">{{ p.name }}</div>
                           </div>
                        </th>
                     </tr>
                  </thead>
                  <tbody class="text-sm">
                     <tr>
                        <td class="p-4 border-b border-neutral-100 font-bold bg-neutral-50/30">Customer Rating</td>
                        <td *ngFor="let p of comparisonProducts()" class="p-4 border-b border-neutral-100">
                           <div class="flex items-center gap-1">
                              <span class="text-amber-500">★ {{ p.ratings }}</span>
                              <span class="text-neutral-400 text-xs">({{ p.numReviews }})</span>
                           </div>
                        </td>
                     </tr>
                     <tr>
                        <td class="p-4 border-b border-neutral-100 font-bold bg-neutral-50/30">Price</td>
                        <td *ngFor="let p of comparisonProducts()" class="p-4 border-b border-neutral-100">
                           <span class="text-lg font-bold text-neutral-800">R{{ p.price | number:'1.0-0' }}</span>
                        </td>
                     </tr>
                     <tr>
                        <td class="p-4 border-b border-neutral-100 font-bold bg-neutral-50/30">Category</td>
                        <td *ngFor="let p of comparisonProducts()" class="p-4 border-b border-neutral-100">
                           <span class="px-2 py-0.5 bg-neutral-100 rounded text-xs text-neutral-600 uppercase">{{ p.category }}</span>
                        </td>
                     </tr>
                     <tr>
                        <td class="p-4 border-b border-neutral-100 font-bold bg-neutral-50/30">BNPL Eligible</td>
                        <td *ngFor="let p of comparisonProducts()" class="p-4 border-b border-neutral-100">
                           <span *ngIf="p.bnplEligible" class="text-emerald-600 font-bold flex items-center gap-1">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                              Yes
                           </span>
                           <span *ngIf="!p.bnplEligible" class="text-neutral-400">No</span>
                        </td>
                     </tr>
                     <tr>
                        <td class="p-4 border-b border-neutral-100 font-bold bg-neutral-50/30">Shipping</td>
                        <td *ngFor="let p of comparisonProducts()" class="p-4 border-b border-neutral-100">
                           <span class="text-xs text-neutral-600">FREE Delivery by Tomorrow</span>
                        </td>
                     </tr>
                     <tr>
                        <td class="p-4 border-b border-neutral-100 bg-neutral-50/30"></td>
                        <td *ngFor="let p of comparisonProducts()" class="p-4 border-b border-neutral-100">
                           <button (click)="p._id === product()._id ? addToCart() : cartService.addToCart(p)" class="w-full btn-secondary text-xs py-1 rounded shadow-sm">
                              Add to Cart
                           </button>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
          </section>

          <section *ngIf="alsoViewedProducts().length > 0">
            <h2 class="text-xl font-bold text-neutral-charcoal mb-4">Customers who viewed this item also viewed</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div *ngFor="let p of alsoViewedProducts()" class="group cursor-pointer" [routerLink]="['/products', p.id || p._id]">
                <div class="aspect-square border border-neutral-200 rounded-md p-4 flex items-center justify-center bg-white group-hover:shadow-md transition-shadow relative">
                   <img [src]="p.images[0]" [alt]="p.name" class="max-h-full max-w-full object-contain">
                   <div *ngIf="p.isLightningDeal" class="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-bold px-1 rounded-sm">DEAL</div>
                </div>
                <div class="mt-2 space-y-1">
                   <a class="text-sm text-primary group-hover:text-red-700 group-hover:underline line-clamp-2 leading-tight h-10">{{ p.name }}</a>
                   <div class="flex items-center gap-1">
                      <div class="flex text-amber-500 text-[10px]">
                         <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(p.ratings) ? '★' : '☆' }}</span>
                      </div>
                      <span class="text-neutral-400 text-[10px]">({{ p.numReviews }})</span>
                   </div>
                   <div class="text-base font-bold text-neutral-800">R{{ p.price | number:'1.0-0' }}</div>
                </div>
              </div>
            </div>
          </section>

          <section *ngIf="relatedProducts().length > 0">
            <h2 class="text-xl font-bold text-neutral-charcoal mb-4">Products related to this item</h2>
            <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              <div *ngFor="let p of relatedProducts()" class="min-w-[160px] w-[160px] cursor-pointer group" [routerLink]="['/products', p.id || p._id]">
                <div class="h-40 border border-neutral-200 rounded-md p-2 flex items-center justify-center bg-white group-hover:shadow-md transition-shadow">
                   <img *ngIf="p.images?.length" [src]="p.images[0]" [alt]="p.name" class="max-h-full max-w-full object-contain">
                </div>
                <div class="mt-2 space-y-1">
                   <a class="text-sm text-primary group-hover:underline line-clamp-2 leading-snug h-10">{{ p.name }}</a>
                   <div class="text-xs text-amber-500 flex items-center gap-1">
                      <span>★★★★☆</span>
                      <span class="text-neutral-400 text-[10px]">(120)</span>
                   </div>
                   <div class="text-base font-bold text-neutral-800">R{{ p.price | number:'1.0-0' }}</div>
                </div>
              </div>
            </div>
          </section>

                  <div class="h-px bg-neutral-200 my-8"></div>
          
                  <!-- AI Insight Summary -->
                  <section *ngIf="productInsight()" class="bg-neutral-50 rounded-xl p-6 border border-neutral-200 shadow-inner">
                     <div class="flex items-center gap-3 mb-4">
                        <div class="bg-primary/10 p-2 rounded-lg">
                           <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div>
                           <h2 class="text-xl font-bold text-neutral-charcoal">Chommie AI Insight</h2>
                           <p class="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Generated from 1,200+ customer signals</p>
                        </div>
                        <div class="ml-auto flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-neutral-200 text-[10px] font-bold text-neutral-400">
                           <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                           LIVE ANALYSIS
                        </div>
                     </div>
          
                     <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2">
                           <p class="text-neutral-700 leading-relaxed italic text-lg mb-4">
                              "{{ productInsight().summary }}"
                           </p>
                           <div class="flex flex-wrap gap-2">
                              <span *ngFor="let p of productInsight().pros" class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium flex items-center gap-1">
                                 <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                 {{ p }}
                              </span>
                           </div>
                        </div>
                        <div class="bg-white p-4 rounded-lg border border-neutral-100 space-y-4">
                           <div class="flex justify-between items-end">
                              <span class="text-xs font-bold text-neutral-500">SENTIMENT</span>
                              <span class="text-sm font-black text-emerald-600 uppercase">{{ productInsight().sentiment }}</span>
                           </div>
                           <div class="h-2 bg-neutral-100 rounded-full overflow-hidden">
                              <div class="h-full bg-emerald-500" [style.width.%]="productInsight().sentiment === 'Highly Positive' ? 95 : 75"></div>
                           </div>
                           <div class="text-[10px] text-neutral-400 leading-tight">
                              This summary is generated by Chommie AI based on customer reviews and product specifications.
                           </div>
                        </div>
                     </div>
                  </section>
          
                  <!-- Customer Reviews & Ratings -->
                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">             <!-- Left: Rating Snapshot -->
             <div class="lg:col-span-4 space-y-6">
                <h2 class="text-xl font-bold text-neutral-charcoal">Customer Reviews</h2>
                <div class="flex items-center gap-2">
                   <div class="flex text-amber-500 text-lg">
                      <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product()!.ratings) ? '★' : '☆' }}</span>
                   </div>
                   <span class="text-lg font-medium">{{ product()!.ratings }} out of 5</span>
                </div>
                <div class="text-sm text-neutral-500">{{ product()!.numReviews }} global ratings</div>

                <!-- Histogram (Mock Visuals for now) -->
                <div class="space-y-2 mt-4">
                   <div *ngFor="let star of [5,4,3,2,1]" class="flex items-center gap-3 text-sm">
                      <span class="w-12 text-primary hover:underline cursor-pointer">{{ star }} star</span>
                      <div class="flex-grow h-4 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                         <div class="h-full bg-amber-400" [style.width.%]="star === 5 ? 70 : (star === 4 ? 20 : 5)"></div>
                      </div>
                      <span class="w-8 text-right text-neutral-500">{{ star === 5 ? '70%' : (star === 4 ? '20%' : '5%') }}</span>
                   </div>
                </div>

                <div class="pt-6 border-t border-neutral-200">
                   <h3 class="font-bold text-lg mb-2">Review this product</h3>
                   <p class="text-sm text-neutral-600 mb-4">Share your thoughts with other customers</p>
                   <button class="w-full btn-secondary py-1.5 rounded-md border border-neutral-300 shadow-sm hover:bg-neutral-50" (click)="newComment = ' '">Write a customer review</button>
                   
                   <!-- Write Review Form -->
                   <div *ngIf="newComment !== ''" class="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3 animate-fade-in">
                      <div>
                         <label class="block text-xs font-bold mb-1">Rating</label>
                         <select [(ngModel)]="newRating" class="w-full text-sm border-neutral-300 rounded p-1">
                            <option [value]="5">5 Stars</option>
                            <option [value]="4">4 Stars</option>
                            <option [value]="3">3 Stars</option>
                            <option [value]="2">2 Stars</option>
                            <option [value]="1">1 Star</option>
                         </select>
                      </div>
                      <div>
                         <label class="block text-xs font-bold mb-1">Comment</label>
                         <textarea [(ngModel)]="newComment" rows="3" class="w-full text-sm border-neutral-300 rounded p-2" placeholder="What did you like or dislike?"></textarea>
                      </div>
                      <div>
                         <label class="block text-xs font-bold mb-1">Image URLs (comma separated)</label>
                         <input [(ngModel)]="newImages" type="text" class="w-full text-sm border-neutral-300 rounded p-2" placeholder="http://...">
                      </div>
                      <div class="flex justify-end gap-2">
                         <button (click)="newComment = ''" class="text-xs text-neutral-500 hover:underline">Cancel</button>
                         <button (click)="submitReview()" [disabled]="submitting()" class="btn-primary text-xs px-4 py-1.5 rounded-md">
                            {{ submitting() ? 'Submitting...' : 'Submit' }}
                         </button>
                      </div>
                   </div>
                </div>
             </div>

             <!-- Right: Reviews List -->
             <div class="lg:col-span-8">
                <h3 class="font-bold text-lg mb-4">Top reviews from South Africa</h3>
                
                <div *ngIf="reviews().length === 0" class="text-neutral-500 text-sm">
                   No reviews yet. Be the first to review this product!
                </div>

                <div class="space-y-6">
                   <div *ngFor="let review of reviews()" class="border-b border-neutral-200 pb-6 last:border-0">
                      <div class="flex items-center gap-2 mb-2">
                         <div class="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
                            {{ review.userName?.charAt(0) || 'U' }}
                         </div>
                         <span class="text-xs font-bold text-neutral-800">{{ review.userName }}</span>
                      </div>
                      <div class="flex items-center gap-2 mb-2">
                         <div class="flex text-amber-500 text-sm">
                            <span *ngFor="let s of [1,2,3,4,5]">{{ s <= review.rating ? '★' : '☆' }}</span>
                         </div>
                         <span class="text-xs font-bold text-neutral-800">{{ review.title || 'Great Product' }}</span>
                      </div>
                      <div class="text-xs text-neutral-500 mb-2">Reviewed in South Africa on {{ review.createdAt | date:'d MMMM y' }}</div>
                      <div class="text-xs text-orange-700 font-bold mb-2" *ngIf="review.verifiedPurchase">Verified Purchase</div>
                      
                      <p class="text-sm text-neutral-800 leading-relaxed mb-3">{{ review.comment }}</p>

                      <div class="flex gap-2 mb-3" *ngIf="review.images?.length">
                         <img *ngFor="let img of review.images" [src]="img" class="w-20 h-20 object-cover border border-neutral-200 rounded cursor-pointer hover:opacity-90">
                      </div>

                      <div class="flex items-center gap-4 text-xs text-neutral-500">
                         <span *ngIf="review.helpfulVotes > 0">{{ review.helpfulVotes }} people found this helpful</span>
                         <button (click)="onHelpfulClick(review._id)" class="px-4 py-1 border border-neutral-300 rounded-md hover:bg-neutral-50 shadow-sm transition-colors text-neutral-700">
                            Helpful
                         </button>
                         <span class="hover:underline cursor-pointer">Report</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div class="h-px bg-neutral-200 my-8"></div>

          <!-- Customer Questions & Answers -->
          <div class="space-y-6">
             <h2 class="text-xl font-bold text-neutral-charcoal">Customer questions & answers</h2>
             
             <!-- Search Q&A -->
             <div class="relative max-w-2xl">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg class="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                </div>
                <input type="text" class="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" placeholder="Have a question? Search for answers">
             </div>

             <!-- Ask Question -->
             <div class="max-w-2xl mt-4">
                <p class="text-sm font-bold mb-2">Don't see what you're looking for?</p>
                <div class="flex gap-2">
                   <input [(ngModel)]="newQuestion" type="text" class="flex-grow border border-neutral-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Ask the community">
                   <button (click)="submitQuestion()" class="btn-primary px-4 py-2 rounded-md text-sm whitespace-nowrap">Ask Question</button>
                </div>
             </div>

             <!-- Questions List -->
             <div class="space-y-4 mt-6 max-w-4xl">
                <div *ngIf="questions().length === 0" class="text-neutral-500 text-sm">
                   No questions yet.
                </div>

                <div *ngFor="let q of questions()" class="space-y-2">
                   <div class="flex gap-2">
                      <span class="font-bold text-sm text-neutral-800 w-16">Question:</span>
                      <a class="text-sm text-neutral-800 font-medium hover:text-primary cursor-pointer">{{ q.text }}</a>
                   </div>
                   <div class="flex gap-2" *ngIf="q.answers?.length; else noAnswer">
                      <span class="font-bold text-sm text-neutral-800 w-16">Answer:</span>
                      <div class="space-y-2">
                         <div class="text-sm text-neutral-800">
                            {{ q.answers[0].text }}
                         </div>
                         <div class="text-xs text-neutral-500">
                            By {{ q.answers[0].userName }} on {{ q.answers[0].createdAt | date:'MMMM d, y' }}
                         </div>
                         <button *ngIf="q.answers.length > 1" class="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                            See more answers ({{ q.answers.length - 1 }})
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                         </button>
                      </div>
                   </div>
                   <ng-template #noAnswer>
                      <div class="flex gap-2">
                         <span class="font-bold text-sm text-neutral-800 w-16">Answer:</span>
                         <span class="text-sm text-neutral-500 italic">No answer yet.</span>
                      </div>
                   </ng-template>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  `
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
    private router: Router
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
                    quantity: this.selectedQuantity(),
                    price: this.getDisplayPrice(),
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