import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { BnplService } from '../../services/bnpl.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div *ngIf="cartService.cartItems().length === 0" class="text-center py-10 bg-white rounded-lg shadow">
        <p class="text-gray-500 text-xl mb-4">Your cart is empty.</p>
        <button class="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800 transition-colors" routerLink="/products">
          Continue Shopping
        </button>
      </div>

      <div *ngIf="cartService.cartItems().length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items List -->
        <div class="lg:col-span-2 space-y-4">
          <div *ngFor="let item of cartService.cartItems()" class="bg-white p-4 rounded-lg shadow flex items-center gap-4">
            <div class="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
              <img *ngIf="item.images && item.images.length" [src]="item.images[0]" [alt]="item.name" class="w-full h-full object-cover">
              <div *ngIf="!item.images || !item.images.length" class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
            </div>
            
            <div class="flex-grow">
              <h3 class="font-semibold text-lg">{{ item.name }}</h3>
              <p class="text-gray-600 text-sm">{{ item.category }}</p>
              <div class="mt-2 flex items-center gap-4">
                <span class="font-bold text-green-800">R{{ item.price | number:'1.2-2' }}</span>
                <div class="flex items-center border rounded">
                  <button (click)="decreaseQty(item.id!)" class="px-3 py-1 hover:bg-gray-100">-</button>
                  <span class="px-3 py-1 border-x">{{ item.quantity }}</span>
                  <button (click)="increaseQty(item.id!)" class="px-3 py-1 hover:bg-gray-100">+</button>
                </div>
              </div>
            </div>

            <button (click)="removeItem(item.id!)" class="text-red-500 hover:text-red-700 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white p-6 rounded-lg shadow h-fit">
          <h2 class="text-xl font-bold mb-4">Order Summary</h2>
          
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Subtotal</span>
            <span class="font-semibold">R{{ cartService.totalAmount() | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between mb-4">
            <span class="text-gray-600">Shipping</span>
            <span class="text-green-600 font-semibold">Free</span>
          </div>
          
          <div class="border-t pt-4 mb-6">
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold">Total</span>
              <span class="text-2xl font-bold text-green-800">R{{ cartService.totalAmount() | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- BNPL Eligibility Check -->
          <div class="mb-6 p-4 rounded border" [ngClass]="eligible() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
            <div class="flex items-center gap-2 mb-2">
              <div class="font-bold" [ngClass]="eligible() ? 'text-green-800' : 'text-red-800'">
                {{ eligible() ? 'BNPL Eligible' : 'BNPL Unavailable' }}
              </div>
            </div>
            <p class="text-sm" [ngClass]="eligible() ? 'text-green-700' : 'text-red-700'">
              {{ eligibilityReason() }}
            </p>
          </div>

          <button 
            (click)="checkoutWithBnpl()"
            [disabled]="!eligible() || processing()"
            class="w-full py-3 rounded font-bold text-white transition-colors mb-3"
            [ngClass]="eligible() && !processing() ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'"
          >
            {{ processing() ? 'Processing...' : 'Check Out with BNPL' }}
          </button>
          
          <button class="w-full py-3 rounded font-bold border border-gray-300 hover:bg-gray-50 transition-colors">
            Pay with Card / EFT
          </button>
        </div>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  eligible = signal(false);
  eligibilityReason = signal('Checking eligibility...');
  processing = signal(false);
  userId = '';

  constructor(
    public cartService: CartService,
    private bnplService: BnplService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.userId = localStorage.getItem('user_id') || '';
    effect(() => {
      const total = this.cartService.totalAmount();
      if (total > 0) {
        this.checkEligibility(total);
      }
    });
  }

  ngOnInit() {}

  checkEligibility(amount: number) {
    this.bnplService.getProfile(this.userId).subscribe(profile => {
        if (!profile) {
            this.eligible.set(false);
            this.eligibilityReason.set('Please sign in to check eligibility.');
            return;
        }

        if (amount <= profile.creditLimit) {
            this.eligible.set(true);
            this.eligibilityReason.set(`Within your credit limit of R${profile.creditLimit}.`);
        } else {
            this.eligible.set(false);
            this.eligibilityReason.set(`Total exceeds your credit limit of R${profile.creditLimit}.`);
        }
    });
  }

  checkoutWithBnpl() {
    this.processing.set(true);
    
    const orderItems = this.cartService.cartItems().map(item => ({
      productId: item.id!,
      productName: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const orderData = {
      userId: this.userId,
      paymentMethod: 'BNPL' as const,
      items: orderItems,
      shippingAddress: '123 Main St, Sandton, Johannesburg' // Mock address
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        console.log('Order created:', order);
        this.cartService.clearCart();
        this.processing.set(false);
        this.router.navigate(['/orders']); // We need to create this page
      },
      error: (err) => {
        console.error('Order creation failed:', err);
        this.processing.set(false);
        alert('Failed to place order. Please try again.');
      }
    });
  }

  increaseQty(id: string) {
    const item = this.cartService.cartItems().find(i => i.id === id);
    if (item) this.cartService.updateQuantity(id, item.quantity + 1);
  }

  decreaseQty(id: string) {
    const item = this.cartService.cartItems().find(i => i.id === id);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(id, item.quantity - 1);
    }
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id);
  }
}
