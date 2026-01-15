import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ComparisonService } from '../../services/comparison.service';
import { CartService } from '../../services/cart.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32 pt-10">
      <div class="w-full px-6 animate-fade-in">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <a routerLink="/" class="hover:underline hover:text-primary">Registry</a>
          <span>›</span>
          <span class="text-primary font-bold">Compare Items</span>
        </nav>

        <h1 class="text-3xl font-normal text-neutral-charcoal mb-10">Compare with similar items</h1>

        <div *ngIf="comparisonService.compareList().length === 0" class="py-20 text-center bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
            <p class="text-neutral-500 font-bold mb-6">No items selected for comparison.</p>
            <a routerLink="/products" class="btn-primary inline-block py-2 px-8 rounded-md shadow-sm">Start Shopping</a>
        </div>

        <div *ngIf="comparisonService.compareList().length > 0" class="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm bg-white">
            <table class="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr class="bg-neutral-50 border-b border-neutral-200">
                        <th class="w-64 p-6 align-top">
                            <button (click)="comparisonService.clearComparison()" class="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Clear all</button>
                        </th>
                        <th *ngFor="let product of comparisonService.compareList()" class="w-80 p-6 align-top relative group border-l border-neutral-100">
                            <button (click)="comparisonService.removeFromCompare(product.id || product._id)" class="absolute top-2 right-2 text-neutral-300 hover:text-red-600 transition-colors text-xl">&times;</button>
                            
                            <div class="h-48 flex items-center justify-center mb-6 bg-white p-4">
                                <img [src]="product.images[0]" class="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105">
                            </div>

                            <div class="space-y-3">
                               <a [routerLink]="['/products', product.id || product._id]" class="text-sm font-bold text-primary hover:text-action hover:underline line-clamp-2 h-10 leading-tight">
                                   {{ product.name }}
                               </a>
                               <div class="text-2xl font-bold text-neutral-charcoal">
                                   <span class="text-xs align-top relative top-1">R</span>{{ product.price | number:'1.0-0' }}
                               </div>
                               <button (click)="addToCart(product)" class="w-full btn-primary py-2 rounded-full text-xs font-bold shadow-sm transition-transform active:scale-95">
                                   Add to Cart
                               </button>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100">
                    <!-- Customer Rating -->
                    <tr>
                        <td class="p-6 font-bold text-sm text-neutral-600 bg-neutral-50/50">Customer Rating</td>
                        <td *ngFor="let product of comparisonService.compareList()" class="p-6 border-l border-neutral-100">
                            <div class="flex items-center gap-1.5">
                                <span class="text-amber-500 font-bold">★ {{ product.ratings || 0 }}</span>
                                <span class="text-neutral-400 text-xs">({{ product.numReviews || 0 }})</span>
                            </div>
                        </td>
                    </tr>
                    <!-- BNPL Eligibility -->
                    <tr>
                        <td class="p-6 font-bold text-sm text-neutral-600 bg-neutral-50/50">BNPL Ready</td>
                        <td *ngFor="let product of comparisonService.compareList()" class="p-6 border-l border-neutral-100">
                            <div *ngIf="product.bnplEligible" class="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                YES
                            </div>
                            <div *ngIf="!product.bnplEligible" class="text-neutral-400 text-xs font-bold">NO</div>
                        </td>
                    </tr>
                    <!-- Shipping -->
                    <tr>
                        <td class="p-6 font-bold text-sm text-neutral-600 bg-neutral-50/50">Shipping</td>
                        <td *ngFor="let product of comparisonService.compareList()" class="p-6 border-l border-neutral-100">
                            <div class="text-xs text-neutral-700 leading-relaxed">
                                <span class="font-bold text-emerald-700 block">FREE One-Day Delivery</span>
                                <span class="text-neutral-500">Ships from Chommie.za</span>
                            </div>
                        </td>
                    </tr>
                    <!-- Description -->
                    <tr>
                        <td class="p-6 font-bold text-sm text-neutral-600 bg-neutral-50/50">Details</td>
                        <td *ngFor="let product of comparisonService.compareList()" class="p-6 border-l border-neutral-100">
                            <p class="text-xs text-neutral-600 leading-relaxed line-clamp-6">
                                {{ product.description }}
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ComparisonComponent {
  Math = Math;

  constructor(
    public comparisonService: ComparisonService,
    private cartService: CartService,
    public ts: TranslationService
  ) {}

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }
}