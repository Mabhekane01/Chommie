import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ComparisonService } from '../../services/comparison.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-deep-ocean text-white pb-32 pt-10">
      <div class="w-full px-10 animate-fade-in">
        
        <!-- Header -->
        <div class="mb-16">
           <h1 class="text-4xl md:text-6xl font-header font-black tracking-tighter mb-2 uppercase">
              Logic <span class="text-cyber-teal text-neon">Matrix</span>
           </h1>
           <p class="text-neutral-silver/40 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Synchronized Asset Comparison
           </p>
        </div>

        <div *ngIf="comparisonService.compareList().length === 0" class="glass-panel rounded-[3rem] py-32 text-center border-dashed border-white/10">
            <p class="text-neutral-silver/40 font-black uppercase tracking-widest mb-8">No assets selected for analysis.</p>
            <a routerLink="/products" class="btn-primary inline-block py-3 px-10">Access Marketplace</a>
        </div>

        <div *ngIf="comparisonService.compareList().length > 0" class="glass-panel rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
            <div class="overflow-x-auto scrollbar-hide">
                <table class="w-full text-sm border-collapse min-w-[800px]">
                    <thead>
                        <tr class="bg-white/[0.03]">
                            <th class="w-64 p-10 border-b border-white/5 text-left align-middle">
                                <button (click)="comparisonService.clearComparison()" class="text-[10px] font-black text-accent hover:text-white transition-colors uppercase tracking-widest">Abort All</button>
                            </th>
                            <th *ngFor="let product of comparisonService.compareList()" class="w-80 p-10 border-b border-white/5 align-top relative group">
                                <button (click)="comparisonService.removeFromCompare(product.id || product._id)" class="absolute top-6 right-6 text-neutral-silver/20 hover:text-accent transition-colors text-2xl font-bold">×</button>
                                
                                <div class="h-48 glass-panel rounded-2xl mb-8 p-6 flex items-center justify-center relative overflow-hidden group-hover:border-cyber-teal/30 transition-all duration-700 shadow-xl bg-white/5">
                                    <div class="absolute inset-0 bg-gradient-to-tr from-cyber-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <img [src]="product.images[0]" class="max-h-full max-w-full object-contain filter drop-shadow-2xl group-hover:scale-110 transition-all duration-700">
                                </div>

                                <div class="space-y-4">
                                   <div class="text-white font-bold hover:text-cyber-teal transition-colors cursor-pointer line-clamp-2 h-12 uppercase tracking-tight leading-tight text-sm" [routerLink]="['/products', product.id || product._id]">
                                       {{ product.name }}
                                   </div>
                                   <div class="text-3xl font-black text-white tracking-tighter text-neon">
                                       R{{ product.price | number:'1.0-0' }}
                                   </div>
                                   <button (click)="addToCart(product)" class="w-full btn-primary py-3 rounded-xl text-[9px] font-black tracking-widest uppercase shadow-lg">
                                       ADD TO VAULT
                                   </button>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr class="hover:bg-white/[0.01] transition-colors">
                            <td class="p-10 text-[10px] font-black text-neutral-silver/40 uppercase tracking-[0.3em]">User Rank</td>
                            <td *ngFor="let product of comparisonService.compareList()" class="p-10 text-center">
                                <div class="flex justify-center text-cyber-teal text-base mb-2">
                                    <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product.ratings || 0) ? '★' : '☆' }}</span>
                                </div>
                                <div class="text-[9px] font-black text-neutral-silver/20 uppercase tracking-widest">({{ product.numReviews || 0 }} Echoes)</div>
                            </td>
                        </tr>
                        <tr class="hover:bg-white/[0.01] transition-colors">
                            <td class="p-10 text-[10px] font-black text-neutral-silver/40 uppercase tracking-[0.3em]">Logic Sector</td>
                            <td *ngFor="let product of comparisonService.compareList()" class="p-10 text-center text-white font-bold uppercase tracking-widest text-xs">
                                {{ product.category }}
                            </td>
                        </tr>
                        <tr class="hover:bg-white/[0.01] transition-colors">
                            <td class="p-10 text-[10px] font-black text-neutral-silver/40 uppercase tracking-[0.3em]">Logistics</td>
                            <td *ngFor="let product of comparisonService.compareList()" class="p-10 text-center">
                                <div *ngIf="product.price >= 500" class="text-[10px] font-black text-cyber-lime uppercase tracking-widest">
                                    Zero Latency Ship
                                </div>
                                <div *ngIf="product.price < 500" class="text-[10px] font-black text-neutral-silver/40 uppercase tracking-widest">
                                    + Standard Relay
                                </div>
                            </td>
                        </tr>
                        <tr class="hover:bg-white/[0.01] transition-colors">
                            <td class="p-10 text-[10px] font-black text-neutral-silver/40 uppercase tracking-[0.3em]">Nexus Source</td>
                            <td *ngFor="let product of comparisonService.compareList()" class="p-10 text-center text-cyber-teal font-black uppercase tracking-widest text-[10px]">
                                CHOMMIE_RETAIL_NODE
                            </td>
                        </tr>
                        <tr class="hover:bg-white/[0.01] transition-colors">
                            <td class="p-10 text-[10px] font-black text-neutral-silver/40 uppercase tracking-[0.3em]">Manifest Data</td>
                            <td *ngFor="let product of comparisonService.compareList()" class="p-10 text-xs text-neutral-silver/60 font-medium leading-relaxed text-left uppercase tracking-tight">
                                {{ product.description }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  `
})
export class ComparisonComponent {
  Math = Math;

  constructor(
    public comparisonService: ComparisonService,
    private cartService: CartService
  ) {}

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }
}
