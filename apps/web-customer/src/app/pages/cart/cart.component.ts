import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { BnplService } from '../../services/bnpl.service';
import { OrderService } from '../../services/order.service';
import { TranslationService } from '../../services/translation.service';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32 pt-6">
      <div class="w-full animate-fade-in px-4">
        
        @if (deviceService.isMobile()) {
          <!-- MOBILE CART UI -->
          <div class="flex flex-col gap-4">
             <!-- Mobile Summary Header -->
             <div *ngIf="cartService.cartItems().length > 0" class="bg-white p-4 border border-neutral-300 rounded-lg shadow-sm space-y-3">
                <div class="text-xl font-medium">
                   Subtotal <span class="font-black text-2xl">R{{ cartService.totalAmount() | number:'1.0-0' }}</span>
                </div>
                <div class="text-xs text-emerald-700 flex items-center gap-1 font-bold">
                   <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                   FREE delivery eligible
                </div>
                <button (click)="proceedToCheckout()" class="w-full btn-primary py-3 rounded-xl font-black text-base shadow-md">
                   Proceed to checkout ({{ cartService.cartItems().length }} items)
                </button>
                <div class="flex items-center gap-2 pt-1">
                   <input type="checkbox" class="w-4 h-4 rounded border-neutral-300">
                   <span class="text-xs font-bold text-neutral-600 uppercase tracking-tighter">Send as a gift</span>
                </div>
             </div>

             <!-- Empty Cart Mobile -->
             <div *ngIf="cartService.cartItems().length === 0" class="bg-white p-10 text-center rounded-lg border border-neutral-200 space-y-4">
                <div class="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg class="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <h2 class="text-xl font-black">Your Cart is Empty</h2>
                <button routerLink="/products" class="btn-primary px-8 py-2 rounded-lg">Start Shopping</button>
             </div>

             <!-- Mobile Item List -->
             <div *ngIf="cartService.cartItems().length > 0" class="space-y-3">
                <div *ngFor="let item of cartService.cartItems()" class="bg-white p-4 border border-neutral-200 rounded-lg flex flex-col gap-4">
                   <div class="flex gap-4">
                      <div class="w-24 h-24 bg-neutral-50 rounded-lg flex items-center justify-center shrink-0 border border-neutral-100" [routerLink]="['/products', item.id]">
                         <img [src]="item.images[0]" class="max-w-full max-h-full object-contain">
                      </div>
                      <div class="flex-grow space-y-1">
                         <h3 class="text-sm font-bold text-neutral-800 line-clamp-2 leading-tight" [routerLink]="['/products', item.id]">{{ item.name }}</h3>
                         <div class="text-lg font-black text-neutral-900">R{{ item.price | number:'1.0-0' }}</div>
                         <div class="text-[10px] text-emerald-700 font-black uppercase tracking-widest">In Stock</div>
                         <div *ngIf="item.selectedVariants" class="text-[10px] text-neutral-500 font-bold flex flex-wrap gap-x-2">
                            <span *ngFor="let v of item.selectedVariants | keyvalue">{{ v.key }}: {{ v.value }}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div class="flex items-center justify-between pt-2 border-t border-neutral-50">
                      <!-- Mobile Qty -->
                      <div class="flex items-center border border-neutral-200 rounded-lg bg-neutral-50 h-9">
                         <button (click)="decreaseQty(item)" class="px-3 h-full font-bold text-lg">-</button>
                         <span class="w-8 text-center text-sm font-black">{{ item.quantity }}</span>
                         <button (click)="increaseQty(item)" class="px-3 h-full font-bold text-lg">+</button>
                      </div>
                      <div class="flex gap-4">
                         <button (click)="removeItem(item)" class="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">Delete</button>
                         <button (click)="saveForLater(item)" class="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">Save</button>
                      </div>
                   </div>
                </div>
             </div>

             <!-- Mobile Saved for Later -->
             <div *ngIf="cartService.savedItems().length > 0" class="mt-6">
                <h2 class="text-base font-black uppercase tracking-widest text-neutral-500 mb-4 px-1">Saved for Later</h2>
                <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                   <div *ngFor="let item of cartService.savedItems()" class="min-w-[160px] w-[160px] bg-white p-3 border border-neutral-200 rounded-xl flex flex-col gap-2 shadow-sm">
                      <div class="aspect-square bg-neutral-50 rounded-lg p-2 flex items-center justify-center mb-1" [routerLink]="['/products', item.id]">
                         <img [src]="item.images[0]" class="max-w-full max-h-full object-contain">
                      </div>
                      <div class="text-[11px] font-bold line-clamp-2 h-8 leading-tight">{{ item.name }}</div>
                      <div class="text-sm font-black text-primary">R{{ item.price | number:'1.0-0' }}</div>
                      <button (click)="moveToCart(item)" class="mt-auto btn-secondary text-[10px] py-1.5 rounded-lg w-full font-bold">Move to Cart</button>
                   </div>
                </div>
             </div>
          </div>
        } @else {
          <!-- ORIGINAL DESKTOP UI (UNTOUCHED) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- Left: Cart Items -->
            <div class="lg:col-span-9 space-y-6">
               
               <!-- Main Cart Items -->
               <div class="bg-white border border-neutral-300 p-6 shadow-sm">
                  <div class="flex justify-between items-end border-b border-neutral-200 pb-3 mb-4">
                     <h1 class="text-2xl font-normal text-neutral-charcoal">{{ ts.t('cart.title') }}</h1>
                     <span class="text-sm text-neutral-500 hidden md:block">Price</span>
                  </div>

                  <div *ngIf="cartService.cartItems().length === 0" class="py-10 space-y-4">
                     <p class="text-base text-neutral-700">Your Chommie Cart is empty.</p>
                     <a routerLink="/products" class="text-sm text-primary hover:underline">Shop today's deals</a>
                     <div class="flex gap-2 mt-4">
                         <a routerLink="/login" class="btn-primary text-sm py-1.5 px-4 rounded-md">{{ ts.t('nav.signin') }}</a>
                         <a routerLink="/register" class="btn-secondary text-sm py-1.5 px-4 rounded-md">Sign up now</a>
                     </div>
                  </div>

                  <div class="space-y-6" *ngIf="cartService.cartItems().length > 0">
                      <div *ngFor="let item of cartService.cartItems()" class="group flex flex-col md:flex-row gap-4 border-b border-neutral-200 pb-6 last:border-0 last:pb-0">
                          <!-- Checkbox (Mock) -->
                          <div class="hidden md:flex pt-2">
                             <input type="checkbox" checked class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer">
                          </div>

                          <!-- Image -->
                          <div class="w-full md:w-48 h-48 flex-shrink-0 flex items-center justify-center cursor-pointer" [routerLink]="['/products', item.id]">
                              <img *ngIf="item.images.length" [src]="item.images[0]" [alt]="item.name" class="max-w-full max-h-full object-contain mix-blend-multiply">
                          </div>

                          <!-- Details -->
                          <div class="flex-grow space-y-1">
                              <div class="flex justify-between items-start">
                                  <h3 class="text-lg font-medium text-primary hover:underline cursor-pointer leading-tight max-w-2xl" [routerLink]="['/products', item.id]">{{ item.name }}</h3>
                                  <div class="text-lg font-bold text-neutral-charcoal md:hidden">R{{ item.price | number:'1.0-0' }}</div>
                              </div>
                              
                              <div class="text-xs text-emerald-700 font-bold">{{ ts.t('product.in_stock') }}</div>
                              <div class="text-xs text-neutral-500">Eligible for FREE Shipping</div>
                              <div class="flex items-center gap-2 pt-1">
                                 <input type="checkbox" class="w-3 h-3 text-neutral-400">
                                 <span class="text-xs text-neutral-600">This is a gift <span class="text-primary hover:underline cursor-pointer">Learn more</span></span>
                              </div>

                              <div *ngIf="item.selectedVariants" class="text-xs text-neutral-600 pt-1">
                                  <span *ngFor="let v of item.selectedVariants | keyvalue" class="mr-3">
                                      <span class="font-bold">{{ v.key }}:</span> {{ v.value }}
                                  </span>
                              </div>

                              <div class="flex flex-wrap items-center gap-4 pt-2 text-xs">
                                  <!-- Qty Selector -->
                                  <div class="flex items-center border border-neutral-300 rounded-md bg-neutral-50 shadow-sm">
                                      <span class="px-2 py-1 text-neutral-600 border-r border-neutral-300">Qty:</span>
                                      <input [ngModel]="item.quantity" disabled class="w-8 bg-transparent text-center font-bold text-neutral-800 outline-none">
                                      <div class="flex flex-col border-l border-neutral-300">
                                          <button (click)="increaseQty(item)" class="px-1 hover:bg-neutral-200 text-[8px]">▲</button>
                                          <button (click)="decreaseQty(item)" class="px-1 hover:bg-neutral-200 text-[8px] border-t border-neutral-300">▼</button>
                                      </div>
                                  </div>
                                  
                                  <div class="h-4 w-px bg-neutral-300"></div>
                                  <button (click)="removeItem(item)" class="text-primary hover:underline">Delete</button>
                                  <div class="h-4 w-px bg-neutral-300"></div>
                                  <button (click)="saveForLater(item)" class="text-primary hover:underline">Save for later</button>
                                  <div class="h-4 w-px bg-neutral-300"></div>
                                  <button class="text-primary hover:underline">Compare with similar items</button>
                              </div>
                          </div>

                          <!-- Price (Desktop) -->
                          <div class="hidden md:block text-right font-bold text-lg text-neutral-charcoal">
                              R{{ item.price | number:'1.0-0' }}
                          </div>
                      </div>
                  </div>

                  <div class="flex justify-end pt-4 border-t border-neutral-200 mt-4" *ngIf="cartService.cartItems().length > 0">
                      <div class="text-lg">
                          {{ ts.t('cart.subtotal') }} ({{ cartService.cartItems().length }} items): <span class="font-bold">R{{ cartService.totalAmount() | number:'1.0-0' }}</span>
                      </div>
                  </div>
               </div>

               <!-- Saved for Later -->
               <div class="bg-white border border-neutral-300 p-6 shadow-sm mt-6" *ngIf="cartService.savedItems().length > 0">
                  <h2 class="text-xl font-bold text-neutral-charcoal mb-4">Saved for later ({{ cartService.savedItems().length }} items)</h2>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div *ngFor="let item of cartService.savedItems()" class="border border-neutral-200 p-4 rounded-sm flex flex-col">
                          <div class="h-32 flex items-center justify-center mb-2">
                               <img *ngIf="item.images.length" [src]="item.images[0]" [alt]="item.name" class="max-h-full max-w-full object-contain">
                          </div>
                          <a [routerLink]="['/products', item.id]" class="text-sm text-primary hover:underline line-clamp-2 mb-1">{{ item.name }}</a>
                          <div class="text-sm font-bold text-red-700 mb-1">R{{ item.price | number:'1.0-0' }}</div>
                          <div class="text-xs text-neutral-500 mb-3">{{ ts.t('product.in_stock') }}</div>
                          <button (click)="moveToCart(item)" class="btn-secondary text-xs w-full mb-2">Move to Cart</button>
                          <button (click)="cartService.removeFromSaved(item.id!, item.selectedVariants)" class="text-xs text-primary hover:underline text-center w-full">Delete</button>
                      </div>
                  </div>
               </div>
            </div>

            <!-- Right: Summary Box (Sticky) -->
            <div class="lg:col-span-3 lg:sticky lg:top-6" *ngIf="cartService.cartItems().length > 0">
                <div class="bg-white border border-neutral-300 p-4 shadow-sm space-y-4">
                    
                    <!-- Free Shipping Progress -->
                    <div class="text-xs text-emerald-700">
                        <span class="flex items-center gap-1 font-bold">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                            Your order qualifies for FREE Shipping.
                        </span>
                        <span class="text-neutral-500">Choose this option at checkout.</span>
                    </div>

                    <div class="text-lg">
                        {{ ts.t('cart.subtotal') }} ({{ cartService.cartItems().length }} items): <span class="font-bold">R{{ cartService.totalAmount() | number:'1.0-0' }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <input type="checkbox" class="w-4 h-4 rounded border-neutral-300">
                        <span class="text-sm text-neutral-700">This order contains a gift</span>
                    </div>

                    <button 
                      (click)="proceedToCheckout()"
                      class="w-full btn-primary py-2 rounded-md shadow-sm text-sm"
                    >
                      {{ ts.t('cart.proceed') }}
                    </button>

                    <!-- BNPL Section -->
                    <div class="border border-neutral-200 rounded p-3 bg-neutral-50 text-xs space-y-2 mt-4" *ngIf="userId">
                        <div class="font-bold text-neutral-700">Payment Options</div>
                        <div class="flex items-center justify-between">
                            <span>BNPL Eligibility:</span>
                            <span class="font-bold" [class.text-emerald-600]="eligible()" [class.text-red-600]="!eligible()">{{ eligible() ? 'Approved' : 'Pending' }}</span>
                        </div>
                        <p class="text-neutral-500">{{ eligibilityReason() }}</p>
                    </div>
                </div>

                <!-- Recommendation Below Checkout -->
                <div class="bg-white border border-neutral-300 p-4 shadow-sm mt-4">
                    <h3 class="font-bold text-sm text-neutral-charcoal mb-3">Sponsored Products</h3>
                    <div class="space-y-3">
                        <div class="flex gap-2">
                            <div class="w-16 h-16 bg-neutral-100 flex items-center justify-center border border-neutral-200">
                               <span class="text-[8px] text-neutral-400">Ad</span>
                            </div>
                            <div>
                                <a href="#" class="text-xs text-primary hover:underline line-clamp-2">High Performance Wireless Headphones</a>
                                <div class="text-xs font-bold text-red-700">R1,299</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        }
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  eligible = signal(false);
  eligibilityReason = signal('Checking eligibility...');
  currentLocation = signal(localStorage.getItem('delivery_location') || 'South Africa');
  userId = '';

  constructor(
    public cartService: CartService,
    private bnplService: BnplService,
    public ts: TranslationService,
    private router: Router,
    public deviceService: DeviceService
  ) {
    this.userId = localStorage.getItem('user_id') || '';
    effect(() => {
      const total = this.cartService.totalAmount();
      if (total > 0 && this.userId) {
        this.checkEligibility(total);
      } else {
        this.eligible.set(true); // Default to true if not logged in or empty, handled at checkout
        this.eligibilityReason.set('');
      }
    });
  }

  ngOnInit() {}

  checkEligibility(amount: number) {
    this.bnplService.checkEligibility(this.userId, amount).subscribe({
      next: (result) => {
        this.eligible.set(result.eligible);
        if (result.eligible) {
          this.eligibilityReason.set(`Credit Available: R${result.limit}`);
        } else {
          this.eligibilityReason.set(result.reason || 'Limit exceeded');
        }
      },
      error: () => {
        this.eligible.set(false);
        this.eligibilityReason.set('Eligibility check failed');
      }
    });
  }

  proceedToCheckout() {
    this.router.navigate(['/checkout']);
  }

  increaseQty(item: any) {
    this.cartService.updateQuantity(item.id!, item.quantity + 1, item.selectedVariants);
  }

  decreaseQty(item: any) {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id!, item.quantity - 1, item.selectedVariants);
    }
  }

  removeItem(item: any) {
    this.cartService.removeFromCart(item.id!, item.selectedVariants);
  }

  saveForLater(item: any) {
    this.cartService.saveForLater(item.id!, item.selectedVariants);
  }

  moveToCart(item: any) {
    this.cartService.moveToCart(item.id!, item.selectedVariants);
  }
}
