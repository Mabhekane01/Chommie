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
      <div class="absolute inset-0 bg-black/60 transition-opacity" (click)="close.emit()"></div>
      
      <!-- Menu (Amazon Style) -->
      <div class="relative w-80 md:w-[365px] bg-white h-full shadow-2xl flex flex-col animate-slide-right overflow-hidden">
        
        <!-- Header: User Identity (Amazon Blue Header) -->
        <div class="bg-[#1B4332] p-4 flex items-center gap-3 font-bold text-white shadow-md">
            <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <h2 class="text-lg tracking-tight">Hello, {{ userName() || ts.t('nav.signin') }}</h2>
        </div>

        <!-- Content Area -->
        <div class="overflow-y-auto flex-grow scrollbar-hide py-4">
            
            <!-- Sector: Trending -->
            <div class="border-b border-neutral-200 pb-4 mb-4">
                <h3 class="px-8 py-2 font-bold text-lg text-[#222222]">
                   {{ ts.t('sidebar.trending') }}
                </h3>
                <ul class="text-sm text-neutral-700 font-medium">
                    <li><a routerLink="/products" [queryParams]="{category: 'Electronics'}" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 flex justify-between items-center transition-colors">{{ ts.t('sidebar.best_sellers') }} <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></li>
                    <li><a routerLink="/products" [queryParams]="{deals: true}" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 flex justify-between items-center transition-colors">{{ ts.t('sidebar.new_releases') }} <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></li>
                    <li><a routerLink="/products" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 flex justify-between items-center transition-colors">Movers & Shakers <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></li>
                </ul>
            </div>

            <!-- Sector: Departments -->
            <div class="border-b border-neutral-200 pb-4 mb-4">
                <h3 class="px-8 py-2 font-bold text-lg text-[#222222]">
                   {{ ts.t('sidebar.shop_by_dept') }}
                </h3>
                <ul class="text-sm text-neutral-700 font-medium">
                    <li><a routerLink="/products" [queryParams]="{category: 'Electronics'}" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 flex justify-between items-center transition-colors">Electronics <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></li>
                    <li><a routerLink="/products" [queryParams]="{category: 'Home'}" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 flex justify-between items-center transition-colors">Home & Kitchen <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></li>
                    <li><a routerLink="/products" [queryParams]="{category: 'Fashion'}" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 flex justify-between items-center transition-colors">Fashion <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></li>
                    <li><a routerLink="/products" [queryParams]="{category: 'Books'}" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 flex justify-between items-center transition-colors">Books <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></li>
                </ul>
            </div>

            <!-- Sector: Programs -->
            <div class="border-b border-neutral-200 pb-4 mb-4">
                <h3 class="px-8 py-2 font-bold text-lg text-[#222222]">
                   {{ ts.t('sidebar.programs') }}
                </h3>
                <ul class="text-sm text-neutral-700 font-medium">
                    <li><a routerLink="/gift-cards" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 flex justify-between items-center transition-colors">Gift Cards <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></li>
                    <li><a routerLink="/sell" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 flex justify-between items-center transition-colors">{{ ts.t('nav.sell') }} on Chommie <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></li>
                    <li><a routerLink="/bnpl" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 flex justify-between items-center transition-colors font-bold text-primary italic">Chommie BNPL <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a></li>
                </ul>
            </div>

            <!-- Sector: Help -->
            <div class="pb-4">
                <h3 class="px-8 py-2 font-bold text-lg text-[#222222]">
                   {{ ts.t('sidebar.help_settings') }}
                </h3>
                <ul class="text-sm text-neutral-700 font-medium">
                    <li><a routerLink="/account" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 block transition-colors">{{ ts.t('nav.account') }}</a></li>
                    <li><a routerLink="/help" (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 block transition-colors">{{ ts.t('nav.help') }}</a></li>
                    <li *ngIf="userName()"><a (click)="close.emit()" class="px-8 py-3 hover:bg-neutral-100 block transition-colors cursor-pointer text-red-600">{{ ts.t('nav.signout') }}</a></li>
                </ul>
            </div>

        </div>

        <!-- Close Button (Absolute X) -->
        <button (click)="close.emit()" class="absolute left-[380px] md:left-[400px] top-4 text-white hover:text-primary transition-all p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class SidebarComponent {
  @Output() close = new EventEmitter<void>();
  userName = signal(localStorage.getItem('user_name'));

  constructor(public ts: TranslationService) {}
}
