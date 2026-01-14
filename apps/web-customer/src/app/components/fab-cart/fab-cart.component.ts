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
      
      <!-- Mini Cart Preview (Cyber Matrix) -->
      <div *ngIf="isOpen()" @slideInOut class="mb-6 w-80 glass-panel rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 relative">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none"></div>
        
        <div class="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center relative z-10">
          <h3 class="font-header font-black text-xs uppercase tracking-widest text-white flex items-center gap-2">
             <span class="w-1.5 h-1.5 rounded-full bg-cyber-teal shadow-[0_0_10px_rgba(0,217,255,0.8)]"></span>
             Vault Status ({{ cartCount() }})
          </h3>
          <button (click)="toggleCart()" class="text-neutral-silver/40 hover:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="max-h-64 overflow-y-auto p-6 space-y-4 relative z-10 scrollbar-hide">
          <div *ngFor="let item of cartItems()" class="flex gap-4 group/item">
            <div class="w-14 h-14 glass-panel rounded-xl flex-shrink-0 flex items-center justify-center p-2 relative overflow-hidden">
               <img *ngIf="item.images.length" [src]="item.images[0]" class="max-w-full max-h-full object-contain filter drop-shadow-lg group-hover/item:scale-110 transition-transform">
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-center">
              <p class="text-xs font-black text-white uppercase tracking-tight truncate">{{ item.name }}</p>
              <p class="text-[10px] font-bold text-neutral-silver/40 uppercase tracking-widest">{{ item.quantity }} Units</p>
            </div>
            <div class="text-xs font-black text-cyber-teal self-center tracking-tighter">
              R{{ (item.price * item.quantity) | number:'1.0-0' }}
            </div>
          </div>
          <div *ngIf="cartItems().length === 0" class="text-center text-neutral-silver/20 py-10 text-[10px] font-black uppercase tracking-widest italic">
            Vault Offline
          </div>
        </div>

        <div class="p-6 bg-white/5 border-t border-white/5 relative z-10 space-y-6">
          <div class="flex justify-between items-end">
            <span class="text-[10px] font-black text-neutral-silver/40 uppercase tracking-widest">Aggregate Value</span>
            <span class="text-2xl font-header font-black text-white tracking-tighter text-neon">R{{ cartTotal() | number:'1.0-0' }}</span>
          </div>
          
          <button routerLink="/checkout" (click)="toggleCart()" class="w-full btn-primary py-4 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase shadow-[0_15px_30px_rgba(107,45,158,0.3)]">
            INITIALIZE CHECKOUT
          </button>
        </div>
      </div>

      <!-- Main FAB Button (Orb) -->
      <button 
        (click)="toggleCart()"
        class="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent text-white rounded-[1.5rem] shadow-2xl hover:scale-110 transition-all active:scale-95 focus:outline-none ring-4 ring-white/5 border border-white/20"
      >
        <!-- Pulse Effect -->
        <div class="absolute inset-0 rounded-[1.5rem] bg-accent/20 animate-ping" *ngIf="cartCount() > 0"></div>
        
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        
        <span *ngIf="cartCount() > 0" class="absolute -top-2 -right-2 bg-cyber-lime text-deep-ocean text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(204,255,0,0.6)] border-2 border-deep-ocean relative z-20">
          {{ cartCount() }}
        </span>
      </button>
    </div>
  `,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px) scale(0.95)', opacity: 0 }),
        animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(20px) scale(0.95)', opacity: 0 }))
      ])
    ])
  ],
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class FabCartComponent {
  cartService = inject(CartService);
  
  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.totalAmount;
  cartCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  
  isOpen = signal(false);
  animate = signal(false);

  toggleCart() {
    this.isOpen.update(v => !v);
  }
}