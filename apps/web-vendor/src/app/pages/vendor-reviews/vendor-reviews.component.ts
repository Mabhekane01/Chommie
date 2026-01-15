import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-vendor-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE REVIEWS UI -->
        <div class="p-4 space-y-6 animate-fade-in">
           <div class="flex justify-between items-center pt-2">
              <h1 class="text-xl font-bold">Feedback</h1>
              <div class="flex items-center gap-1 bg-white px-3 py-1.5 rounded-md border border-neutral-300 shadow-sm">
                 <span class="text-[9px] font-bold text-neutral-400">Sort</span>
                 <select class="text-[9px] font-bold text-primary bg-transparent border-0 outline-none uppercase">
                    <option>Recent</option>
                    <option>Rating</option>
                 </select>
              </div>
           </div>

           <div *ngIf="loading()" class="py-20 flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>

           <div *ngIf="!loading() && filteredReviews().length === 0" class="bg-white p-10 text-center rounded-lg border border-neutral-300 shadow-sm">
              <p class="text-neutral-400 text-sm font-bold uppercase tracking-widest">No feedback yet.</p>
           </div>

           <div class="space-y-4">
              <div *ngFor="let review of filteredReviews()" class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <div class="flex gap-3 items-center">
                    <div class="w-12 h-12 bg-neutral-50 rounded-md p-1 flex items-center justify-center shrink-0 border border-neutral-200">
                       <img [src]="review.productImage" class="max-w-full max-h-full object-contain mix-blend-multiply">
                    </div>
                    <div class="flex-grow">
                       <h3 class="text-[10px] font-bold text-neutral-400 uppercase line-clamp-1">{{ review.productName }}</h3>
                       <div class="flex text-amber-500 text-[10px]">
                          <span *ngFor="let s of [1,2,3,4,5]">{{ s <= review.rating ? '★' : '☆' }}</span>
                       </div>
                    </div>
                 </div>

                 <p class="text-sm font-medium text-neutral-700 leading-relaxed italic">"{{ review.comment }}"</p>

                 <!-- Existing Response -->
                 <div *ngIf="review.vendorResponse" class="bg-neutral-50 p-3 rounded border-l-2 border-primary text-xs italic">
                    <span class="font-bold text-neutral-500 block mb-1">Your Response:</span>
                    "{{ review.vendorResponse }}"
                 </div>

                 <div class="flex justify-between items-center pt-3 border-t border-neutral-100">
                    <div class="text-[9px] font-bold text-neutral-400 uppercase">By {{ review.userName }} • {{ review.createdAt | date:'shortDate' }}</div>
                    <button *ngIf="!review.vendorResponse" (click)="review.showReply = !review.showReply" class="text-[9px] font-black text-primary uppercase tracking-widest">Reply</button>
                 </div>

                 <!-- Response Input -->
                 <div *ngIf="review.showReply" class="space-y-2 animate-fade-in">
                    <textarea [(ngModel)]="review.tempResponse" placeholder="Your response..." class="w-full text-xs p-3 border border-neutral-300 rounded-md focus:border-primary outline-none"></textarea>
                    <button (click)="submitResponse(review)" [disabled]="!review.tempResponse?.trim()" class="w-full py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded">Send Response</button>
                 </div>
              </div>
           </div>
        </div>
      } @else {
        <!-- DESKTOP REVIEWS UI -->
        <div class="p-8 max-w-[1200px] mx-auto space-y-8 animate-fade-in">
          <div class="flex justify-between items-end border-b border-neutral-200 pb-6">
             <div>
                <h1 class="text-3xl font-header font-bold text-neutral-charcoal tracking-tight">Customer Feedback</h1>
                <p class="text-sm text-neutral-500 mt-1 font-medium uppercase tracking-widest">Manage your customer reviews</p>
             </div>
             
             <div class="flex gap-4 bg-white p-2 rounded-md border border-neutral-300 shadow-sm">
                 <button (click)="filter.set('all')" [class.bg-primary]="filter() === 'all'" [class.text-white]="filter() === 'all'" class="px-6 py-2 rounded shadow-sm text-[10px] font-bold uppercase tracking-widest transition-all">All Reviews</button>
                 <button (click)="filter.set('pending')" [class.bg-primary]="filter() === 'pending'" [class.text-white]="filter() === 'pending'" class="px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all">Needs Response</button>
             </div>
          </div>

          <div *ngIf="loading()" class="py-32 flex justify-center">
               <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          </div>

          <div *ngIf="!loading() && filteredReviews().length === 0" class="py-40 text-center bg-white rounded-lg border border-neutral-300 shadow-sm">
             <div class="max-w-xs mx-auto space-y-4">
                <div class="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-300">
                   <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
                <h3 class="text-lg font-bold text-neutral-800">No feedback found</h3>
                <p class="text-sm text-neutral-500">Try changing your filters or check back later.</p>
             </div>
          </div>

          <div *ngIf="!loading() && filteredReviews().length > 0" class="space-y-8">
             <div *ngFor="let review of filteredReviews()" class="bg-white border border-neutral-300 rounded-lg p-10 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                 <div class="absolute top-0 left-0 w-1 h-full transition-all"
                      [ngClass]="review.rating >= 4 ? 'bg-emerald-500' : (review.rating <= 2 ? 'bg-red-500' : 'bg-amber-500')"></div>
                 
                 <div class="flex gap-12">
                     <!-- Product Info -->
                     <div class="w-40 shrink-0 space-y-4">
                         <div class="aspect-square bg-white border border-neutral-200 rounded-md flex items-center justify-center p-4 shadow-inner group-hover:border-primary/20 transition-all">
                            <img [src]="review.productImage" class="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110">
                         </div>
                         <div class="text-[10px] font-bold text-neutral-400 uppercase text-center leading-tight line-clamp-2 px-2 h-8">{{ review.productName }}</div>
                     </div>

                     <!-- Review Content -->
                     <div class="flex-grow space-y-6">
                         <div class="flex justify-between items-start">
                             <div class="space-y-2">
                                 <div class="flex items-center gap-4">
                                     <div class="flex text-amber-500 text-lg">
                                         <span *ngFor="let s of [1,2,3,4,5]">{{ s <= review.rating ? '★' : '☆' }}</span>
                                     </div>
                                     <span class="text-[10px] font-bold text-neutral-800 uppercase tracking-widest bg-neutral-50 px-3 py-1 rounded-md border border-neutral-200">{{ review.rating }} Stars</span>
                                 </div>
                                 <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-4">
                                     <span class="flex items-center gap-1.5"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> {{ review.userName }}</span>
                                     <span class="w-1 h-1 rounded-full bg-neutral-300"></span>
                                     <span *ngIf="review.verified" class="text-orange-700 font-black flex items-center gap-1">
                                        Verified Purchase
                                     </span>
                                     <span class="w-1 h-1 rounded-full bg-neutral-300"></span>
                                     <span>{{ review.createdAt | date:'mediumDate' }}</span>
                                 </div>
                             </div>
                             
                             <button class="bg-white border border-neutral-300 text-neutral-400 hover:text-primary hover:border-primary/20 px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                                 Report Review
                             </button>
                         </div>

                         <p class="text-lg font-medium text-neutral-700 leading-relaxed italic tracking-tight">"{{ review.comment }}"</p>

                         <!-- Review Photos -->
                         <div class="flex gap-4" *ngIf="review.images?.length">
                            <div *ngFor="let img of review.images" class="w-24 h-24 bg-white border border-neutral-200 rounded-md overflow-hidden p-1 shadow-sm hover:border-primary/20 transition-all cursor-pointer">
                               <img [src]="img" class="w-full h-full object-cover rounded shadow-inner">
                            </div>
                         </div>

                         <!-- Existing Response -->
                         <div *ngIf="review.vendorResponse" class="mt-6 p-6 bg-neutral-50 border-l-4 border-primary rounded-r-lg shadow-inner animate-fade-in">
                            <div class="flex justify-between items-center mb-3">
                               <span class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Official Vendor Response</span>
                               <span class="text-[9px] font-bold text-neutral-400 uppercase">{{ review.respondedAt | date:'mediumDate' }}</span>
                            </div>
                            <p class="text-neutral-700 font-medium italic">"{{ review.vendorResponse }}"</p>
                         </div>
                         
                         <!-- Response Section -->
                         <div *ngIf="!review.vendorResponse" class="mt-8 pt-8 border-t border-neutral-100 flex gap-4">
                             <div class="flex-grow">
                                <input type="text" [(ngModel)]="review.tempResponse" placeholder="Write a response to this customer..." class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3.5 text-xs font-bold text-neutral-800 outline-none focus:border-primary focus:bg-white transition-all shadow-inner placeholder:text-neutral-300 uppercase tracking-widest">
                             </div>
                             <button (click)="submitResponse(review)" [disabled]="!review.tempResponse?.trim()" class="px-10 py-3.5 bg-[#131921] text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-md shadow-lg active:scale-95 transition-all disabled:opacity-50">Submit Response</button>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class VendorReviewsComponent implements OnInit {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private vendorService = inject(VendorService);

  reviews = signal<any[]>([]);
  loading = signal(true);
  filter = signal<'all' | 'pending'>('all');

  filteredReviews = computed(() => {
    const all = this.reviews();
    if (this.filter() === 'pending') {
        return all.filter(r => !r.vendorResponse);
    }
    return all;
  });

  ngOnInit() {
    console.log('VendorReviewsComponent loaded');
    this.loadReviews();
  }

  loadReviews() {
    this.loading.set(true);
    this.vendorService.getReviews().subscribe({
        next: (data) => {
            this.reviews.set(data.map(r => ({ ...r, showReply: false, tempResponse: '' })));
            this.loading.set(false);
        },
        error: () => this.loading.set(false)
    });
  }

  submitResponse(review: any) {
    if (!review.tempResponse?.trim()) return;

    this.vendorService.respondToReview(review._id, review.tempResponse).subscribe({
        next: (res) => {
            review.vendorResponse = review.tempResponse;
            review.respondedAt = new Date();
            review.showReply = false;
        },
        error: (err) => {
            console.error('Failed to submit response', err);
            alert('Failed to submit response. Please try again.');
        }
    });
  }
}
