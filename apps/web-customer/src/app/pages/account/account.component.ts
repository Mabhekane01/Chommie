import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32 pt-6">
      <div class="w-full px-6 animate-fade-in">
        <h1 class="text-2xl font-normal text-neutral-charcoal mb-6">Your Account</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <!-- Your Orders -->
            <a routerLink="/orders" class="bg-white border border-neutral-300 rounded-lg p-5 flex gap-4 hover:bg-neutral-50 transition-colors shadow-sm min-h-[100px]">
                <div class="w-12 h-12 flex-shrink-0">
                    <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/help/images/gateway/box-2-item._CB659979736_.png" class="w-full h-full object-contain">
                </div>
                <div>
                    <h2 class="font-bold text-[#222222] text-base">{{ ts.t('account.orders') }}</h2>
                    <p class="text-xs text-neutral-500 leading-relaxed mt-1">{{ ts.t('account.orders_desc') }}</p>
                </div>
            </a>

            <!-- Login & Security -->
            <a routerLink="/account/security" class="bg-white border border-neutral-300 rounded-lg p-5 flex gap-4 hover:bg-neutral-50 transition-colors shadow-sm min-h-[100px]">
                <div class="w-12 h-12 flex-shrink-0">
                    <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/help/images/gateway/account-icon._CB659979736_.png" class="w-full h-full object-contain">
                </div>
                <div>
                    <h2 class="font-bold text-[#222222] text-base">{{ ts.t('account.security') }}</h2>
                    <p class="text-xs text-neutral-500 leading-relaxed mt-1">{{ ts.t('account.security_desc') }}</p>
                </div>
            </a>

            <!-- Your Addresses -->
            <a routerLink="/account/addresses" class="bg-white border border-neutral-300 rounded-lg p-5 flex gap-4 hover:bg-neutral-50 transition-colors shadow-sm min-h-[100px]">
                <div class="w-12 h-12 flex-shrink-0">
                    <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/help/images/gateway/address-map-pin._CB659979736_.png" class="w-full h-full object-contain">
                </div>
                <div>
                    <h2 class="font-bold text-[#222222] text-base">{{ ts.t('account.addresses') }}</h2>
                    <p class="text-xs text-neutral-500 leading-relaxed mt-1">{{ ts.t('account.addresses_desc') }}</p>
                </div>
            </a>

            <!-- Trust Score & BNPL -->
            <a routerLink="/bnpl" class="bg-white border border-neutral-300 rounded-lg p-5 flex gap-4 hover:bg-neutral-50 transition-colors shadow-sm min-h-[100px]">
                <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <div>
                    <h2 class="font-bold text-[#222222] text-base">{{ ts.t('account.trust') }}</h2>
                    <p class="text-xs text-neutral-500 leading-relaxed mt-1">{{ ts.t('account.trust_desc') }}</p>
                </div>
            </a>

            <!-- Your Payments -->
            <a routerLink="/account" class="bg-white border border-neutral-300 rounded-lg p-5 flex gap-4 hover:bg-neutral-50 transition-colors shadow-sm min-h-[100px]">
                <div class="w-12 h-12 flex-shrink-0">
                    <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/contact-us/icon-payments._CB423447139_.png" class="w-full h-full object-contain">
                </div>
                <div>
                    <h2 class="font-bold text-[#222222] text-base">{{ ts.t('account.payments') }}</h2>
                    <p class="text-xs text-neutral-500 leading-relaxed mt-1">{{ ts.t('account.payments_desc') }}</p>
                </div>
            </a>

            <!-- Customer Service -->
            <a routerLink="/help" class="bg-white border border-neutral-300 rounded-lg p-5 flex gap-4 hover:bg-neutral-50 transition-colors shadow-sm min-h-[100px]">
                <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <div>
                    <h2 class="font-bold text-[#222222] text-base">{{ ts.t('nav.help') }}</h2>
                    <p class="text-xs text-neutral-500 leading-relaxed mt-1">Contact us via phone, chat, or email</p>
                </div>
            </a>
        </div>

        <div class="mt-12 h-px bg-neutral-300"></div>

        <!-- Secondary Sector -->
        <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
             <div class="space-y-3">
                 <h3 class="font-bold text-[#222222]">Digital content and devices</h3>
                 <ul class="space-y-1 text-primary">
                     <li><a href="#" class="hover:underline">Apps and more</a></li>
                     <li><a href="#" class="hover:underline">Content and devices</a></li>
                     <li><a href="#" class="hover:underline">Digital subscriptions</a></li>
                 </ul>
             </div>
             <div class="space-y-3">
                 <h3 class="font-bold text-[#222222]">Email alerts, messages, and ads</h3>
                 <ul class="space-y-1 text-primary">
                     <li><a routerLink="/messages" class="hover:underline">Message Center</a></li>
                     <li><a href="#" class="hover:underline">Communication preferences</a></li>
                     <li><a href="#" class="hover:underline">Advertising preferences</a></li>
                 </ul>
             </div>
             <div class="space-y-3">
                 <h3 class="font-bold text-[#222222]">More ways to pay</h3>
                 <ul class="space-y-1 text-primary">
                     <li><a href="#" class="hover:underline">Chommie Trust Coins</a></li>
                     <li><a routerLink="/gift-cards" class="hover:underline">Gift Card Balance</a></li>
                     <li><a href="#" class="hover:underline">Shop with Trust Coins</a></li>
                 </ul>
             </div>
        </div>
      </div>
    </div>
  `
})
export class AccountComponent implements OnInit {
  constructor(private authService: AuthService, public ts: TranslationService) {}
  ngOnInit() {}
}