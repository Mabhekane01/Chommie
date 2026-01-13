import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white min-h-screen pb-12">
      <div class="container mx-auto px-4 py-8 max-w-[1000px]">
        <h1 class="text-3xl font-normal text-[#111111] mb-6">Hello. What can we help you with?</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div class="border border-gray-300 rounded p-6 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors" routerLink="/orders">
                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#B12704]">📦</div>
                <div>
                    <h3 class="font-bold mb-1">Your Orders</h3>
                    <p class="text-sm text-gray-600">Track packages, edit or cancel orders</p>
                </div>
            </div>
            <div class="border border-gray-300 rounded p-6 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors" routerLink="/orders">
                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#B12704]">↩️</div>
                <div>
                    <h3 class="font-bold mb-1">Returns & Refunds</h3>
                    <p class="text-sm text-gray-600">Return items or check status of a return</p>
                </div>
            </div>
            <div class="border border-gray-300 rounded p-6 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#B12704]">⚙️</div>
                <div>
                    <h3 class="font-bold mb-1">Account Settings</h3>
                    <p class="text-sm text-gray-600">Manage login, addresses, and payment methods</p>
                </div>
            </div>
        </div>

        <h2 class="text-xl font-bold mb-4">Browse Help Topics</h2>
        <div class="bg-gray-50 p-6 rounded border border-gray-200">
            <ul class="space-y-3 text-sm text-amazon-link">
                <li><a href="#" class="hover:underline">Recommended Topics</a></li>
                <li><a href="#" class="hover:underline">Shipping & Delivery</a></li>
                <li><a href="#" class="hover:underline">Returns & Refunds</a></li>
                <li><a href="#" class="hover:underline">Managing Your Account</a></li>
                <li><a href="#" class="hover:underline">Security & Privacy</a></li>
                <li><a href="#" class="hover:underline">Payment, Pricing & Promotions</a></li>
            </ul>
        </div>
      </div>
    </div>
  `
})
export class HelpComponent {}
