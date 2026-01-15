import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#FAF3E1] pb-32">
      
      <!-- Sell Hero -->
      <section class="bg-[#1B4332] text-white py-20 px-6">
          <div class="w-full flex flex-col lg:flex-row items-center gap-16">
              <div class="lg:w-1/2 space-y-8 animate-fade-in">
                  <h1 class="text-4xl md:text-5xl font-header font-black tracking-tight leading-tight uppercase">
                     {{ ts.t('sell.title') }}
                  </h1>
                  <p class="text-lg text-neutral-300 leading-relaxed max-w-xl">
                     {{ ts.t('sell.subtitle') }}
                  </p>
                  <div class="flex flex-col sm:flex-row gap-4 pt-4">
                      <a href="http://localhost:4201/register" class="btn-primary py-3 px-10 rounded-[3px] text-sm font-bold text-center uppercase shadow-lg">{{ ts.t('sell.start') }}</a>
                      <a href="http://localhost:4201/login" class="bg-transparent border border-white/30 hover:bg-white/10 py-3 px-10 rounded-[3px] text-sm font-bold text-center uppercase transition-all">{{ ts.t('sell.login') }}</a>
                  </div>
                  <p class="text-xs text-neutral-400 italic">R299 / month + referral fees</p>
              </div>

              <!-- Sell Illustration/Card -->
              <div class="lg:w-1/2 animate-scale-up">
                  <div class="bg-white rounded-lg p-8 shadow-2xl border border-neutral-200">
                      <div class="flex items-center gap-4 mb-8">
                          <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                          </div>
                          <div>
                              <h3 class="text-xl font-bold text-[#222222]">Seller Growth Node</h3>
                              <p class="text-xs text-neutral-500 uppercase tracking-widest font-bold">Real-time Performance Sync</p>
                          </div>
                      </div>
                      <div class="space-y-4">
                          <div class="h-4 bg-neutral-100 rounded-full w-3/4"></div>
                          <div class="h-4 bg-neutral-100 rounded-full w-1/2"></div>
                          <div class="h-4 bg-neutral-100 rounded-full w-5/6"></div>
                      </div>
                      <div class="mt-8 grid grid-cols-2 gap-4">
                          <div class="border border-neutral-100 p-4 rounded-md text-center">
                              <span class="block text-2xl font-bold text-[#222222]">150%</span>
                              <span class="text-[10px] text-neutral-500 uppercase font-bold">Avg. Growth</span>
                          </div>
                          <div class="border border-neutral-100 p-4 rounded-md text-center">
                              <span class="block text-2xl font-bold text-[#222222]">2.4M</span>
                              <span class="text-[10px] text-neutral-500 uppercase font-bold">Active Nodes</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <!-- Why Sell Section -->
      <section class="w-full px-6 py-24">
         <h2 class="text-3xl font-bold text-[#222222] text-center mb-16">Why sell on Chommie.za?</h2>
         
         <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="space-y-4 text-center p-6 bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
               <div class="w-16 h-16 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
               </div>
               <h4 class="text-xl font-bold text-[#222222]">Trust-Based Ecosystem</h4>
               <p class="text-neutral-600 text-sm leading-relaxed">Benefit from our Trust Score system. Reliable sellers get prioritized in search and lower protocol fees.</p>
            </div>
            <div class="space-y-4 text-center p-6 bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
               <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               </div>
               <h4 class="text-xl font-bold text-[#222222]">BNPL Integration</h4>
               <p class="text-neutral-600 text-sm leading-relaxed">Increase your conversion rates by offering "Buy Now, Pay Later" to your customers at no extra risk to you.</p>
            </div>
            <div class="space-y-4 text-center p-6 bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
               <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
               </div>
               <h4 class="text-xl font-bold text-[#222222]">Society First</h4>
               <p class="text-neutral-600 text-sm leading-relaxed">We empower local sellers first. Join a community that values local craftsmanship and sustainable growth.</p>
            </div>
         </div>
      </section>
    </div>
  `
})
export class SellComponent {
  constructor(public ts: TranslationService) {}
}
