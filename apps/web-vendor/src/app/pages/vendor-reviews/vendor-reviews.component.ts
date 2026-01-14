import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-vendor-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-deep-ocean text-white pb-32">
      <!-- Nexus Header (Glass) -->
      <nav class="glass-header px-8 py-4 flex justify-between items-center z-50 sticky top-0 border-white/5">
          <div class="flex items-center gap-8">
              <a routerLink="/dashboard" class="font-header font-black text-2xl tracking-tighter text-white group">
                Chommie<span class="text-accent text-neon">.nexus</span>
              </a>
              <div class="h-6 w-px bg-white/10 hidden md:block"></div>
              <span class="text-[10px] font-black uppercase tracking-widest text-cyber-lime">Signal Feedback</span>
          </div>
          <div class="flex items-center gap-6">
              <a routerLink="/dashboard" class="text-[10px] font-black uppercase tracking-widest text-neutral-silver/40 hover:text-white transition-colors">Return to Center</a>
          </div>
      </nav>

      <div class="p-10 max-w-5xl mx-auto space-y-12 animate-fade-in">
        <div class="mb-16">
           <h1 class="text-4xl md:text-6xl font-header font-black tracking-tighter mb-2 uppercase text-white">Community <span class="text-cyber-lime text-neon">Echoes</span></h1>
           <p class="text-neutral-silver/40 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-cyber-teal animate-pulse"></span>
              Identity Verification Active
           </p>
        </div>

        <div *ngIf="loading()" class="py-32 flex flex-col items-center justify-center gap-6">
             <div class="w-16 h-16 border-4 border-white/5 border-t-cyber-lime rounded-full animate-spin shadow-[0_0_20px_rgba(204,255,0,0.2)]"></div>
             <span class="text-[10px] font-black uppercase tracking-widest text-neutral-silver/40">Synchronizing Echo Matrix...</span>
        </div>

        <div *ngIf="!loading() && reviews().length === 0" class="glass-panel rounded-[3rem] py-32 text-center border-dashed border-white/10 shadow-2xl">
             <p class="text-neutral-silver/40 font-black uppercase tracking-widest italic">No signal echoes captured in current cycle.</p>
        </div>

        <div *ngIf="!loading() && reviews().length > 0" class="space-y-10">
             <div *ngFor="let review of reviews()" class="glass-panel rounded-[3rem] p-10 border-white/5 relative group transition-all duration-500 hover:border-cyber-lime/30 shadow-2xl">
                 <div class="flex flex-col md:flex-row gap-10">
                     <!-- Product Visual Relay -->
                     <div class="w-32 flex-shrink-0 space-y-4">
                         <div class="aspect-square glass-panel rounded-2xl flex items-center justify-center p-4 relative overflow-hidden bg-white/5 group-hover:border-white/20 transition-all">
                            <img [src]="review.productImage || 'assets/placeholder.png'" class="max-w-full max-h-full object-contain filter drop-shadow-xl group-hover:scale-110 transition-transform duration-700">
                         </div>
                         <div class="text-[8px] font-black text-neutral-silver/40 uppercase tracking-widest leading-tight text-center line-clamp-2 px-2">{{ review.productName }}</div>
                     </div>

                     <!-- Echo Data -->
                     <div class="flex-grow space-y-6">
                         <div class="flex flex-col md:flex-row justify-between items-start gap-6">
                             <div class="space-y-2">
                                 <div class="flex items-center gap-4">
                                     <div class="flex text-cyber-lime text-base shadow-cyber-lime/20">
                                         <span *ngFor="let s of [1,2,3,4,5]">{{ s <= review.rating ? '★' : '☆' }}</span>
                                     </div>
                                     <span class="text-[10px] font-black text-white uppercase tracking-widest">Magnitude {{ review.rating }}.0</span>
                                 </div>
                                 <div class="text-[9px] font-bold text-neutral-silver/40 uppercase tracking-widest flex items-center gap-3">
                                     <span>Source: {{ review.userName }}</span>
                                     <span class="w-1 h-1 rounded-full bg-white/10"></span>
                                     <span *ngIf="review.verified" class="text-accent font-black">VERIFIED_TRANSMISSION</span>
                                     <span class="w-1 h-1 rounded-full bg-white/10"></span>
                                     <span>{{ review.createdAt | date:'MMM d, yyyy' }}</span>
                                 </div>
                             </div>
                             
                             <button class="btn-secondary py-2 px-6 rounded-xl text-[8px] font-black uppercase tracking-widest">
                                 Relay Comms
                             </button>
                         </div>

                         <p class="text-neutral-silver/80 text-sm font-medium leading-relaxed italic uppercase tracking-tight">"{{ review.comment }}"</p>

                         <!-- Visual Arrays -->
                         <div class="flex gap-4" *ngIf="review.images?.length">
                            <div *ngFor="let img of review.images" class="w-20 h-20 glass-panel rounded-xl overflow-hidden border-white/10 hover:border-cyber-lime/30 transition-all cursor-pointer">
                               <img [src]="img" class="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-700">
                            </div>
                         </div>
                         
                         <!-- Response Terminal -->
                         <div class="mt-8 pt-8 border-t border-white/5">
                             <div class="relative group/input">
                                <div class="absolute -inset-0.5 bg-gradient-to-r from-cyber-lime to-primary rounded-xl opacity-0 group-focus-within/input:opacity-100 blur transition duration-300"></div>
                                <div class="relative flex items-center bg-deep-ocean rounded-xl overflow-hidden border border-white/10">
                                   <input type="text" placeholder="POST PUBLIC ECHO RESPONSE..." class="bg-transparent px-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] outline-none flex-grow placeholder:text-neutral-silver/10">
                                   <button class="px-8 py-4 bg-white/5 hover:bg-cyber-lime hover:text-deep-ocean text-cyber-lime font-black text-[9px] uppercase tracking-widest transition-all">Relay</button>
                                </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>

      </div>
    </div>
  `
})
export class VendorReviewsComponent implements OnInit {
  reviews = signal<any[]>([]);
  loading = signal(true);

  constructor(private vendorService: VendorService) {}

  ngOnInit() {
    this.vendorService.getReviews().subscribe({
        next: (data) => {
            this.reviews.set(data);
            this.loading.set(false);
        },
        error: () => this.loading.set(false)
    });
  }
}
