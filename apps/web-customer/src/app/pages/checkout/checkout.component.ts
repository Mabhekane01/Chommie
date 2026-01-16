import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { BnplService } from '../../services/bnpl.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32" [ngClass]="deviceService.isMobile() ? 'pt-2' : 'pt-6'">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE CHECKOUT UI -->
        <div class="w-full flex flex-col">
           <!-- Simple Mobile Header -->
           <div class="flex items-center justify-between p-4 border-b border-neutral-100 mb-2">
              <a routerLink="/" class="font-header font-black text-xl">Chommie<span class="text-primary">.za</span></a>
              <h1 class="text-base font-bold text-neutral-500 uppercase tracking-widest">Checkout</h1>
              <div class="w-10"></div> <!-- Spacer -->
           </div>

           <div class="px-4 space-y-6">
              <!-- Mobile Step 1: Shipping -->
              <div class="space-y-3">
                 <h2 class="text-lg font-black flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
                    Shipping Address
                 </h2>
                 
                 <div *ngIf="savedAddresses().length > 0 && !showNewAddressForm()" class="space-y-3">
                    <div *ngFor="let addr of savedAddresses()" 
                         (click)="selectAddress(addr.id)"
                         class="p-4 border-2 rounded-xl transition-all"
                         [ngClass]="selectedAddressId() === addr.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-neutral-100 bg-neutral-50'">
                       <div class="flex justify-between items-start">
                          <div class="text-sm font-bold">{{ addr.fullName }}</div>
                          <div *ngIf="selectedAddressId() === addr.id" class="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                             <svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                       </div>
                       <div class="text-xs text-neutral-500 mt-1 leading-relaxed">
                          {{ addr.street }}, {{ addr.city }}<br>{{ addr.state }} {{ addr.zip }}
                       </div>
                    </div>
                    <button (click)="showNewAddressForm.set(true)" class="w-full py-3 border-2 border-dashed border-neutral-200 rounded-xl text-xs font-bold text-neutral-400 uppercase tracking-widest">+ Add New Address</button>
                 </div>

                 <div *ngIf="showNewAddressForm() || savedAddresses().length === 0" class="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-4">
                    <input type="text" [(ngModel)]="newAddress.fullName" placeholder="Full Name" class="w-full bg-white border-0 rounded-lg px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary">
                    <input type="text" [(ngModel)]="newAddress.street" placeholder="Street Address" class="w-full bg-white border-0 rounded-lg px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary">
                    <div class="grid grid-cols-2 gap-3">
                       <input type="text" [(ngModel)]="newAddress.city" placeholder="City" class="w-full bg-white border-0 rounded-lg px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary">
                       <input type="text" [(ngModel)]="newAddress.zip" placeholder="Zip" class="w-full bg-white border-0 rounded-lg px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <button (click)="addNewAddress()" class="w-full btn-primary py-3 rounded-xl font-bold">Use this address</button>
                 </div>

                 <!-- Delivery Instructions -->
                 <div class="pt-2">
                    <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Delivery Instructions (Safe Place)</label>
                    <textarea [(ngModel)]="deliveryNotes" placeholder="e.g. Leave with security at gate" class="w-full bg-neutral-50 border-2 border-neutral-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary h-20"></textarea>
                 </div>
              </div>

              <!-- Points Redemption Mobile -->
              <div class="space-y-3 pt-4 border-t border-neutral-100" *ngIf="coinsBalance() > 0">
                 <h2 class="text-lg font-black flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs">C</span>
                    Chommie Points
                 </h2>
                 <div class="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div class="flex justify-between items-center mb-2">
                       <span class="text-xs text-amber-900">You have <span class="font-bold">{{ coinsBalance() }}</span> points available.</span>
                       <button *ngIf="appliedCoins() === 0" (click)="applyCoins()" class="text-xs font-bold text-amber-600 hover:underline">REDEEM</button>
                       <button *ngIf="appliedCoins() > 0" (click)="removeCoins()" class="text-xs font-bold text-red-600 hover:underline">REMOVE</button>
                    </div>
                    <p class="text-[10px] text-amber-700/70 leading-tight">Redeem points for an instant discount. 100 points = R1.00</p>
                    <div *ngIf="appliedCoins() > 0" class="mt-2 text-xs font-bold text-amber-600 flex items-center gap-1">
                       <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                       -R{{ coinDiscount() | number:'1.0-0' }} applied
                    </div>
                 </div>
              </div>

              <!-- Mobile Step 2: Payment -->
              <div class="space-y-3 pt-4 border-t border-neutral-100">
                 <h2 class="text-lg font-black flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span>
                    Payment Method
                 </h2>

                 <div class="grid grid-cols-1 gap-3">
                    <div (click)="selectPayment('BNPL')" class="p-4 border-2 rounded-xl transition-all flex flex-col gap-2"
                         [ngClass]="selectedPaymentMethod() === 'BNPL' ? 'border-primary bg-primary/5 shadow-sm' : 'border-neutral-100 bg-neutral-50'">
                       <div class="flex justify-between items-center">
                          <span class="text-sm font-bold">Chommie BNPL</span>
                          <span class="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">FLEXIBLE</span>
                       </div>
                       <p class="text-[10px] text-neutral-500">Pay in 2 interest-free installments of R{{ (cartService.totalAmount() / 2) | number:'1.0-0' }}</p>
                    </div>

                    <div (click)="selectPayment('CARD')" class="p-4 border-2 rounded-xl transition-all flex flex-col gap-2"
                         [ngClass]="selectedPaymentMethod() === 'CARD' ? 'border-primary bg-primary/5 shadow-sm' : 'border-neutral-100 bg-neutral-50'">
                       <div class="flex justify-between items-center">
                          <span class="text-sm font-bold">Debit / Credit Card</span>
                          <div class="flex gap-1">
                             <div class="w-6 h-4 bg-neutral-200 rounded-sm"></div>
                             <div class="w-6 h-4 bg-neutral-200 rounded-sm"></div>
                          </div>
                       </div>
                    </div>

                    <div (click)="selectPayment('PAYFAST')" class="p-4 border-2 rounded-xl transition-all flex flex-col gap-2"
                         [ngClass]="selectedPaymentMethod() === 'PAYFAST' ? 'border-primary bg-primary/5 shadow-sm' : 'border-neutral-100 bg-neutral-50'">
                       <div class="flex justify-between items-center">
                          <span class="text-sm font-bold text-red-600">PayFast (Instant EFT/Card)</span>
                          <span class="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full uppercase">FAST</span>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Mobile Step 3: Review -->
              <div class="space-y-3 pt-4 border-t border-neutral-100 pb-10">
                 <h2 class="text-lg font-black flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">3</span>
                    Review Items
                 </h2>
                 <div class="flex gap-2 overflow-x-auto scrollbar-hide py-2">
                    <div *ngFor="let item of cartService.cartItems()" class="shrink-0 w-20 h-20 bg-neutral-50 border border-neutral-100 rounded-lg p-1 flex items-center justify-center relative">
                       <img [src]="item.images[0]" class="max-w-full max-h-full object-contain">
                       <span class="absolute -top-1 -right-1 bg-neutral-800 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">{{ item.quantity }}</span>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Sticky Mobile Order Bar -->
           <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 z-[60] flex flex-col gap-3 shadow-[0_-4px_30px_rgba(0,0,0,0.1)]">
              <div class="flex justify-between items-end px-1">
                 <div class="flex flex-col">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total to Pay</span>
                    <span class="text-2xl font-black text-red-700">R{{ (cartService.totalAmount() - discountAmount() - coinDiscount()) | number:'1.0-0' }}</span>
                 </div>
                 <div class="text-right">
                    <span class="text-[10px] font-bold text-emerald-600 block">Free Shipping Applied</span>
                    <span class="text-[10px] text-neutral-400">VAT Included</span>
                 </div>
              </div>
              <button 
                (click)="placeOrder()"
                [disabled]="processing() || (selectedPaymentMethod() === 'BNPL' && !bnplEligible())"
                class="w-full btn-primary py-4 rounded-2xl font-black text-lg shadow-xl transition-transform active:scale-95 disabled:opacity-50"
              >
                {{ processing() ? 'Placing Order...' : 'Place Your Order' }}
              </button>
           </div>
        </div>
      } @else {
        <!-- ORIGINAL DESKTOP UI (UNTOUCHED) -->
        <!-- Minimal Header -->
        <div class="border-b border-neutral-200 pb-4 mb-8">
            <div class="w-full px-6 flex justify-between items-center">
                <a routerLink="/" class="text-2xl font-header font-bold text-neutral-charcoal">Chommie<span class="text-primary">.za</span></a>
                <h1 class="text-2xl font-normal text-neutral-600">Checkout</h1>
                <div class="text-sm text-neutral-500">
                    <svg class="w-4 h-4 inline-block mr-1 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg>
                    Secure Protocol
                </div>
            </div>
        </div>

        <div class="w-full px-6 animate-fade-in">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Left: Steps -->
            <div class="lg:col-span-8 space-y-6">
              
              <!-- Step 1: Address -->
              <div class="bg-white border border-neutral-300 rounded-md p-0 overflow-hidden">
                  <div class="flex items-center justify-between p-4 bg-neutral-50 border-b border-neutral-200">
                      <h2 class="text-lg font-bold text-neutral-800 flex items-center gap-4">
                          <span class="text-neutral-800">1</span>
                          {{ ts.t('account.addresses') }}
                      </h2>
                      <button *ngIf="savedAddresses().length > 0 && !showNewAddressForm()" (click)="showNewAddressForm.set(true)" class="text-sm text-primary hover:underline">Add a new address</button>
                  </div>
                  
                  <div class="p-6">
                      <div *ngIf="savedAddresses().length > 0 && !showNewAddressForm()" class="space-y-3">
                          <div *ngFor="let addr of savedAddresses()" 
                               (click)="selectAddress(addr.id)"
                               class="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-neutral-50"
                               [ngClass]="selectedAddressId() === addr.id ? 'border-primary bg-primary/5' : 'border-neutral-200'">
                              <input type="radio" [checked]="selectedAddressId() === addr.id" class="mt-1 text-primary focus:ring-primary cursor-pointer">
                              <div class="text-sm">
                                  <span class="font-bold block">{{ addr.fullName }}</span>
                                  <span class="block text-neutral-600">{{ addr.street }}</span>
                                  <span class="block text-neutral-600">{{ addr.city }}, {{ addr.state }} {{ addr.zip }}</span>
                                  <span class="block text-neutral-600 mt-1">Phone: {{ addr.phone }}</span>
                              </div>
                          </div>
                      </div>

                      <div *ngIf="showNewAddressForm() || savedAddresses().length === 0" class="max-w-md">
                          <h3 class="font-bold text-sm mb-4">Add a new address</h3>
                          <div class="space-y-4">
                              <div class="space-y-1">
                                  <label class="text-sm font-bold">Full name</label>
                                  <input type="text" [(ngModel)]="newAddress.fullName" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none">
                              </div>
                              <div class="space-y-1">
                                  <label class="text-sm font-bold">Address</label>
                                  <input type="text" [(ngModel)]="newAddress.street" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" placeholder="Street address">
                              </div>
                              <div class="grid grid-cols-2 gap-4">
                                  <div class="space-y-1">
                                      <label class="text-sm font-bold">City</label>
                                      <input type="text" [(ngModel)]="newAddress.city" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none">
                                  </div>
                                  <div class="space-y-1">
                                      <label class="text-sm font-bold">State/Province</label>
                                      <input type="text" [(ngModel)]="newAddress.state" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none">
                                  </div>
                              </div>
                              <div class="grid grid-cols-2 gap-4">
                                  <div class="space-y-1">
                                      <label class="text-sm font-bold">Zip Code</label>
                                      <input type="text" [(ngModel)]="newAddress.zip" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none">
                                  </div>
                                  <div class="space-y-1">
                                      <label class="text-sm font-bold">Phone number</label>
                                      <input type="text" [(ngModel)]="newAddress.phone" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none">
                                  </div>
                              </div>
                              <div class="flex gap-3 pt-2">
                                  <button (click)="addNewAddress()" class="btn-primary text-sm py-1.5 px-4 rounded-md">Use this address</button>
                                  <button *ngIf="savedAddresses().length > 0" (click)="showNewAddressForm.set(false)" class="btn-secondary text-sm py-1.5 px-4 rounded-md">Cancel</button>
                              </div>
                          </div>
                      </div>

                      <!-- Delivery Instructions Desktop -->
                      <div class="mt-6 pt-4 border-t border-neutral-100">
                          <label class="text-sm font-bold block mb-2">Delivery Instructions (Safe Place)</label>
                          <textarea [(ngModel)]="deliveryNotes" placeholder="e.g. Leave with security at gate" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-primary focus:border-primary h-16"></textarea>
                      </div>
                  </div>
              </div>

              <!-- Step 2: Payment -->
              <div class="bg-white border border-neutral-300 rounded-md p-0 overflow-hidden">
                  <div class="flex items-center justify-between p-4 bg-neutral-50 border-b border-neutral-200">
                      <h2 class="text-lg font-bold text-neutral-800 flex items-center gap-4">
                          <span class="text-neutral-800">2</span>
                          Payment method
                      </h2>
                  </div>
                  
                  <div class="p-6 space-y-4">
                      <!-- Loyalty Points Redemption Desktop -->
                      <div *ngIf="coinsBalance() > 0" class="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                          <div class="flex justify-between items-center">
                              <div class="flex items-center gap-2">
                                  <span class="w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">C</span>
                                  <span class="text-sm font-bold text-amber-900">Redeem Chommie Points</span>
                              </div>
                              <button *ngIf="appliedCoins() === 0" (click)="applyCoins()" class="text-xs font-bold text-amber-600 hover:underline px-3 py-1 border border-amber-200 rounded bg-white">Apply {{ coinsBalance() }} points</button>
                              <button *ngIf="appliedCoins() > 0" (click)="removeCoins()" class="text-xs font-bold text-red-600 hover:underline px-3 py-1 border border-red-200 rounded bg-white">Remove points</button>
                          </div>
                          <div class="text-xs text-amber-700 mt-2 ml-8">
                             You have R{{ (coinsBalance() / 100) | number:'1.2-2' }} worth of points available.
                             <span *ngIf="appliedCoins() > 0" class="font-bold block mt-1">-R{{ coinDiscount() | number:'1.0-0' }} discount applied to your order total.</span>
                          </div>
                      </div>

                      <!-- BNPL -->
                      <div (click)="selectPayment('BNPL')" class="border rounded-md p-4 cursor-pointer hover:bg-neutral-50 flex items-start gap-3" [class.border-primary]="selectedPaymentMethod() === 'BNPL'" [class.bg-primary-light]="selectedPaymentMethod() === 'BNPL'">
                          <input type="radio" name="payment" [checked]="selectedPaymentMethod() === 'BNPL'" class="mt-1 text-primary focus:ring-primary">
                          <div>
                              <div class="font-bold text-sm text-neutral-800">Chommie BNPL (Pay in 2)</div>
                              <div class="text-xs text-neutral-600 mt-1">2 interest-free payments of R{{ (cartService.totalAmount() / 2) | number:'1.0-0' }}</div>
                              <div *ngIf="!bnplEligible() && selectedPaymentMethod() === 'BNPL'" class="text-xs text-red-600 font-bold mt-1">
                                  Not eligible: {{ bnplReason() }}
                              </div>
                          </div>
                          <span class="ml-auto bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-1 rounded border border-neutral-200">RECOMMENDED</span>
                      </div>

                      <!-- Card -->
                      <div (click)="selectPayment('CARD')" class="border rounded-md p-4 cursor-pointer hover:bg-neutral-50 flex items-start gap-3" [class.border-primary]="selectedPaymentMethod() === 'CARD'" [class.bg-primary-light]="selectedPaymentMethod() === 'CARD'">
                          <input type="radio" name="payment" [checked]="selectedPaymentMethod() === 'CARD'" class="mt-1 text-primary focus:ring-primary">
                          <div>
                              <div class="font-bold text-sm text-neutral-800">Credit or Debit Card</div>
                              <div class="flex gap-2 mt-2">
                                  <div class="w-8 h-5 bg-neutral-200 rounded"></div>
                                  <div class="w-8 h-5 bg-neutral-200 rounded"></div>
                              </div>
                          </div>
                      </div>

                      <!-- PayFast -->
                      <div (click)="selectPayment('PAYFAST')" class="border rounded-md p-4 cursor-pointer hover:bg-neutral-50 flex items-start gap-3" [class.border-primary]="selectedPaymentMethod() === 'PAYFAST'" [class.bg-primary-light]="selectedPaymentMethod() === 'PAYFAST'">
                          <input type="radio" name="payment" [checked]="selectedPaymentMethod() === 'PAYFAST'" class="mt-1 text-primary focus:ring-primary">
                          <div>
                              <div class="font-bold text-sm text-red-600">PayFast (Instant EFT & Credit Card)</div>
                              <div class="text-xs text-neutral-600 mt-1 font-medium">Safe & Secure payments for South Africa.</div>
                          </div>
                      </div>
                      
                      <!-- Coupon Input -->
                      <div class="mt-6 pt-4 border-t border-neutral-200">
                          <label class="text-sm font-bold block mb-2">Gift Cards & Promotional Codes</label>
                          <div class="flex gap-2">
                              <input type="text" [(ngModel)]="couponCode" placeholder="Enter Code" class="flex-grow border border-neutral-300 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-primary focus:border-primary uppercase">
                              <button (click)="applyCoupon()" class="btn-secondary text-sm py-1.5 px-4 rounded-md">Apply</button>
                          </div>
                          <div *ngIf="appliedCoupon()" class="text-xs text-emerald-700 font-bold mt-2 flex items-center gap-1">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                              Code applied successfully
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Step 3: Review -->
              <div class="bg-white border border-neutral-300 rounded-md p-0 overflow-hidden">
                  <div class="flex items-center justify-between p-4 bg-neutral-50 border-b border-neutral-200">
                      <h2 class="text-lg font-bold text-neutral-800 flex items-center gap-4">
                          <span class="text-neutral-800">3</span>
                          Review items and shipping
                      </h2>
                  </div>
                  <div class="p-6">
                      <div *ngFor="let item of cartService.cartItems()" class="flex gap-4 mb-4 border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                          <div class="w-16 h-16 border border-neutral-200 rounded p-1 flex-shrink-0">
                              <img [src]="item.images[0]" class="w-full h-full object-contain">
                          </div>
                          <div class="flex-grow">
                              <div class="font-bold text-sm text-neutral-800">{{ item.name }}</div>
                              <div class="text-xs text-neutral-600">Qty: {{ item.quantity }}</div>
                              <div class="text-xs font-bold text-red-700">R{{ item.price | number:'1.0-0' }}</div>
                          </div>
                      </div>
                  </div>
              </div>

            </div>

            <!-- Right: Summary Box -->
            <div class="lg:col-span-4 lg:sticky lg:top-6">
                <div class="bg-white border border-neutral-300 rounded-md p-4 shadow-sm space-y-4">
                    <button 
                      (click)="placeOrder()"
                      [disabled]="processing() || (selectedPaymentMethod() === 'BNPL' && !bnplEligible())"
                      class="w-full btn-primary py-2 rounded-md text-sm shadow-sm"
                    >
                      {{ processing() ? 'Processing...' : 'Place your order' }}
                    </button>
                    
                    <p class="text-xs text-neutral-500 text-center">
                        By placing your order, you agree to Chommie's <a href="#" class="text-primary hover:underline">privacy notice</a> and <a href="#" class="text-primary hover:underline">conditions of use</a>.
                    </p>

                    <div class="border-t border-neutral-200 pt-4 space-y-2 text-sm text-neutral-700">
                        <div class="flex justify-between">
                            <span>Items:</span>
                            <span>R{{ cartService.totalAmount() | number:'1.0-0' }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Shipping & handling:</span>
                            <span>R0.00</span>
                        </div>
                        <div class="flex justify-between" *ngIf="discountAmount() > 0">
                            <span>Promotion:</span>
                            <span class="text-red-700">-R{{ discountAmount() | number:'1.0-0' }}</span>
                        </div>
                        <div class="flex justify-between text-neutral-500 text-xs">
                            <span>Estimated VAT (15%):</span>
                            <span>R{{ vatAmount() | number:'1.2-2' }}</span>
                        </div>
                        <div class="flex justify-between font-bold text-lg text-red-700 border-t border-neutral-200 pt-2 mt-2">
                            <span>Order Total:</span>
                            <span>R{{ (cartService.totalAmount() - discountAmount() - coinDiscount()) | number:'1.0-0' }}</span>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      }
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  savedAddresses = signal<any[]>([]);
  selectedAddressId = signal<string | null>(null);
  showNewAddressForm = signal(false);

  newAddress = {
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    isDefault: false
  };
  
  selectedPaymentMethod = signal<'BNPL' | 'CARD' | 'PAYFAST'>('BNPL');
  bnplEligible = signal(false);
  bnplReason = signal('');
  processing = signal(false);
  couponCode = signal('');
  appliedCoupon = signal<any | null>(null);
  discountAmount = signal(0);
  userId = '';

  // Chommie Coins
  coinsBalance = signal(0);
  appliedCoins = signal(0);
  coinDiscount = signal(0);
  deliveryNotes = signal('');
  
  vatAmount = computed(() => {
    const subtotal = this.cartService.totalAmount() - this.discountAmount() - this.coinDiscount();
    return subtotal * 0.15;
  });

  constructor(
    public cartService: CartService,
    private bnplService: BnplService,
    private orderService: OrderService,
    public authService: AuthService,
    public ts: TranslationService,
    private router: Router,
    public deviceService: DeviceService
  ) {
    this.userId = localStorage.getItem('user_id') || '';
  }

  ngOnInit() {
    if (this.cartService.cartItems().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    this.loadUserAddresses();
    this.checkBnplEligibility();
    this.loadCoinsBalance();
  }

  loadCoinsBalance() {
    if (this.userId) {
      this.bnplService.getProfile(this.userId).subscribe(profile => {
        if (profile) {
          this.coinsBalance.set(profile.coinsBalance);
        }
      });
    }
  }

  applyCoins() {
    const maxUse = Math.min(this.coinsBalance(), Math.floor(this.cartService.totalAmount() - this.discountAmount()));
    if (maxUse > 0) {
      this.appliedCoins.set(maxUse);
      this.coinDiscount.set(maxUse);
    }
  }

  removeCoins() {
    this.appliedCoins.set(0);
    this.coinDiscount.set(0);
  }

  loadUserAddresses() {
    this.authService.getProfile(this.userId).subscribe({
      next: (user) => {
        if (user.addresses && user.addresses.length > 0) {
            this.savedAddresses.set(user.addresses);
            const defaultAddr = user.addresses.find((a: any) => a.isDefault);
            this.selectedAddressId.set(defaultAddr ? defaultAddr.id : user.addresses[0].id);
        } else {
            this.showNewAddressForm.set(true);
        }
      },
      error: (err) => {
          console.error('Failed to load profile', err);
          this.showNewAddressForm.set(true);
      }
    });
  }

  selectAddress(id: string) {
    this.selectedAddressId.set(id);
    this.showNewAddressForm.set(false);
  }

  addNewAddress() {
    if (!this.newAddress.fullName || !this.newAddress.street || !this.newAddress.city || !this.newAddress.zip) {
        alert('Please fill in all required fields');
        return;
    }

    this.authService.addAddress(this.userId, this.newAddress).subscribe({
        next: (user) => {
            this.savedAddresses.set(user.addresses);
            const newAddr = user.addresses[user.addresses.length - 1];
            this.selectedAddressId.set(newAddr.id);
            this.showNewAddressForm.set(false);
            this.newAddress = { fullName: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false };
        },
        error: (err) => alert('Failed to save address')
    });
  }

  selectPayment(method: 'BNPL' | 'CARD' | 'PAYFAST') {
    this.selectedPaymentMethod.set(method);
  }

  applyCoupon() {
    if (!this.couponCode()) return;
    
    this.orderService.validateCoupon(this.couponCode(), this.cartService.totalAmount()).subscribe({
      next: (res) => {
        if (res.status === 'error') {
          alert(res.message);
          this.appliedCoupon.set(null);
          this.discountAmount.set(0);
          return;
        }
        this.appliedCoupon.set(res);
        if (res.type === 'PERCENTAGE') {
          this.discountAmount.set((this.cartService.totalAmount() * Number(res.value)) / 100);
        } else {
          this.discountAmount.set(Number(res.value));
        }
      },
      error: (err) => alert('Invalid coupon code')
    });
  }

  checkBnplEligibility() {
    const total = this.cartService.totalAmount();
    if (total <= 0) return;

    this.bnplService.checkEligibility(this.userId, total).subscribe({
      next: (result) => {
        this.bnplEligible.set(result.eligible);
        this.bnplReason.set(result.reason || '');
      },
      error: () => {
        this.bnplEligible.set(false);
        this.bnplReason.set('Unable to verify eligibility at this time.');
      }
    });
  }

  placeOrder() {
    this.processing.set(true);

    let fullAddress = '';
    
    if (this.showNewAddressForm()) {
         if (!this.newAddress.street) {
             alert('Please select or enter a shipping address');
             this.processing.set(false);
             return;
         }
         fullAddress = `${this.newAddress.fullName}, ${this.newAddress.street}, ${this.newAddress.city}, ${this.newAddress.zip}`;
    } else {
        const addr = this.savedAddresses().find(a => a.id === this.selectedAddressId());
        if (!addr) {
             alert('Please select a shipping address');
             this.processing.set(false);
             return;
        }
        fullAddress = `${addr.fullName}, ${addr.street}, ${addr.city}, ${addr.zip}`;
    }
    
    const orderItems = this.cartService.cartItems().map(item => ({
      productId: item.id!,
      productName: item.name,
      productImage: item.images?.[0] || '',
      quantity: item.quantity,
      price: item.price,
      vendorId: item.vendorId,
      selectedVariants: item.selectedVariants
    }));

    const orderData = {
      userId: this.userId,
      email: localStorage.getItem('user_email') || 'user@example.com',
      paymentMethod: this.selectedPaymentMethod(),
      items: orderItems,
      shippingAddress: fullAddress,
      couponCode: this.appliedCoupon()?.code,
      deliveryNotes: this.deliveryNotes(),
      pointsRedeemed: this.appliedCoins(),
      isPlusOrder: this.authService.isPlusMember()
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        if (this.selectedPaymentMethod() === 'PAYFAST') {
            this.orderService.initiatePayFast({
                orderId: order.id,
                userId: this.userId,
                amount: order.totalAmount,
                email: orderData.email,
                items: order.items.map((i: any) => i.productName).join(', ')
            }).subscribe(res => {
                if (res.url) {
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = res.url;
                    
                    Object.keys(res.form).forEach(key => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = res.form[key];
                        form.appendChild(input);
                    });
                    
                    document.body.appendChild(form);
                    form.submit();
                }
            });
            return;
        }

        // Points redemption is now handled by order-service calling bnpl-service
        this.cartService.clearCart();
        this.bnplService.triggerRefresh(); 
        this.processing.set(false);
        this.router.navigate(['/orders']); 
      },
      error: (err) => {
        console.error('Order creation failed:', err);
        this.processing.set(false);
        alert('Failed to place order. Please try again.');
      }
    });
  }
}
