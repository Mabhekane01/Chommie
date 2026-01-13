import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-vendor-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[#F0F2F2] min-h-screen">
      <nav class="bg-white border-b border-gray-300 px-6 py-2 flex justify-between items-center shadow-sm">
          <div class="flex items-center gap-4">
              <span class="text-xl font-bold text-primary">Chommie <span class="font-normal text-black text-sm uppercase tracking-wide">Seller Central</span></span>
              <div class="h-6 w-px bg-gray-300"></div>
              <a href="/dashboard" class="text-sm font-bold text-gray-700 hover:text-action">Dashboard</a>
              <span class="text-sm font-bold text-[#E77600]">Customer Reviews</span>
          </div>
      </nav>

      <div class="p-6 max-w-[1200px] mx-auto">
        <h1 class="text-2xl font-normal text-[#111111] mb-6">Customer Reviews</h1>

        <div *ngIf="loading()" class="flex justify-center py-20">
             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-action"></div>
        </div>

        <div *ngIf="!loading() && reviews().length === 0" class="text-center py-20 bg-white rounded border border-gray-200">
             <p class="text-gray-500">No reviews found for your products yet.</p>
        </div>

        <div *ngIf="!loading() && reviews().length > 0" class="space-y-4">
             <div *ngFor="let review of reviews()" class="bg-white p-4 border border-gray-200 rounded-sm">
                 <div class="flex gap-4">
                     <!-- Product Info -->
                     <div class="w-20 flex-shrink-0">
                         <img [src]="review.productImage || 'assets/placeholder.png'" class="w-20 h-20 object-contain border border-gray-200">
                         <div class="text-[10px] mt-1 text-gray-500 line-clamp-2 leading-tight">{{ review.productName }}</div>
                     </div>

                     <!-- Review Content -->
                     <div class="flex-grow">
                         <div class="flex justify-between items-start">
                             <div>
                                 <div class="flex items-center gap-2 mb-1">
                                     <span class="text-yellow-500 text-sm">
                                         <span *ngFor="let s of [1,2,3,4,5]">{{ s <= review.rating ? '★' : '☆' }}</span>
                                     </span>
                                     <span class="font-bold text-sm">{{ review.rating }} out of 5</span>
                                 </div>
                                 <div class="text-xs text-gray-500 mb-2">
                                     by {{ review.userName }} <span *ngIf="review.verified" class="text-[#C45500] font-bold">Verified Purchase</span>
                                     on {{ review.createdAt | date }}
                                 </div>
                             </div>
                             
                             <div class="text-right">
                                 <button class="text-sm border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1 rounded shadow-sm">
                                     Contact Customer
                                 </button>
                             </div>
                         </div>

                         <p class="text-sm text-[#111111] mb-2">{{ review.comment }}</p>

                         <!-- Review Images -->
                         <div class="flex gap-2 mb-3" *ngIf="review.images?.length">
                            <div *ngFor="let img of review.images" class="w-16 h-16 border border-gray-200 rounded overflow-hidden">
                               <img [src]="img" class="w-full h-full object-cover">
                            </div>
                         </div>
                         
                         <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-sm">
                             <input type="text" placeholder="Post a public reply..." class="w-full border border-gray-300 rounded p-1 text-sm focus:border-action outline-none">
                             <div class="text-right mt-2">
                                 <button class="bg-[#F0C14B] border border-[#a88734] rounded-[3px] py-1 px-3 text-xs shadow-sm hover:bg-[#F4D078]">Reply</button>
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
