import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fixed inset-0 z-[100] flex">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" (click)="close.emit()"></div>
      
      <!-- Menu -->
      <div class="relative w-80 bg-white h-full shadow-2xl flex flex-col animate-slide-right">
        
        <!-- Header -->
        <div class="bg-primary-dark text-white p-4 flex items-center gap-3 font-bold text-lg">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            {{ ts.t('nav.hello') }}, {{ userName() || ts.t('nav.signin') }}
        </div>

        <!-- Content -->
        <div class="overflow-y-auto flex-grow py-4">
            
            <div class="px-6 py-2">
                <h3 class="font-bold text-lg text-[#111111] mb-3">{{ ts.t('sidebar.trending') }}</h3>
                <ul class="space-y-3 text-sm text-gray-700">
                    <li><a routerLink="/products" [queryParams]="{category: 'Electronics'}" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded">{{ ts.t('sidebar.best_sellers') }}</a></li>
                    <li><a routerLink="/products" [queryParams]="{deals: true}" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded">{{ ts.t('sidebar.new_releases') }}</a></li>
                    <li><a routerLink="/products" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded">Movers & Shakers</a></li>
                </ul>
            </div>

            <hr class="my-2 border-gray-200">

            <div class="px-6 py-2">
                <h3 class="font-bold text-lg text-[#111111] mb-3">{{ ts.t('sidebar.shop_by_dept') }}</h3>
                <ul class="space-y-3 text-sm text-gray-700">
                    <li><a routerLink="/products" [queryParams]="{category: 'Electronics'}" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded flex justify-between items-center">Electronics <span class="text-gray-400">›</span></a></li>
                    <li><a routerLink="/products" [queryParams]="{category: 'Home'}" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded flex justify-between items-center">Home & Kitchen <span class="text-gray-400">›</span></a></li>
                    <li><a routerLink="/products" [queryParams]="{category: 'Fashion'}" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded flex justify-between items-center">Fashion <span class="text-gray-400">›</span></a></li>
                    <li><a routerLink="/products" [queryParams]="{category: 'Books'}" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded flex justify-between items-center">Books <span class="text-gray-400">›</span></a></li>
                </ul>
            </div>

            <hr class="my-2 border-gray-200">

            <div class="px-6 py-2">
                <h3 class="font-bold text-lg text-[#111111] mb-3">{{ ts.t('sidebar.programs') }}</h3>
                <ul class="space-y-3 text-sm text-gray-700">
                    <li><a routerLink="/gift-cards" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded">Gift Cards</a></li>
                    <li><a routerLink="/sell" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded">Sell on Chommie</a></li>
                    <li><a routerLink="/bnpl" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded">Chommie BNPL</a></li>
                </ul>
            </div>

            <hr class="my-2 border-gray-200">

            <div class="px-6 py-2">
                <h3 class="font-bold text-lg text-[#111111] mb-3">{{ ts.t('sidebar.help_settings') }}</h3>
                <ul class="space-y-3 text-sm text-gray-700">
                    <li><a routerLink="/help" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded">{{ ts.t('nav.help') }}</a></li>
                    <li><a routerLink="/login" (click)="close.emit()" class="hover:bg-gray-100 block py-2 -mx-2 px-2 rounded">{{ ts.t('nav.signin') }}</a></li>
                </ul>
            </div>

        </div>
        
        <!-- Close Button -->
        <button (click)="close.emit()" class="absolute -right-10 top-2 text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  `]
})
export class SidebarComponent {
  @Output() close = new EventEmitter<void>();
  userName = signal(localStorage.getItem('user_name'));

  constructor(public ts: TranslationService) {}
}