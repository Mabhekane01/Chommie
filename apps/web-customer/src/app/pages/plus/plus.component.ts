import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-plus',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32">
      
      <!-- Premium Hero Section -->
      <section class="relative h-[600px] bg-[#131921] flex items-center overflow-hidden">
         <!-- Abstract Background Nodes -->
         <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96 animate-pulse"></div>
         <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>
         
         <div class="max-w-[1200px] mx-auto px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div class="space-y-8">
               <div class="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full">
                  <span class="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                  <span class="text-xs font-black uppercase tracking-[0.3em] text-primary">Nexus Priority Protocol</span>
               </div>
               
               <h1 class="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none italic">
                  Chommie <span class="text-primary underline decoration-8 underline-offset-12">Plus</span>
               </h1>
               
               <p class="text-xl text-neutral-400 font-medium leading-relaxed max-w-lg">
                  The ultimate shopping upgrade. Experience zero-latency logistics, exclusive asset access, and accelerated trust accumulation.
               </p>

               <div class="flex flex-col sm:flex-row items-center gap-6 pt-4">
                  <div *ngIf="authService.isPlusMember()" class="flex flex-col gap-2">
                     <span class="text-emerald-400 font-black uppercase tracking-widest flex items-center gap-2">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                        Membership Active
                     </span>
                     <button routerLink="/" class="text-white border border-white/20 px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/5 transition-all">Go to Shop</button>
                  </div>

                  <ng-container *ngIf="!authService.isPlusMember()">
                    <button (click)="activatePlus()" [disabled]="loading()" class="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-12 py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                        {{ loading() ? 'Processing...' : 'Start 30-Day Free Trial' }}
                    </button>
                    <div class="text-sm font-black uppercase tracking-widest text-neutral-500 italic">
                        Then R99/cycle • Cancel anytime
                    </div>
                  </ng-container>
               </div>
            </div>

            <!-- 3D-like Member Card -->
            <div class="hidden lg:block relative group perspective-1000">
               <div class="w-full aspect-[1.6/1] bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden transform rotate-y-12 group-hover:rotate-y-0 transition-transform duration-1000">
                  <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                  
                  <!-- Card Chip -->
                  <div class="absolute top-12 left-12 w-16 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-inner flex items-center justify-center overflow-hidden">
                     <div class="grid grid-cols-2 gap-px opacity-30">
                        <div class="w-4 h-4 border-r border-b border-black"></div>
                        <div class="w-4 h-4 border-b border-black"></div>
                        <div class="w-4 h-4 border-r border-black"></div>
                        <div class="w-4 h-4 border-black"></div>
                     </div>
                  </div>

                  <!-- Plus Logo -->
                  <div class="absolute bottom-12 right-12 text-6xl font-black text-white/10">C+</div>
                  
                  <div class="absolute bottom-12 left-12">
                     <div class="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1">Authenticated Holder</div>
                     <div class="text-2xl font-black text-white uppercase tracking-widest italic">Nexus Voyager</div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <!-- Benefit Matrix -->
      <section class="py-32 max-w-[1200px] mx-auto px-8">
         <div class="text-center space-y-4 mb-20">
            <h2 class="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Advantage Matrix</h2>
            <h3 class="text-4xl font-black text-neutral-charcoal tracking-tighter uppercase italic">Why join the Plus protocol?</h3>
         </div>

         <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Delivery -->
            <div class="p-10 bg-neutral-50 rounded-[2.5rem] border border-neutral-200 space-y-6 hover:shadow-xl transition-all group">
               <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-neutral-100 group-hover:scale-110 transition-transform">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
               </div>
               <h4 class="text-xl font-black uppercase italic tracking-tighter">Instant Logistics</h4>
               <p class="text-neutral-500 font-medium leading-relaxed">Zero-cost shipping on every single asset transmission. No minimum requirements. Just speed.</p>
            </div>

            <!-- Content -->
            <div class="p-10 bg-[#131921] text-white rounded-[2.5rem] border border-white/10 space-y-6 hover:shadow-2xl transition-all group scale-105 shadow-xl relative z-10">
               <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
               </div>
               <h4 class="text-xl font-black uppercase italic tracking-tighter text-primary">Nexus Entertainment</h4>
               <p class="text-neutral-400 font-medium leading-relaxed">Stream thousands of digital signals, exclusive movies, and sonic archives at no additional credit cost.</p>
            </div>

            <!-- Trust -->
            <div class="p-10 bg-neutral-50 rounded-[2.5rem] border border-neutral-200 space-y-6 hover:shadow-xl transition-all group">
               <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-neutral-100 group-hover:scale-110 transition-transform">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
               </div>
               <h4 class="text-xl font-black uppercase italic tracking-tighter">Trust Multiplier</h4>
               <p class="text-neutral-500 font-medium leading-relaxed">Earn Chommie Coins 2x faster. Accelerate your credit limit growth and unlock premium tiers in half the time.</p>
            </div>
         </div>
      </section>

      <!-- CTA Footer -->
      <section class="bg-[#FAF3E1] py-24">
         <div class="max-w-[800px] mx-auto text-center px-8 space-y-10">
            <h2 class="text-5xl font-black text-neutral-charcoal tracking-tighter leading-tight italic">Ready to synchronize your shopping with the <span class="text-primary">Next Generation</span>?</h2>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
               <button *ngIf="!authService.isPlusMember()" (click)="activatePlus()" [disabled]="loading()" class="bg-primary text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Start Your Free Trial</button>
               <button *ngIf="authService.isPlusMember()" routerLink="/" class="bg-primary text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Keep Shopping</button>
               <button class="bg-white border-2 border-neutral-200 text-neutral-600 px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-neutral-50 transition-all">View All Plans</button>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400">Cancel any time. Terms and conditions of the Nexus Protocol apply.</p>
         </div>
      </section>
    </div>
  `,
  styles: [
    `
    :host { display: block; }
    .perspective-1000 { perspective: 1000px; }
    .rotate-y-12 { transform: rotateY(12deg); }
    .group:hover .group-hover\:rotate-y-0 { transform: rotateY(0deg); }
  `
  ]
})
export class PlusComponent {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  public authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);

  activatePlus() {
    if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/plus' } });
        return;
    }

    this.loading.set(true);
    // Simulate API call for subscription initiation
    setTimeout(() => {
        this.authService.setPlusMember(true);
        this.loading.set(false);
        alert('Welcome to Chommie Plus! Your priority benefits are now active.');
        this.router.navigate(['/']);
    }, 1500);
  }
}
