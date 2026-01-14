import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-gift-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#FAF3E1] pb-32">
      
      <!-- Hero Section -->
      <section class="bg-white border-b border-neutral-200 py-16 px-6">
          <div class="w-full flex flex-col md:flex-row items-center gap-12">
              <div class="flex-grow space-y-6 animate-fade-in">
                  <h1 class="text-4xl font-header font-black text-[#222222] tracking-tight uppercase">{{ ts.t('gift.title') }}</h1>
                  <p class="text-lg text-neutral-700 leading-relaxed max-w-xl">
                     {{ ts.t('gift.subtitle') }}
                  </p>
                  <div class="pt-4 flex flex-wrap gap-4">
                     <button class="btn-primary py-2 px-8 rounded-[3px] text-sm font-bold shadow-sm">
                        {{ ts.t('gift.shop') }}
                     </button>
                     <button class="btn-secondary py-2 px-8 rounded-[3px] text-sm font-bold shadow-sm">
                        {{ ts.t('gift.redeem') }}
                     </button>
                  </div>
              </div>
              <div class="w-full md:w-1/3 animate-scale-up">
                  <div class="aspect-[1.6/1] bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-xl p-6 flex flex-col justify-between text-white border border-white/20">
                      <span class="font-black text-xl tracking-tighter">CHOMMIE</span>
                      <div class="flex justify-between items-end">
                          <span class="text-3xl font-bold">R500</span>
                          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center border border-white/10">
                             <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2z"></path></svg>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <!-- Card Designs Grid -->
      <div class="w-full px-6 py-20 animate-fade-in">
          <div class="mb-12 border-b border-neutral-300 pb-4">
             <h2 class="text-2xl font-bold text-[#222222]">Top gift card designs</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div *ngFor="let i of [
                {n: 'Birthday', c: 'from-amber-400 to-orange-500', t: 'Happy Birthday!'},
                {n: 'Thank You', c: 'from-emerald-400 to-teal-600', t: 'Thank You'},
                {n: 'Registry', c: 'from-blue-400 to-indigo-600', t: 'Best Wishes'},
                {n: 'Standard', c: 'from-primary to-primary-dark', t: 'Gift Signal'}
              ]" class="flex flex-col group cursor-pointer">
                  <div class="aspect-[1.6/1] bg-gradient-to-br rounded-lg shadow-md group-hover:shadow-lg transition-all p-5 flex flex-col justify-between text-white mb-3" [ngClass]="i.c">
                      <span class="font-black text-sm tracking-tighter">CHOMMIE</span>
                      <span class="text-xl font-bold uppercase tracking-tight">{{ i.t }}</span>
                  </div>
                  <h3 class="text-sm font-bold text-[#222222] group-hover:text-primary transition-colors">{{ i.n }} Gift Card</h3>
                  <span class="text-xs text-neutral-500">Physical or Digital delivery</span>
              </div>
          </div>
      </div>

      <!-- Information Sections -->
      <section class="w-full px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
         <div class="bg-white p-8 border border-neutral-300 rounded-lg shadow-sm space-y-4">
            <h4 class="font-bold text-lg text-[#222222]">No Fees. No Expiration.</h4>
            <p class="text-neutral-600 leading-relaxed">Chommie Gift Cards have no fees and never expire. They can be redeemed for millions of items across our entire marketplace.</p>
         </div>
         <div class="bg-white p-8 border border-neutral-300 rounded-lg shadow-sm space-y-4">
            <h4 class="font-bold text-lg text-[#222222]">Instant Digital Delivery</h4>
            <p class="text-neutral-600 leading-relaxed">Need a gift right now? Send a gift card via email or text message. It arrives in seconds and can be used immediately.</p>
         </div>
         <div class="bg-white p-8 border border-neutral-300 rounded-lg shadow-sm space-y-4">
            <h4 class="font-bold text-lg text-[#222222]">Reload Your Balance</h4>
            <p class="text-neutral-600 leading-relaxed">Easily add funds to your account balance using a credit card or your Chommie Trust Coins.</p>
         </div>
      </section>
    </div>
  `
})
export class GiftCardsComponent {
  constructor(public ts: TranslationService) {}
}
