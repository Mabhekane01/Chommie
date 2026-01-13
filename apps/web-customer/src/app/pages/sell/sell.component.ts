import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white min-h-screen">
      <!-- Hero -->
      <div class="bg-gray-100 py-20">
          <div class="container mx-auto px-4 max-w-[1000px] flex flex-col md:flex-row items-center gap-12">
              <div class="md:w-1/2">
                  <h1 class="text-4xl font-bold text-[#111111] mb-6">Become a Chommie Seller</h1>
                  <p class="text-lg text-gray-600 mb-8">Reach millions of customers. Grow your business with Chommie's world-class logistics and tools.</p>
                  <div class="flex gap-4">
                      <a href="http://localhost:4201/register" class="bg-[#F0C14B] border border-[#a88734] hover:bg-[#F4D078] text-[#111111] font-bold py-3 px-8 rounded-[20px] shadow-sm text-center">Sign Up</a>
                      <a href="http://localhost:4201/login" class="bg-white border border-gray-300 hover:bg-gray-50 text-[#111111] font-bold py-3 px-8 rounded-[20px] shadow-sm text-center">Login</a>
                  </div>
              </div>
              <div class="md:w-1/2">
                  <div class="bg-white p-8 rounded-lg shadow-xl border-t-8 border-primary">
                      <h3 class="text-2xl font-bold mb-4">Start selling today</h3>
                      <ul class="space-y-3 text-gray-700">
                          <li class="flex items-center gap-2">✅ No listing fees</li>
                          <li class="flex items-center gap-2">✅ Secure payments</li>
                          <li class="flex items-center gap-2">✅ Vendor Analytics Dashboard</li>
                          <li class="flex items-center gap-2">✅ Access to BNPL customers</li>
                      </ul>
                      <div class="mt-6 text-center">
                          <span class="text-3xl font-bold text-[#B12704]">R299</span> <span class="text-gray-500">/ month + selling fees</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  `
})
export class SellComponent {}
