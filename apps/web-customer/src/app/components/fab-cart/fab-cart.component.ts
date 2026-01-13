import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-fab-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      
      <!-- Mini Cart Preview (Slide out) -->
      <div *ngIf="isOpen()" @slideInOut class="mb-4 w-80 bg-white rounded-[4px] shadow-2xl overflow-hidden border border-gray-200">
        <div class="p-4 bg-primary-dark text-white flex justify-between items-center">
          <h3 class="font-bold text-sm">Your Cart ({{ cartCount() }})</h3>
          <button (click)="toggleCart()" class="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="max-h-64 overflow-y-auto p-4 space-y-3 bg-white">
          <div *ngFor="let item of cartItems()" class="flex gap-3">
            <div class="w-12 h-12 bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
               <img *ngIf="item.images && item.images.length" [src]="item.images[0]" class="w-full h-full object-cover">
               <span *ngIf="!item.images || !item.images.length" class="text-xs text-gray-400">Img</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-black truncate">{{ item.name }}</p>
              <p class="text-xs text-gray-600">{{ item.quantity }} x R{{ item.price | number:'1.2-2' }}</p>
            </div>
            <div class="text-sm font-bold text-[#B12704]">
              R{{ (item.price * item.quantity) | number:'1.2-2' }}
            </div>
          </div>
          <div *ngIf="cartItems().length === 0" class="text-center text-gray-500 py-4 text-sm">
            Cart is empty
          </div>
        </div>

        <div class="p-4 bg-gray-50 border-t border-gray-200">
          <div class="flex justify-between items-center mb-3">
            <span class="text-gray-700 text-sm">Subtotal</span>
            <span class="text-lg font-bold text-[#B12704]">R{{ cartTotal() | number:'1.2-2' }}</span>
          </div>
          
          <!-- BNPL Preview -->
          <div class="mb-4 px-3 py-2 bg-[#F0F2F2] rounded border border-gray-300">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] font-bold text-white bg-primary px-1.5 rounded">BNPL</span>
              <span class="text-[10px] text-gray-600 font-bold">Pay over 4 weeks</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500">4 payments of</span>
              <span class="text-xs font-bold text-black">R{{ (cartTotal() / 4) | number:'1.2-2' }}</span>
            </div>
          </div>

          <button routerLink="/checkout" (click)="toggleCart()" class="w-full bg-action hover:bg-action-hover text-white py-2 rounded-[20px] font-medium transition-colors shadow-sm text-sm">
            Proceed to Checkout
          </button>
        </div>
      </div>

      <!-- Main FAB Button -->
      <button 
        (click)="toggleCart()"
        class="group relative flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-light transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-light/50"
        [class.animate-bounce]="animate()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        
        <span *ngIf="cartCount() > 0" class="absolute -top-1 -right-1 bg-action text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
          {{ cartCount() }}
        </span>
      </button>
    </div>
  `,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class FabCartComponent {
  cartService = inject(CartService);
  
  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.totalAmount;
  cartCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  
  isOpen = signal(false);
  animate = signal(false);

  constructor() {
    // Simple pulse effect when cart changes
    // In a real app, use an effect() to watch cartCount and trigger animation
  }

  toggleCart() {
    this.isOpen.update(v => !v);
  }
}
