import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gift-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white min-h-screen">
      <div class="relative h-[400px] bg-[#232F3E] text-white flex items-center justify-center overflow-hidden">
          <div class="text-center z-10 p-4">
              <h1 class="text-5xl font-bold mb-4">Chommie Gift Cards</h1>
              <p class="text-xl mb-8">The perfect gift for everyone.</p>
              <button class="bg-[#FFA41C] hover:bg-[#FF8F00] text-black font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                  Shop Gift Cards
              </button>
          </div>
          <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/giftly.png')]"></div>
      </div>

      <div class="container mx-auto px-4 py-12 max-w-[1200px]">
          <h2 class="text-2xl font-bold mb-6">Popular Designs</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div *ngFor="let i of [1,2,3,4]" class="aspect-[1.6] bg-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden relative group">
                  <div class="absolute inset-0 bg-gradient-to-br from-primary to-action opacity-80"></div>
                  <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-white font-bold text-xl drop-shadow-md">Happy Birthday</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  `
})
export class GiftCardsComponent {}
