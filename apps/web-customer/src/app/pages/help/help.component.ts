import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-50 text-neutral-charcoal pb-32 pt-10">
      <div class="w-full px-6 animate-fade-in">
        <h1 class="text-3xl font-normal mb-8">Hello. What can we help you with?</h1>
           
           <div class="max-w-2xl mx-auto border border-neutral-300 rounded-md p-1 shadow-inner flex items-center bg-white focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
               <div class="pl-3 text-neutral-400">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </div>
               <input type="text" class="w-full px-4 py-2 outline-none text-base" placeholder="Search our help library...">
           </div>

        <div class="mb-12">
            <h2 class="text-xl font-bold text-neutral-800 mb-6 border-b border-neutral-200 pb-2">Some things you can do here</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="border border-neutral-300 rounded-md p-6 flex gap-4 cursor-pointer hover:bg-neutral-50 transition-colors" routerLink="/orders">
                    <div class="w-16 h-16 flex-shrink-0">
                        <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/help/images/gateway/box-2-item._CB659979736_.png" class="w-full h-full object-contain">
                    </div>
                    <div>
                        <h3 class="font-bold text-neutral-800 mb-1">Your Orders</h3>
                        <p class="text-sm text-neutral-600">Track packages</p>
                        <p class="text-sm text-neutral-600">Edit or cancel orders</p>
                    </div>
                </div>

                <div class="border border-neutral-300 rounded-md p-6 flex gap-4 cursor-pointer hover:bg-neutral-50 transition-colors" routerLink="/returns">
                    <div class="w-16 h-16 flex-shrink-0">
                        <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/help/images/gateway/returns-box._CB659979736_.png" class="w-full h-full object-contain">
                    </div>
                    <div>
                        <h3 class="font-bold text-neutral-800 mb-1">Returns & Refunds</h3>
                        <p class="text-sm text-neutral-600">Return items</p>
                        <p class="text-sm text-neutral-600">Print return labels</p>
                    </div>
                </div>

                <div class="border border-neutral-300 rounded-md p-6 flex gap-4 cursor-pointer hover:bg-neutral-50 transition-colors" routerLink="/account">
                    <div class="w-16 h-16 flex-shrink-0">
                        <img src="https://m.media-amazon.com/images/G/01/x-locale/cs/help/images/gateway/account-icon._CB659979736_.png" class="w-full h-full object-contain">
                    </div>
                    <div>
                        <h3 class="font-bold text-neutral-800 mb-1">Account Settings</h3>
                        <p class="text-sm text-neutral-600">Change email or password</p>
                        <p class="text-sm text-neutral-600">Update login information</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="md:col-span-2">
                <h2 class="text-xl font-bold text-neutral-800 mb-4">Browse Help Topics</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <div class="space-y-2">
                        <h3 class="font-bold text-neutral-700 text-sm">Recommended Topics</h3>
                        <ul class="text-sm space-y-1 text-primary">
                            <li><a href="#" class="hover:underline">Where's my stuff?</a></li>
                            <li><a href="#" class="hover:underline">Shipping & Delivery</a></li>
                            <li><a href="#" class="hover:underline">Returns & Replacements</a></li>
                            <li><a href="#" class="hover:underline">Managing Your Account</a></li>
                        </ul>
                    </div>
                    <div class="space-y-2">
                        <h3 class="font-bold text-neutral-700 text-sm">Payment & Pricing</h3>
                        <ul class="text-sm space-y-1 text-primary">
                            <li><a href="#" class="hover:underline">Payment Methods</a></li>
                            <li><a href="#" class="hover:underline">Chommie BNPL</a></li>
                            <li><a href="#" class="hover:underline">Coupons & Promotions</a></li>
                            <li><a href="#" class="hover:underline">Pricing</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="bg-neutral-50 border border-neutral-200 rounded-md p-6 h-fit">
                <h3 class="font-bold text-neutral-800 mb-2">Need more help?</h3>
                <div class="space-y-3">
                    <button class="w-full btn-secondary text-sm py-2 px-4 rounded shadow-sm bg-white text-left pl-4 font-normal">
                        Contact Us
                    </button>
                    <button class="w-full btn-secondary text-sm py-2 px-4 rounded shadow-sm bg-white text-left pl-4 font-normal">
                        Ask the Community
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  `
})
export class HelpComponent {}