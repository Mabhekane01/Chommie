import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-membership-promo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section *ngIf="!authService.isPlusMember()" class="w-full px-4 py-8 bg-neutral-100">
      <div class="max-w-[1500px] mx-auto bg-white border border-neutral-300 rounded-sm overflow-hidden flex flex-col md:flex-row shadow-sm">
        
        <!-- Left: The Visual Ad -->
        <div class="w-full md:w-1/3 bg-[#131921] p-8 flex flex-col justify-center items-center text-white relative">
           <div class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div class="z-10 text-center space-y-4">
              <div class="inline-block border-2 border-primary px-6 py-2 bg-primary/10">
                 <span class="text-3xl font-black tracking-tighter italic">PLUS</span>
              </div>
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">Member Benefits</p>
           </div>
        </div>

        <!-- Center: The Content -->
        <div class="flex-grow p-8 border-r border-neutral-200">
           <h2 class="text-2xl font-bold text-neutral-800 mb-2">Upgrade to Chommie Plus for exclusive benefits</h2>
           <p class="text-sm text-neutral-600 mb-6 leading-relaxed max-w-2xl">
              Enjoy FREE delivery on millions of eligible items, early access to top deals, and earn double Trust Coins on every purchase to increase your credit limit faster.
           </p>
           
           <div class="flex flex-wrap gap-8">
              <div class="flex items-center gap-3">
                 <div class="w-10 h-10 bg-neutral-100 rounded-sm flex items-center justify-center border border-neutral-200">
                    <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                 </div>
                 <div>
                    <span class="block text-xs font-bold text-neutral-800 uppercase">Free Delivery</span>
                    <span class="text-[10px] text-neutral-500 font-medium uppercase">No minimum spend</span>
                 </div>
              </div>
              <div class="flex items-center gap-3">
                 <div class="w-10 h-10 bg-neutral-100 rounded-sm flex items-center justify-center border border-neutral-200">
                    <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                    <span class="block text-xs font-bold text-neutral-800 uppercase">Trust Bonus</span>
                    <span class="text-[10px] text-neutral-500 font-medium uppercase">Earn Coins 2x Faster</span>
                 </div>
              </div>
           </div>
        </div>

        <!-- Right: CTA -->
        <div class="w-full md:w-64 bg-neutral-50 p-8 flex flex-col justify-center gap-4">
           <div class="text-center">
              <span class="text-sm font-bold text-neutral-700">R99 / month</span>
              <p class="text-[10px] text-neutral-500 italic mt-1">First 30 days free</p>
           </div>
           <button (click)="subscribe()" 
                   [disabled]="loading()"
                   class="w-full bg-primary hover:bg-[#E67A00] text-white py-2.5 rounded-sm shadow-sm font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50">
              {{ loading() ? 'Loading...' : 'Join Chommie Plus' }}
           </button>
        </div>
      </div>
    </section>

    <!-- Success Feedback Overlay -->
    <div *ngIf="showSuccess()" class="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
       <div class="max-w-sm w-full bg-white rounded-sm p-10 text-center space-y-6 shadow-2xl border border-neutral-300">
          <div class="w-16 h-16 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white shadow-lg">
             <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-neutral-800">Welcome to Chommie Plus</h3>
          <p class="text-sm text-neutral-600">Your account now has active Plus benefits. Enjoy your shopping!</p>
          <button (click)="showSuccess.set(false)" class="w-full btn-primary py-2.5 rounded-sm font-bold uppercase text-xs tracking-widest shadow-sm">
             Start Shopping
          </button>
       </div>
    </div>
  `
})
export class MembershipPromoComponent {
  authService = inject(AuthService);
  loading = signal(false);
  showSuccess = signal(false);

  subscribe() {
    this.loading.set(true);
    setTimeout(() => {
        this.loading.set(false);
        this.showSuccess.set(true);
        this.authService.isPlusMember.set(true);
        localStorage.setItem('is_plus', 'true');
    }, 1500);
  }
}
