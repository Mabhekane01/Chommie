import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white min-h-screen pb-12">
      <div class="container mx-auto px-4 py-8 max-w-[1000px]">
        <h1 class="text-3xl font-normal text-[#111111] mb-6">Your Account</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Orders -->
            <a routerLink="/orders" class="border border-gray-300 rounded-lg p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div class="w-12 h-12 flex-shrink-0 bg-orange-50 rounded-full flex items-center justify-center">
                    <span class="text-2xl">📦</span>
                </div>
                <div>
                    <h2 class="font-bold text-lg group-hover:underline">Your Orders</h2>
                    <p class="text-sm text-gray-500">Track, return, or buy things again</p>
                </div>
            </a>

            <!-- Login & Security -->
            <a routerLink="/account/security" class="border border-gray-300 rounded-lg p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div class="w-12 h-12 flex-shrink-0 bg-orange-50 rounded-full flex items-center justify-center">
                    <span class="text-2xl">🔒</span>
                </div>
                <div>
                    <h2 class="font-bold text-lg group-hover:underline">Login & security</h2>
                    <p class="text-sm text-gray-500">Edit name, email, and password</p>
                </div>
            </a>

            <!-- Addresses -->
            <a routerLink="/checkout" class="border border-gray-300 rounded-lg p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div class="w-12 h-12 flex-shrink-0 bg-orange-50 rounded-full flex items-center justify-center">
                    <span class="text-2xl">📍</span>
                </div>
                <div>
                    <h2 class="font-bold text-lg group-hover:underline">Your Addresses</h2>
                    <p class="text-sm text-gray-500">Edit addresses for orders</p>
                </div>
            </a>

            <!-- Payment Options -->
            <div class="border border-gray-300 rounded-lg p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer group opacity-75">
                <div class="w-12 h-12 flex-shrink-0 bg-orange-50 rounded-full flex items-center justify-center">
                    <span class="text-2xl">💳</span>
                </div>
                <div>
                    <h2 class="font-bold text-lg group-hover:underline">Your Payments</h2>
                    <p class="text-sm text-gray-500">Manage payment methods and settings</p>
                </div>
            </div>

            <!-- Chommie BNPL -->
            <a routerLink="/bnpl" class="border border-gray-300 rounded-lg p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div class="w-12 h-12 flex-shrink-0 bg-orange-50 rounded-full flex items-center justify-center">
                    <span class="text-2xl">📉</span>
                </div>
                <div>
                    <h2 class="font-bold text-lg group-hover:underline">Chommie BNPL</h2>
                    <p class="text-sm text-gray-500">View credit limit and payment history</p>
                </div>
            </a>

            <!-- Contact Us -->
            <a routerLink="/help" class="border border-gray-300 rounded-lg p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div class="w-12 h-12 flex-shrink-0 bg-orange-50 rounded-full flex items-center justify-center">
                    <span class="text-2xl">🎧</span>
                </div>
                <div>
                    <h2 class="font-bold text-lg group-hover:underline">Contact Us</h2>
                    <p class="text-sm text-gray-500">Contact our customer service</p>
                </div>
            </a>
        </div>

        <hr class="border-gray-200 mb-8">

        <h2 class="text-xl font-bold mb-4">Email alerts, messages, and ads</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div class="border border-gray-300 rounded p-4 text-sm hover:bg-gray-50 cursor-pointer">
                 <span class="font-bold block mb-1">Advertising preferences</span>
                 <span class="text-gray-500">Do not show me interest-based ads</span>
             </div>
             <div class="border border-gray-300 rounded p-4 text-sm hover:bg-gray-50 cursor-pointer">
                 <span class="font-bold block mb-1">Communication preferences</span>
                 <span class="text-gray-500">Select what emails you want to receive</span>
             </div>
        </div>
      </div>
    </div>
  `
})
export class AccountComponent implements OnInit {
  constructor(private authService: AuthService) {}
  ngOnInit() {}
}