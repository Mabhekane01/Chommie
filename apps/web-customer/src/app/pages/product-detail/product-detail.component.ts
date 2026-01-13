import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-[1500px]" *ngIf="product()">
      <!-- Breadcrumb (Mock) -->
      <div class="text-xs text-gray-500 mb-4">
        <span class="hover:underline cursor-pointer">Products</span> › 
        <span class="hover:underline cursor-pointer">{{ product()!.category }}</span> › 
        <span class="font-bold text-gray-700">{{ product()!.name }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        <!-- Product Image (Col 5) -->
        <div class="md:col-span-5 flex justify-center sticky top-24 h-fit">
            <div class="w-full max-w-[500px] h-[500px] flex items-center justify-center">
              <img *ngIf="product()!.images?.length" [src]="getDisplayImage()" [alt]="product()!.name" class="max-h-full max-w-full object-contain">
              <div *ngIf="!product()!.images?.length" class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
            </div>
        </div>

        <!-- Details (Col 4) -->
        <div class="md:col-span-4 space-y-4">
          <div class="flex flex-wrap gap-2" *ngIf="product()!.badges?.length">
             <div *ngFor="let badge of product()!.badges">
                <div *ngIf="badge === 'AMAZON_CHOICE'" class="bg-[#232F3E] text-white text-[10px] px-2 py-0.5 flex items-center gap-1">
                   <span class="text-[#FF9900]">Chommie's</span> <span>Choice</span>
                </div>
                <div *ngIf="badge === 'BEST_SELLER'" class="bg-[#E47911] text-white text-[10px] px-2 py-0.5 shadow-sm font-bold">
                   #1 Best Seller
                </div>
             </div>
          </div>
          <h1 class="text-2xl font-medium leading-tight text-[#111111]">{{ product()!.name }}</h1>
          
          <div class="flex items-center text-sm">
            <div class="flex text-yellow-500">
               <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product()!.ratings) ? '★' : '☆' }}</span>
            </div>
            <span class="text-amazon-link ml-2 hover:underline cursor-pointer">{{ product()!.ratings | number:'1.1-1' }} out of 5</span>
            <span class="text-gray-300 mx-2">|</span>
            <span class="text-amazon-link hover:underline cursor-pointer">{{ product()!.numReviews }} ratings</span>
          </div>

          <hr class="border-gray-200">

          <div class="bg-[#CC0C39] text-white text-xs font-bold px-2 py-1 inline-block rounded-sm mb-2" *ngIf="product()!.isLightningDeal">
            Lightning Deal
          </div>

          <div class="space-y-2">
            <div class="flex items-start" *ngIf="product()!.isLightningDeal">
                 <span class="text-sm text-gray-500 w-24">Was:</span>
                 <div class="text-sm text-gray-500 line-through">
                    R{{ product()!.price | number:'1.2-2' }}
                 </div>
            </div>
            <div class="flex items-start">
                 <span class="text-sm text-gray-500 w-24">{{ product()!.isLightningDeal ? 'Deal Price:' : 'Price:' }}</span>
                 <div class="text-lg text-[#B12704] font-medium">
                    R{{ getDisplayPrice() | number:'1.2-2' }}
                 </div>
            </div>

            <div *ngIf="product()!.isLightningDeal" class="space-y-2 mt-2">
               <div class="flex items-center gap-2">
                  <div class="w-48 bg-gray-200 h-2 rounded-full overflow-hidden">
                     <div class="bg-[#CC0C39] h-full" [style.width.%]="getClaimedPercentage()"></div>
                  </div>
                  <span class="text-xs text-gray-600">{{ getClaimedPercentage() }}% claimed</span>
               </div>
               <div class="text-xs text-gray-600">
                  Ends in: <span class="font-bold text-[#CC0C39]">{{ timeRemaining() }}</span>
               </div>
            </div>

            <div class="flex items-start">
                 <span class="text-sm text-gray-500 w-24">Description:</span>
                 <p class="text-sm text-[#111111] leading-relaxed">{{ product()!.description }}</p>
            </div>

            <!-- Bulk Pricing Table -->
            <div *ngIf="product()?.bulkPricing?.length" class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-sm">
                <h4 class="text-xs font-bold uppercase text-gray-500 mb-2">Bulk Discounts</h4>
                <div class="grid grid-cols-2 gap-2">
                    <div *ngFor="let tier of product()!.bulkPricing" class="text-xs">
                        <span class="font-bold">{{ tier.minQuantity }}+ units:</span>
                        <span class="text-green-700 ml-1">{{ tier.discountPercentage }}% OFF</span>
                    </div>
                </div>
            </div>
          </div>

          <!-- Variants -->
          <div *ngIf="product()!.variants?.length" class="space-y-4 pt-4">
            <div *ngFor="let variant of product()!.variants" class="space-y-2">
               <h4 class="text-sm font-bold text-gray-700">{{ variant.name }}: <span class="font-normal">{{ selectedVariants()[variant.name] || 'Select' }}</span></h4>
               <div class="flex flex-wrap gap-2">
                  <button 
                    *ngFor="let option of variant.options" 
                    (click)="selectVariant(variant.name, option.value)"
                    class="border px-3 py-1 text-sm rounded-sm transition-all"
                    [ngClass]="selectedVariants()[variant.name] === option.value ? 'border-action ring-1 ring-action bg-orange-50' : 'border-gray-300 hover:border-gray-400'"
                  >
                    {{ option.value }}
                  </button>
               </div>
            </div>
          </div>
        </div>

        <!-- Buy Box (Col 3) -->
        <div class="md:col-span-3">
            <div class="border border-gray-300 rounded-[8px] p-5 shadow-sm bg-white">
                <div class="text-2xl font-medium text-[#B12704] mb-2">
                    R{{ getDisplayPrice() | number:'1.2-2' }}
                </div>
                <div class="text-sm text-gray-600 mb-1" *ngIf="product()!.isLightningDeal">
                    List Price: <span class="line-through">R{{ product()!.price | number:'1.2-2' }}</span>
                </div>
                <div class="text-sm text-gray-600 mb-4">
                    <span class="text-amazon-link">FREE delivery</span> to <span class="font-bold text-black">{{ currentLocation() }}</span>.
                    <br>
                    Arriving <span class="font-bold">Tomorrow, Jan 13</span>.
                </div>
                
                <div class="text-lg text-green-700 font-medium mb-4">In Stock</div>

                <!-- BNPL Installment Widget -->
                <div *ngIf="product()!.bnplEligible" class="mb-6 p-3 border border-primary/20 bg-primary/5 rounded-md">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-bold">CHOMMIE BNPL</span>
                        <span class="text-xs font-bold text-primary">Interest-free</span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between text-xs">
                            <span class="text-gray-600">Pay today:</span>
                            <span class="font-bold">R{{ bnplInstallments().firstPayment | number:'1.2-2' }}</span>
                        </div>
                        <div class="flex justify-between text-xs">
                            <span class="text-gray-600">Pay on {{ bnplInstallments().date | date:'MMM d' }}:</span>
                            <span class="font-bold">R{{ bnplInstallments().secondPayment | number:'1.2-2' }}</span>
                        </div>
                    </div>
                    <div class="mt-2 pt-2 border-t border-primary/10 text-[10px] text-gray-500 italic">
                        No credit checks. Just a valid debit/credit card.
                    </div>
                </div>

                <div class="mb-4">
                  <label class="text-sm block mb-1">Quantity:</label>
                  <select [ngModel]="selectedQuantity()" (ngModelChange)="selectedQuantity.set($event)" class="bg-[#F0F2F2] border border-gray-300 rounded-[8px] text-sm py-1 px-2 focus:ring-1 focus:ring-action outline-none shadow-sm">
                    <option *ngFor="let q of [1,2,3,4,5,6,7,8,9,10]" [value]="q">{{ q }}</option>
                  </select>
                </div>

                <div class="space-y-3">
                    <button (click)="addToCart()" class="w-full bg-action hover:bg-action-hover text-white py-[8px] rounded-[20px] text-sm shadow-sm transition-colors cursor-pointer">
                        Add to Cart
                    </button>
                    <button class="w-full bg-[#FFA41C] hover:bg-[#FF8F00] text-black py-[8px] rounded-[20px] text-sm shadow-sm transition-colors cursor-pointer">
                        Buy Now
                    </button>
                </div>

                <div class="mt-4 text-xs text-gray-500 space-y-1">
                    <div class="grid grid-cols-2">
                        <span>Ships from</span> <span>Chommie</span>
                    </div>
                    <div class="grid grid-cols-2">
                        <span>Sold by</span> <span class="text-amazon-link hover:text-action hover:underline cursor-pointer" [routerLink]="['/sellers', product()!.vendorId]">Visit Seller Profile</span>
                    </div>
                </div>

                <hr class="my-4 border-gray-200">
                
                <button (click)="addToWishlist()" class="w-full text-left text-sm text-amazon-link hover:text-action hover:underline border border-gray-300 rounded-[4px] py-1 px-2 text-center bg-gray-50">
                    Add to Wish List
                </button>
            </div>
        </div>
      </div>

      <!-- Frequently Bought Together -->
      <div class="mb-12 border-t pt-8" *ngIf="frequentlyBought().length > 0">
        <h2 class="text-xl font-bold mb-4 text-[#111111]">Frequently bought together</h2>
        <div class="flex flex-col md:flex-row items-center gap-4">
          <div class="flex items-center gap-4">
            <div class="w-24 h-24">
              <img [src]="product()!.images[0]" class="object-contain h-full w-full">
            </div>
            <span class="text-2xl text-gray-400">+</span>
            <ng-container *ngFor="let p of frequentlyBought(); let last = last">
              <div class="w-24 h-24 cursor-pointer" [routerLink]="['/products', p.id || p._id]">
                <img [src]="p.images[0]" class="object-contain h-full w-full">
              </div>
              <span *ngIf="!last" class="text-2xl text-gray-400">+</span>
            </ng-container>
          </div>
          <div class="md:ml-8">
            <div class="text-sm mb-2">
              <span class="text-gray-600">Total price:</span>
              <span class="text-lg font-bold text-[#B12704] ml-2">R{{ getTotalPrice() | number:'1.2-2' }}</span>
            </div>
            <button (click)="addAllToCart()" class="bg-[#FFA41C] hover:bg-[#FF8F00] text-black px-4 py-1 rounded-md text-sm shadow-sm transition-colors">
              Add all to Cart
            </button>
          </div>
        </div>
        <div class="mt-4 space-y-1">
          <div class="text-sm flex items-center gap-2">
            <input type="checkbox" checked disabled>
            <span class="font-bold">This item:</span> {{ product()!.name }} <span class="text-[#B12704]">R{{ product()!.price | number:'1.2-2' }}</span>
          </div>
          <div *ngFor="let p of frequentlyBought()" class="text-sm flex items-center gap-2">
            <input type="checkbox" checked disabled>
            <span class="text-amazon-link hover:underline cursor-pointer" [routerLink]="['/products', p.id || p._id]">{{ p.name }}</span>
            <span class="text-[#B12704]">R{{ p.price | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div class="mb-12 border-t pt-8" *ngIf="relatedProducts().length > 0">
        <h2 class="text-xl font-bold mb-4 text-[#111111]">Customers who viewed this item also viewed</h2>
        <div class="flex gap-4 overflow-x-auto pb-4">
          <div *ngFor="let p of relatedProducts()" class="min-w-[160px] max-w-[160px] cursor-pointer group" [routerLink]="['/products', p.id || p._id]">
            <div class="h-40 flex items-center justify-center mb-2">
              <img *ngIf="p.images?.length" [src]="p.images[0]" [alt]="p.name" class="max-h-full max-w-full object-contain">
            </div>
            <div class="text-amazon-link text-sm group-hover:underline group-hover:text-action line-clamp-2 mb-1">{{ p.name }}</div>
            <div class="text-yellow-500 text-xs mb-1">★★★★☆ <span class="text-gray-400">(45)</span></div>
            <div class="text-[#B12704] text-sm font-medium">R{{ p.price | number:'1.2-2' }}</div>
          </div>
        </div>
      </div>

      <!-- Compare with similar items -->
      <div class="mb-12 border-t pt-8" *ngIf="comparisonProducts().length > 1">
        <h2 class="text-xl font-bold mb-4 text-[#111111]">Compare with similar items</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-4 px-2 bg-gray-50 w-40 text-left"></th>
                <th *ngFor="let p of comparisonProducts()" class="py-4 px-4 text-center min-w-[200px]">
                  <div class="h-32 flex items-center justify-center mb-2">
                    <img [src]="p.images[0]" class="max-h-full max-w-full object-contain">
                  </div>
                  <div class="text-amazon-link hover:underline cursor-pointer font-normal line-clamp-3 h-12" [routerLink]="['/products', p.id || p._id]">
                    {{ p.name }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-200">
                <td class="py-4 px-2 bg-gray-50 font-bold">Customer Rating</td>
                <td *ngFor="let p of comparisonProducts()" class="py-4 px-4 text-center">
                  <div class="flex justify-center text-yellow-500">
                    <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(p.ratings) ? '★' : '☆' }}</span>
                  </div>
                  <div class="text-xs text-gray-500">({{ p.numReviews }})</div>
                </td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="py-4 px-2 bg-gray-50 font-bold">Price</td>
                <td *ngFor="let p of comparisonProducts()" class="py-4 px-4 text-center text-[#B12704] font-medium">
                  R{{ p.price | number:'1.2-2' }}
                </td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="py-4 px-2 bg-gray-50 font-bold">Sold By</td>
                <td *ngFor="let p of comparisonProducts()" class="py-4 px-4 text-center text-amazon-link">
                  Chommie Retail
                </td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="py-4 px-2 bg-gray-50 font-bold">Category</td>
                <td *ngFor="let p of comparisonProducts()" class="py-4 px-4 text-center">
                  {{ p.category }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customer Questions & Answers -->
      <div class="mb-12 border-t pt-8">
        <h2 class="text-xl font-bold mb-4 text-[#111111]">Customer questions & answers</h2>
        
        <div class="relative mb-6">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
             </div>
             <input type="text" [(ngModel)]="newQuestion" (keyup.enter)="submitQuestion()" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-action sm:text-sm" placeholder="Have a question? Search for answers or ask one">
        </div>

        <div class="space-y-6">
            <div *ngFor="let q of questions()" class="space-y-2">
                <div class="flex gap-4">
                    <div class="w-16 flex-shrink-0">
                        <span class="font-bold text-sm">Question:</span>
                    </div>
                    <div>
                        <span class="font-bold text-sm text-[#111111]">{{ q.text }}</span>
                    </div>
                </div>
                <div *ngIf="q.answers.length > 0">
                    <div *ngFor="let a of q.answers" class="flex gap-4 mb-2">
                        <div class="w-16 flex-shrink-0">
                            <span class="font-bold text-sm">Answer:</span>
                        </div>
                        <div class="text-sm">
                            <span class="leading-relaxed">{{ a.text }}</span>
                            <div class="text-gray-500 text-xs mt-1 flex items-center gap-2">
                                <span *ngIf="a.isVendor" class="bg-gray-100 text-gray-700 px-1 rounded font-bold text-[10px] uppercase">Seller</span>
                                By {{ a.userName }} on {{ a.createdAt | date }}
                            </div>
                        </div>
                    </div>
                </div>
                <div *ngIf="q.answers.length === 0" class="flex gap-4">
                    <div class="w-16 flex-shrink-0">
                        <span class="font-bold text-sm">Answer:</span>
                    </div>
                    <div class="text-sm text-gray-500 italic">No answers yet.</div>
                </div>
            </div>
            
            <div *ngIf="questions().length === 0" class="text-center py-8 text-gray-500 text-sm border border-dashed rounded border-gray-300">
                Be the first to ask a question about this product!
            </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 border-t pt-8">
        <div class="md:col-span-4">
             <h2 class="text-xl font-bold mb-4 text-[#111111]">Customer reviews</h2>
             <!-- Stat bars would go here -->
             <div *ngIf="!userId" class="mb-4">
                 <p class="mb-2 text-sm">Review this product</p>
                 <p class="text-xs text-gray-600 mb-4">Share your thoughts with other customers</p>
                 <a routerLink="/login" class="block w-full border border-gray-300 rounded text-sm py-1 px-4 text-center hover:bg-gray-50">Write a customer review</a>
             </div>
             <div *ngIf="userId" class="p-4 border rounded bg-gray-50">
                 <h3 class="font-bold text-sm mb-2">Write a Review</h3>
                 <div class="flex gap-1 mb-2">
                    <span *ngFor="let star of [1,2,3,4,5]" 
                          (click)="newRating = star"
                          class="cursor-pointer text-xl"
                          [ngClass]="star <= newRating ? 'text-yellow-500' : 'text-gray-300'">★</span>
                  </div>
                  <textarea [(ngModel)]="newComment" rows="3" class="w-full p-2 border rounded text-sm mb-2" placeholder="Write your review..."></textarea>
                  <input [(ngModel)]="newImages" type="text" class="w-full p-2 border rounded text-sm mb-2" placeholder="Image URLs (comma separated)">
                  <button (click)="submitReview()" [disabled]="submitting()" class="w-full bg-white border border-gray-300 shadow-sm text-sm py-1 hover:bg-gray-50">Submit</button>
             </div>
        </div>
        
        <div class="md:col-span-8 space-y-6">
           <div *ngFor="let review of reviews()" class="border-b pb-4 last:border-0">
             <div class="flex items-center gap-2 mb-1">
                 <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">U</div>
                 <span class="text-xs font-medium">{{ review.userName }}</span>
             </div>
             <div class="flex items-center gap-2 mb-2">
                <span class="text-yellow-500 text-sm">
                  <span *ngFor="let s of [1,2,3,4,5]">{{ s <= review.rating ? '★' : '☆' }}</span>
                </span>
                <span *ngIf="review.verified" class="text-xs font-bold text-[#C45500]">Verified Purchase</span>
             </div>
             <span class="text-xs text-gray-500 mb-2 block">Reviewed on {{ review.createdAt | date }}</span>
             <p class="text-sm text-[#111111] mb-2">{{ review.comment }}</p>
             
             <!-- Review Images -->
             <div class="flex gap-2 mb-3" *ngIf="review.images?.length">
                <div *ngFor="let img of review.images" class="w-20 h-20 border border-gray-200 rounded overflow-hidden">
                   <img [src]="img" class="w-full h-full object-cover">
                </div>
             </div>

             <div class="flex items-center gap-4 text-xs text-gray-500">
                <span *ngIf="review.helpfulVotes > 0">{{ review.helpfulVotes }} people found this helpful</span>
                <button (click)="onHelpfulClick(review._id)" class="bg-white border border-gray-300 rounded shadow-sm px-3 py-1 hover:bg-gray-50 text-black">Helpful</button>
                <span class="text-gray-300">|</span>
                <span class="hover:underline cursor-pointer">Report abuse</span>
             </div>
           </div>
           <div *ngIf="reviews().length === 0" class="text-gray-500 text-sm">No reviews yet.</div>
        </div>
      </div>

    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product = signal<any | null>(null);
  reviews = signal<any[]>([]);
  questions = signal<any[]>([]);
  newQuestion = signal('');
  relatedProducts = signal<any[]>([]);
  frequentlyBought = signal<any[]>([]);
  comparisonProducts = signal<any[]>([]);
  userId = localStorage.getItem('user_id');
  newRating = 5;
  newComment = '';
  newImages = ''; // Comma separated URLs for MVP
  submitting = signal(false);
  Math = Math; // Expose Math
  timeRemaining = signal<string>('');
  timerInterval: any;
  selectedVariants = signal<Record<string, string>>({});
  selectedQuantity = signal<number>(1);
  currentLocation = signal(localStorage.getItem('delivery_location') || 'South Africa');

  bnplInstallments = computed(() => {
    const price = this.getDisplayPrice();
    const quantity = this.selectedQuantity();
    const total = price * quantity;
    return {
      firstPayment: total / 2,
      secondPayment: total / 2,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days later
    };
  });

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
        this.loadReviews(id);
        this.loadQuestions(id);
        this.loadRelated(id);
        this.loadFrequentlyBought(id);
        this.loadComparison(id);
        this.addToHistory(id);
      }
    });
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.product()?.dealEndsAt) {
        const now = new Date().getTime();
        const end = new Date(this.product()!.dealEndsAt).getTime();
        const diff = end - now;

        if (diff <= 0) {
          this.timeRemaining.set('Deal ended');
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        this.timeRemaining.set(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
  }

  getClaimedPercentage() {
    if (!this.product()?.lightningDealStock) return 0;
    return Math.min(100, Math.round((this.product()!.lightningDealSold / this.product()!.lightningDealStock) * 100));
  }

  selectVariant(name: string, value: string) {
    this.selectedVariants.update(v => ({ ...v, [name]: value }));
  }

  getDisplayPrice(): number {
    let price = (this.product()!.isLightningDeal ? this.product()!.discountPrice : this.product()!.price) || 0;
    
    // Apply bulk discount if applicable
    if (this.product()?.bulkPricing && this.product()!.bulkPricing.length > 0) {
        const quantity = this.selectedQuantity();
        // Sort tiers by quantity descending
        const tiers = [...this.product()!.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
        const applicableTier = tiers.find(t => quantity >= t.minQuantity);
        if (applicableTier) {
            price = price * (1 - applicableTier.discountPercentage / 100);
        }
    }

    // Add price modifiers from selected variants
    if (this.product()!.variants) {
      this.product()!.variants.forEach((v: any) => {
        const selectedValue = this.selectedVariants()[v.name];
        if (selectedValue) {
          const option = v.options.find((o: any) => o.value === selectedValue);
          if (option?.priceModifier) {
            price += option.priceModifier;
          }
        }
      });
    }
    return price;
  }

  getDisplayImage(): string {
    // If a selected variant has an image, use it
    if (this.product()!.variants) {
      for (const v of this.product()!.variants) {
        const selectedValue = this.selectedVariants()[v.name];
        const option = v.options.find((o: any) => o.value === selectedValue);
        if (option?.image) return option.image;
      }
    }
    return this.product()!.images[0];
  }

  addToHistory(id: string) {
    const history = JSON.parse(localStorage.getItem('recent_history') || '[]');
    const updated = [id, ...history.filter((i: string) => i !== id)].slice(0, 6);
    localStorage.setItem('recent_history', JSON.stringify(updated));
  }

  trackCategoryView(category: string) {
    if (!this.userId) return;
    
    // We update the backend with the user's latest interested category
    // In a real app, this would be more complex (counting views per category)
    this.authService.updateFavoriteCategory(this.userId, category).subscribe();
  }

  loadProduct(id: string) {
    this.productService.getProduct(id).subscribe(p => {
      this.product.set(p);
      this.trackCategoryView(p.category);
      if (p.variants) {
        const defaults: any = {};
        p.variants.forEach((v: any) => {
          if (v.options?.length) {
            defaults[v.name] = v.options[0].value;
          }
        });
        this.selectedVariants.set(defaults);
      }
    });
  }

  loadQuestions(id: string) {
    this.productService.getQuestions(id).subscribe(q => this.questions.set(q));
  }

  submitQuestion() {
    if (!this.userId || !this.newQuestion().trim()) return;
    
    const data = {
        productId: this.product().id || this.product()._id,
        userId: this.userId,
        userName: localStorage.getItem('user_name') || 'Chommie User',
        text: this.newQuestion()
    };

    this.productService.askQuestion(data).subscribe({
        next: (res) => {
            this.questions.update(q => [res, ...q]);
            this.newQuestion.set('');
            alert('Your question has been posted!');
        },
        error: () => alert('Failed to post question')
    });
  }

  loadReviews(id: string) {
    this.productService.getReviews(id).subscribe(r => this.reviews.set(r));
  }

  loadRelated(id: string) {
    this.productService.getRelatedProducts(id).subscribe(rp => this.relatedProducts.set(rp));
  }

  loadFrequentlyBought(id: string) {
    this.productService.getFrequentlyBoughtTogether(id).subscribe(fb => this.frequentlyBought.set(fb));
  }

  loadComparison(id: string) {
    this.productService.getProductComparison(id).subscribe(cp => this.comparisonProducts.set(cp));
  }

  getTotalPrice() {
    let total = this.product()?.price || 0;
    this.frequentlyBought().forEach(p => total += p.price);
    return total;
  }

  addAllToCart() {
    this.addToCart();
    this.frequentlyBought().forEach(p => this.cartService.addToCart(p));
    alert('All items added to cart!');
  }

  addToCart() {
    if (this.product()) {
      const productToCart = {
        ...this.product()!,
        price: this.getDisplayPrice(),
        selectedVariants: this.selectedVariants()
      };
      // We need to update CartService to accept quantity
      this.cartService.addToCart(productToCart, this.selectedQuantity());
      alert('Added to cart!');
    }
  }

  addToWishlist() {
    if (!this.userId) {
        this.router.navigate(['/login']);
        return;
    }
    
    if (this.product()) {
      this.productService.addToWishlist(this.userId, this.product()!.id || this.product()!._id).subscribe({
        next: () => {
            alert('Added to your Wish List');
        },
        error: (err) => console.error('Failed to add to wishlist', err)
      });
    }
  }

  onHelpfulClick(reviewId: string) {
    this.productService.voteHelpful(reviewId).subscribe(() => {
      // Optimistic update
      this.reviews.update(reviews => 
        reviews.map(r => r._id === reviewId ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r)
      );
    });
  }

  submitReview() {
    if (!this.product() || !this.userId) return;
    
    this.submitting.set(true);
    const review = {
      productId: this.product()!.id || this.product()!._id,
      userId: this.userId,
      userName: 'Chommie User',
      rating: this.newRating,
      comment: this.newComment,
      images: this.newImages.split(',').map(s => s.trim()).filter(s => !!s)
    };

    this.productService.addReview(review).subscribe({
      next: (res) => {
        this.reviews.update(r => [res, ...r]);
        this.newComment = '';
        this.newRating = 5;
        this.newImages = '';
        this.submitting.set(false);
        this.loadProduct(this.product()!.id || this.product()!._id);
      },
      error: () => this.submitting.set(false)
    });
  }
}