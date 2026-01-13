import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { BnplService } from '../../services/bnpl.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-[#EAEDED] min-h-screen pb-12">
      <div class="container mx-auto px-4 py-8 max-w-[1500px]">
        
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <!-- Left: Cart Items -->
          <div class="lg:col-span-3 bg-white p-6 rounded-sm shadow-sm border border-gray-200">
             <div class="flex justify-between items-end border-b pb-2 mb-4">
                 <h1 class="text-3xl font-normal text-[#111111]">Shopping Cart</h1>
                 <span class="text-sm text-gray-500">Price</span>
             </div>

             <div *ngIf="cartService.cartItems().length === 0" class="py-8">
                <p class="text-lg mb-4">Your Amazon Cart is empty.</p>
                <a routerLink="/products" class="text-amazon-link hover:text-action hover:underline">Shop today's deals</a>
             </div>

             <div class="space-y-6" *ngIf="cartService.cartItems().length > 0">
                 <div *ngFor="let item of cartService.cartItems()" class="flex gap-4 border-b pb-6 last:border-0">
                     <!-- Image -->
                     <div class="w-[180px] h-[180px] flex items-center justify-center bg-gray-50 cursor-pointer" [routerLink]="['/products', item.id]">
                         <img *ngIf="item.images && item.images.length" [src]="item.images[0]" [alt]="item.name" class="max-w-full max-h-full object-contain">
                     </div>

                     <!-- Details -->
                     <div class="flex-grow">
                         <div class="flex justify-between">
                             <h3 class="text-xl font-medium text-black hover:text-action hover:underline cursor-pointer" [routerLink]="['/products', item.id]">{{ item.name }}</h3>
                             <div class="text-xl font-bold text-[#111111]">R{{ item.price | number:'1.2-2' }}</div>
                         </div>
                         
                         <!-- Selected Variants -->
                         <div *ngIf="item.selectedVariants" class="text-xs text-gray-600 mb-1 flex flex-wrap gap-x-4">
                             <div *ngFor="let v of item.selectedVariants | keyvalue">
                                 <span class="font-bold">{{ v.key }}:</span> {{ v.value }}
                             </div>
                         </div>

                         <div class="text-sm text-green-700 mb-1">In Stock</div>
                         <div class="text-xs text-gray-500 mb-2">Sold by Chommie Retail</div>
                         
                         <div class="flex items-center gap-4 mt-2">
                             <div class="flex items-center border border-gray-300 rounded-[4px] shadow-sm bg-[#F0F2F2] hover:bg-[#E3E6E6]">
                                 <button (click)="decreaseQty(item)" class="px-3 py-1 text-sm font-medium border-r border-gray-300">-</button>
                                 <span class="px-4 py-1 text-sm bg-white">{{ item.quantity }}</span>
                                 <button (click)="increaseQty(item)" class="px-3 py-1 text-sm font-medium border-l border-gray-300">+</button>
                             </div>
                             <span class="text-gray-300">|</span>
                             <button (click)="removeItem(item)" class="text-sm text-amazon-link hover:underline hover:text-action">Delete</button>
                             <span class="text-gray-300">|</span>
                             <button (click)="saveForLater(item)" class="text-sm text-amazon-link hover:underline hover:text-action">Save for later</button>
                         </div>
                     </div>
                 </div>
             </div>

             <div class="text-right mt-4" *ngIf="cartService.cartItems().length > 0">
                 <span class="text-lg">Subtotal ({{ cartService.cartItems().length }} items): </span>
                 <span class="text-lg font-bold">R{{ cartService.totalAmount() | number:'1.2-2' }}</span>
             </div>
          </div>

          <!-- Saved for Later Section -->
          <div class="lg:col-span-3 bg-white p-6 rounded-sm shadow-sm border border-gray-200 mt-6" *ngIf="cartService.savedItems().length > 0">
             <div class="border-b pb-2 mb-4">
                 <h2 class="text-2xl font-normal text-[#111111]">Saved for later ({{ cartService.savedItems().length }} items)</h2>
             </div>

             <div class="space-y-6">
                 <div *ngFor="let item of cartService.savedItems()" class="flex gap-4 border-b pb-6 last:border-0">
                     <!-- Image -->
                     <div class="w-[120px] h-[120px] flex items-center justify-center bg-gray-50 cursor-pointer" [routerLink]="['/products', item.id]">
                         <img *ngIf="item.images && item.images.length" [src]="item.images[0]" [alt]="item.name" class="max-w-full max-h-full object-contain">
                     </div>

                     <!-- Details -->
                     <div class="flex-grow">
                         <div class="flex justify-between">
                             <h3 class="text-lg font-medium text-black hover:text-action hover:underline cursor-pointer" [routerLink]="['/products', item.id]">{{ item.name }}</h3>
                             <div class="text-lg font-bold text-[#B12704]">R{{ item.price | number:'1.2-2' }}</div>
                         </div>
                         
                         <!-- Selected Variants -->
                         <div *ngIf="item.selectedVariants" class="text-xs text-gray-600 mb-1 flex flex-wrap gap-x-4">
                             <div *ngFor="let v of item.selectedVariants | keyvalue">
                                 <span class="font-bold">{{ v.key }}:</span> {{ v.value }}
                             </div>
                         </div>

                         <div class="text-xs text-green-700 mb-1">In Stock</div>
                         
                         <div class="flex items-center gap-4 mt-2">
                             <button (click)="moveToCart(item)" class="bg-white border border-gray-300 rounded shadow-sm py-1 px-3 text-sm hover:bg-gray-50">Move to Cart</button>
                             <span class="text-gray-300">|</span>
                             <button (click)="cartService.removeFromSaved(item.id!, item.selectedVariants)" class="text-sm text-amazon-link hover:underline hover:text-action">Delete</button>
                         </div>
                     </div>
                 </div>
             </div>
          </div>

          <!-- Right: Summary Box -->
          <div class="lg:col-span-1" *ngIf="cartService.cartItems().length > 0">
              <div class="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
                  <!-- BNPL Indicator -->
                  <div class="mb-4 text-sm" *ngIf="userId">
                      <div class="flex items-center gap-1 mb-1" [ngClass]="eligible() ? 'text-green-700' : 'text-red-700'">
                          <svg *ngIf="eligible()" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                          <span class="font-bold">{{ eligible() ? 'BNPL Eligible' : 'Credit Limit Exceeded' }}</span>
                      </div>
                      <p class="text-xs text-gray-600">{{ eligibilityReason() }}</p>
                  </div>

                  <div class="text-lg mb-4">
                      Subtotal ({{ cartService.cartItems().length }} items): <span class="font-bold">R{{ cartService.totalAmount() | number:'1.2-2' }}</span>
                  </div>

                  <div class="text-xs text-gray-600 mb-4">
                      Shipping to <span class="font-bold">{{ currentLocation() }}</span>
                  </div>

                  <button 
                    (click)="proceedToCheckout()"
                    class="w-full bg-action hover:bg-action-hover text-white py-2 rounded-[20px] shadow-sm text-sm mb-4 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-action"
                  >
                    Proceed to checkout
                  </button>
              </div>
              
              <!-- Recommendations (Mock) -->
              <div class="mt-4 bg-white p-4 rounded-sm shadow-sm border border-gray-200 hidden lg:block">
                  <h4 class="font-bold text-sm mb-2">Sponsored Products</h4>
                  <div class="h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-400">Ad Space</div>
              </div>
          </div>

        </div>
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
    private router: Router
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
