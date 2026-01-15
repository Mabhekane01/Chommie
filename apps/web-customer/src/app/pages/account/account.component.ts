import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32" [ngClass]="deviceService.isMobile() ? 'pt-2' : 'pt-10'">
      <div class="w-full animate-fade-in" [ngClass]="deviceService.isMobile() ? 'px-4' : 'px-10'">
        
        <h1 class="font-normal text-neutral-charcoal mb-8" [ngClass]="deviceService.isMobile() ? 'text-xl font-bold' : 'text-3xl'">Your Account</h1>

        <!-- Amazon-Style Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <!-- Your Orders -->
            <a routerLink="/orders" class="account-card group flex gap-4 p-5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 cursor-pointer shadow-sm min-h-[100px] items-start">
                <div class="w-16 h-16 shrink-0">
                    <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/help/images/gateway/box-2-item._CB659979736_.png" class="w-full h-full object-contain">
                </div>
                <div class="flex flex-col">
                    <h2 class="font-bold text-neutral-800 text-base group-hover:text-primary transition-colors">{{ ts.t('account.orders') }}</h2>
                    <p class="text-xs text-neutral-500 leading-normal mt-1">{{ ts.t('account.orders_desc') }}</p>
                </div>
            </a>

            <!-- Login & Security -->
            <a routerLink="/account/security" class="account-card group flex gap-4 p-5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 cursor-pointer shadow-sm min-h-[100px] items-start">
                <div class="w-16 h-16 shrink-0">
                    <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/help/images/gateway/account-icon._CB659979736_.png" class="w-full h-full object-contain">
                </div>
                <div class="flex flex-col">
                    <h2 class="font-bold text-neutral-800 text-base group-hover:text-primary transition-colors">{{ ts.t('account.security') }}</h2>
                    <p class="text-xs text-neutral-500 leading-normal mt-1">{{ ts.t('account.security_desc') }}</p>
                </div>
            </a>

            <!-- Your Addresses -->
            <a routerLink="/account/addresses" class="account-card group flex gap-4 p-5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 cursor-pointer shadow-sm min-h-[100px] items-start">
                <div class="w-16 h-16 shrink-0">
                    <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/help/images/gateway/address-map-pin._CB659979736_.png" class="w-full h-full object-contain">
                </div>
                <div class="flex flex-col">
                    <h2 class="font-bold text-neutral-800 text-base group-hover:text-primary transition-colors">{{ ts.t('account.addresses') }}</h2>
                    <p class="text-xs text-neutral-500 leading-normal mt-1">{{ ts.t('account.addresses_desc') }}</p>
                </div>
            </a>

            <!-- Your Payments -->
            <a routerLink="/account" class="account-card group flex gap-4 p-5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 cursor-pointer shadow-sm min-h-[100px] items-start opacity-60 cursor-not-allowed">
                <div class="w-16 h-16 shrink-0">
                    <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/contact-us/icon-payments._CB423447139_.png" class="w-full h-full object-contain">
                </div>
                <div class="flex flex-col">
                    <h2 class="font-bold text-neutral-800 text-base group-hover:text-primary transition-colors">{{ ts.t('account.payments') }}</h2>
                    <p class="text-xs text-neutral-500 leading-normal mt-1">Manage payment methods and settings</p>
                </div>
            </a>

            <!-- Trust Score & BNPL -->
            <a routerLink="/bnpl" class="account-card group flex gap-4 p-5 bg-white border-primary/20 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all duration-200 cursor-pointer shadow-sm min-h-[100px] items-start">
                <div class="w-16 h-16 shrink-0 flex items-center justify-center bg-white rounded-full">
                    <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <div class="flex flex-col">
                    <h2 class="font-bold text-primary text-base group-hover:text-primary-dark transition-colors">Trust & Credit</h2>
                    <p class="text-xs text-neutral-500 leading-normal mt-1">View your Chommie Trust Score and BNPL credit limits</p>
                </div>
            </a>

            <!-- Gift Cards -->
            <a routerLink="/gift-cards" class="account-card group flex gap-4 p-5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 cursor-pointer shadow-sm min-h-[100px] items-start">
                <div class="w-16 h-16 shrink-0">
                    <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/help/images/gateway/gift-card._CB659979736_.png" class="w-full h-full object-contain">
                </div>
                <div class="flex flex-col">
                    <h2 class="font-bold text-neutral-800 text-base group-hover:text-primary transition-colors">Gift Cards</h2>
                    <p class="text-xs text-neutral-500 leading-normal mt-1">View balance or redeem a card</p>
                </div>
            </a>

            <!-- Message Center -->
            <a routerLink="/messages" class="account-card group flex gap-4 p-5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 cursor-pointer shadow-sm min-h-[100px] items-start">
                <div class="w-16 h-16 shrink-0 flex items-center justify-center bg-neutral-100 rounded-full">
                    <svg class="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div class="flex flex-col">
                    <h2 class="font-bold text-neutral-800 text-base group-hover:text-primary transition-colors">Your Messages</h2>
                    <p class="text-xs text-neutral-500 leading-normal mt-1">View messages from Chommie and sellers</p>
                </div>
            </a>

            <!-- Customer Service -->
            <a routerLink="/help" class="account-card group flex gap-4 p-5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200 cursor-pointer shadow-sm min-h-[100px] items-start">
                <div class="w-16 h-16 shrink-0 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <div class="flex flex-col">
                    <h2 class="font-bold text-neutral-800 text-base group-hover:text-primary transition-colors">Customer Service</h2>
                    <p class="text-xs text-neutral-500 leading-normal mt-1">Browse help topics or contact us</p>
                </div>
            </a>
        </div>

        <div class="mt-16 h-px bg-neutral-200"></div>

        <!-- Lists & More -->
        <div class="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
             <div class="space-y-4">
                 <h3 class="font-bold text-lg text-neutral-800 border-b border-neutral-100 pb-2">Ordering and shopping</h3>
                 <ul class="space-y-2 text-sm text-primary">
                     <li><a routerLink="/wishlist" class="hover:underline hover:text-action transition-colors">Your Lists</a></li>
                     <li><a href="#" class="hover:underline hover:text-action transition-colors">Your Subscribe & Save</a></li>
                     <li><a href="#" class="hover:underline hover:text-action transition-colors">Your Recommendations</a></li>
                     <li><a href="#" class="hover:underline hover:text-action transition-colors">Shop the Chommie Outlet</a></li>
                 </ul>
             </div>
             
             <div class="space-y-4">
                 <h3 class="font-bold text-lg text-neutral-800 border-b border-neutral-100 pb-2">Account settings</h3>
                 <ul class="space-y-2 text-sm text-primary">
                     <li><a href="#" class="hover:underline hover:text-action transition-colors">Manage your profile</a></li>
                     <li><a href="#" class="hover:underline hover:text-action transition-colors">Login with Social Identity</a></li>
                     <li><a (click)="logout()" class="hover:underline hover:text-red-600 cursor-pointer transition-colors">Sign Out</a></li>
                 </ul>
             </div>

             <div class="space-y-4">
                 <h3 class="font-bold text-lg text-neutral-800 border-b border-neutral-100 pb-2">Business & Selling</h3>
                 <ul class="space-y-2 text-sm text-primary">
                     <li><a routerLink="/sell" class="hover:underline hover:text-action transition-colors font-bold">Register as a Vendor</a></li>
                     <li><a href="#" class="hover:underline hover:text-action transition-colors">Chommie Business</a></li>
                 </ul>
             </div>
        </div>
      </div>
    </div>
  `
})
export class AccountComponent implements OnInit {
  constructor(
    private authService: AuthService, 
    public ts: TranslationService,
    public deviceService: DeviceService
  ) {}

  ngOnInit() {}

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    window.location.href = '/login';
  }
}