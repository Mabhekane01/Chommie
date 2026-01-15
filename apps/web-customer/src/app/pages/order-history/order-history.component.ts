import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { TranslationService } from '../../services/translation.service';
import { DeviceService } from '../../services/device.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32" [ngClass]="deviceService.isMobile() ? 'pt-2' : 'pt-10'">
      <div class="w-full animate-fade-in" [ngClass]="deviceService.isMobile() ? 'px-0' : 'px-10'">
        
        @if (deviceService.isMobile()) {
          <!-- MOBILE ORDER HISTORY UI -->
          <div class="flex flex-col">
             <!-- Mobile Search Bar -->
             <div class="p-4 bg-white border-b border-neutral-200 sticky top-0 z-20">
                <div class="relative">
                   <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="applyFilters()" placeholder="Search your orders" class="w-full pl-10 pr-4 py-3 bg-neutral-100 border-0 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary shadow-inner">
                   <svg class="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
             </div>

             <div class="px-4 py-6 space-y-6">
                <div class="flex justify-between items-center px-1">
                   <h1 class="text-2xl font-black uppercase tracking-tighter">Your Orders</h1>
                   <div class="flex items-center gap-1 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
                      <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Filter:</span>
                      <select [(ngModel)]="filterType" (change)="applyFilters()" class="text-[10px] font-black text-primary bg-transparent border-0 outline-none uppercase tracking-widest">
                          <option value="3months">Past 3 Months</option>
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                      </select>
                   </div>
                </div>

                <div *ngIf="loading()" class="py-20 flex justify-center">
                   <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>

                <!-- Mobile Order Cards -->
                <div *ngIf="!loading()" class="space-y-6">
                   <div *ngFor="let order of orders()" class="bg-white border-2 border-neutral-100 rounded-3xl overflow-hidden shadow-xl shadow-neutral-100/50">
                      <div class="p-5 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/30">
                         <div class="flex flex-col">
                            <span class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">Ordered On</span>
                            <span class="text-sm font-bold text-neutral-800">{{ order.createdAt | date:'mediumDate' }}</span>
                         </div>
                         <div class="text-right">
                            <span class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">Total</span>
                            <span class="block text-sm font-black text-primary uppercase">R{{ order.totalAmount | number:'1.0-0' }}</span>
                         </div>
                      </div>
                      
                      <div class="p-5 space-y-5">
                         <div *ngFor="let item of order.items" class="flex gap-5 border-b border-neutral-50 pb-5 last:border-0 last:pb-0">
                            <div class="w-20 h-20 bg-neutral-50 rounded-2xl p-2 flex items-center justify-center shrink-0 border border-neutral-100 shadow-inner">
                               <img [src]="item.productImage" class="max-w-full max-h-full object-contain mix-blend-multiply">
                            </div>
                            <div class="flex-grow flex flex-col justify-center">
                               <h3 class="text-[13px] font-bold text-neutral-800 line-clamp-2 leading-tight uppercase tracking-tight">{{ item.productName }}</h3>
                               <div class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2">{{ getStatusText(order.status) }}</div>
                            </div>
                         </div>
                      </div>

                      <div class="p-5 pt-0 flex flex-col gap-3">
                         <button [routerLink]="['/orders/track', order.id]" class="w-full bg-primary text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">Track Package</button>
                         <button (click)="buyAgain(order.items[0])" class="w-full bg-white border-2 border-neutral-100 text-neutral-800 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform">Buy Again</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        } @else {
          <!-- ORIGINAL DESKTOP UI (ENHANCED) -->
          <div class="flex justify-between items-end mb-10">
             <div>
                <h1 class="text-3xl font-normal text-neutral-charcoal mb-2">Your Orders</h1>
                <p class="text-sm text-neutral-500 font-medium">Manage and track your Chommie.za orders.</p>
             </div>
             
             <div class="flex items-center gap-4">
                 <!-- Desktop Search -->
                 <div class="relative w-80 group">
                     <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="applyFilters()" placeholder="Search all orders" class="w-full pl-10 pr-4 py-2 border-2 border-neutral-200 rounded-lg outline-none focus:border-primary transition-all text-sm font-medium shadow-sm">
                     <svg class="absolute left-3 top-2.5 w-4 h-4 text-neutral-400 group-focus-within:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
                 
                 <select [(ngModel)]="filterType" (change)="applyFilters()" class="border-2 border-neutral-200 rounded-lg py-2 px-4 text-xs font-bold uppercase tracking-widest bg-neutral-50 hover:bg-neutral-100 cursor-pointer outline-none transition-colors">
                     <option value="3months">Past 3 months</option>
                     <option value="2026">2026</option>
                     <option value="2025">2025</option>
                     <option value="archived">Archived</option>
                 </select>
             </div>
          </div>

          <!-- Desktop Tabs -->
          <div class="border-b border-neutral-200 mb-10 flex gap-10 text-[11px] font-black uppercase tracking-[0.2em]">
              <button (click)="activeTab.set('orders')" class="pb-4 border-b-4 transition-all" 
                  [class.border-primary]="activeTab() === 'orders'" 
                  [class.text-primary]="activeTab() === 'orders'"
                  [class.border-transparent]="activeTab() !== 'orders'"
                  [class.text-neutral-400]="activeTab() !== 'orders'">
                  Orders
              </button>
              <button (click)="activeTab.set('buy-again')" class="pb-4 border-b-4 transition-all" 
                  [class.border-primary]="activeTab() === 'buy-again'" 
                  [class.text-primary]="activeTab() === 'buy-again'"
                  [class.border-transparent]="activeTab() !== 'buy-again'"
                  [class.text-neutral-400]="activeTab() !== 'buy-again'">
                  Buy Again
              </button>
              <button class="pb-4 border-b-4 border-transparent text-neutral-400 hover:text-primary transition-all">Not Yet Shipped</button>
              <button class="pb-4 border-b-4 border-transparent text-neutral-400 hover:text-primary transition-all">Cancelled</button>
          </div>

          <div *ngIf="loading()" class="py-32 flex justify-center">
               <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          </div>

          <!-- Orders Feed Desktop -->
          <div *ngIf="!loading() && activeTab() === 'orders'" class="space-y-8">
            <div *ngIf="orders().length === 0" class="border-2 border-dashed border-neutral-200 rounded-[2rem] p-20 text-center bg-neutral-50">
               <p class="text-neutral-400 font-bold uppercase tracking-widest mb-6">No matching orders found.</p>
               <button routerLink="/products" class="btn-primary text-xs py-3 px-10 rounded-xl shadow-lg uppercase font-black tracking-widest transition-transform active:scale-95">Go to Marketplace</button>
            </div>

            <div *ngFor="let order of orders()" class="border border-neutral-300 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
              
              <!-- Order Header -->
              <div class="bg-neutral-50 border-b border-neutral-200 px-6 py-4 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">
                <div class="flex gap-12">
                    <div>
                      <div class="mb-1 text-neutral-400">Order Placed</div>
                      <div class="text-neutral-800 font-black">{{ order.createdAt | date:'longDate' }}</div>
                    </div>
                    <div>
                      <div class="mb-1 text-neutral-400">Total</div>
                      <div class="text-neutral-800 font-black">R{{ order.totalAmount | number:'1.0-0' }}</div>
                    </div>
                    <div>
                      <div class="mb-1 text-neutral-400">Ship To</div>
                      <div class="text-primary hover:underline cursor-pointer flex items-center gap-1">
                          User <svg class="w-3 h-3 text-neutral-300" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                      </div>
                    </div>
                </div>
                
                <div class="text-right">
                    <div class="mb-1 text-neutral-400">Order # {{ order.id }}</div>
                    <div class="flex gap-4 text-primary">
                        <button (click)="viewInvoice(order.id)" class="hover:underline">View Invoice</button>
                    </div>
                </div>
              </div>

              <!-- Order Body -->
              <div class="p-8">
                 <div class="flex flex-col lg:flex-row gap-10">
                     
                     <!-- Left: Status & Items -->
                     <div class="lg:col-span-9 space-y-8 flex-grow">
                        <div class="flex items-center gap-3">
                           <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                           <h2 class="text-xl font-bold text-neutral-800">
                               {{ getStatusText(order.status) }}
                           </h2>
                        </div>
                          
                        <div class="space-y-8">
                           <div *ngFor="let item of order.items" class="flex gap-6">
                               <div class="w-28 h-28 shrink-0 flex items-center justify-center p-2 border-2 border-neutral-100 rounded-2xl bg-neutral-50/50 cursor-pointer shadow-inner" [routerLink]="['/products', item.productId]">
                                   <img [src]="item.productImage" class="max-w-full max-h-full object-contain mix-blend-multiply">
                               </div>
                               
                               <div class="flex-grow space-y-2">
                                   <a [routerLink]="['/products', item.productId]" class="text-base font-bold text-primary hover:text-action hover:underline line-clamp-2 leading-snug transition-colors">
                                       {{ item.productName }}
                                   </a>
                                   <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Return window closed on {{ getReturnWindow(order.createdAt) | date:'mediumDate' }}</div>
                                   
                                   <div class="flex gap-3 pt-2">
                                       <button (click)="buyAgain(item)" class="bg-[#FA8900] hover:bg-[#E67A00] text-white text-[10px] font-black uppercase tracking-widest py-2 px-6 rounded-lg shadow-md active:scale-95 transition-all">Buy it again</button>
                                       <button [routerLink]="['/products', item.productId]" class="bg-white border-2 border-neutral-100 text-neutral-700 text-[10px] font-black uppercase tracking-widest py-2 px-6 rounded-lg hover:bg-neutral-50 active:scale-95 transition-all">View item</button>
                                   </div>
                               </div>
                           </div>
                        </div>
                     </div>

                     <!-- Right: Actions -->
                     <div class="w-64 flex flex-col gap-3 shrink-0">
                         <button [routerLink]="['/orders/track', order.id]" class="w-full bg-white border-2 border-neutral-800 text-neutral-800 text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-xl hover:bg-neutral-800 hover:text-white transition-all shadow-md">Track Package</button>
                         <button [routerLink]="['/returns', order.id]" class="w-full bg-white border-2 border-neutral-100 text-neutral-600 text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-xl hover:bg-neutral-50 transition-all">Return items</button>
                         <button class="w-full bg-white border-2 border-neutral-100 text-neutral-600 text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-xl hover:bg-neutral-50 transition-all">Write review</button>
                     </div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Buy Again Grid Desktop -->
          <div *ngIf="!loading() && activeTab() === 'buy-again'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
             <div *ngIf="buyAgainItems().length === 0" class="col-span-full py-32 text-center bg-neutral-50 rounded-[2rem] border-2 border-dashed border-neutral-200">
               <p class="text-neutral-400 font-bold uppercase tracking-widest">No previous assets detected.</p>
             </div>

             <div *ngFor="let item of buyAgainItems()" class="group bg-white border border-neutral-200 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 flex flex-col">
                <div class="aspect-square flex items-center justify-center mb-6 bg-neutral-50/50 rounded-2xl p-4 shadow-inner cursor-pointer" [routerLink]="['/products', item.productId]">
                    <img [src]="item.productImage" class="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500">
                </div>
                <a [routerLink]="['/products', item.productId]" class="text-sm font-bold text-primary group-hover:text-action transition-colors line-clamp-2 h-10 mb-4 leading-tight">
                    {{ item.productName }}
                </a>
                <div class="text-2xl font-black text-neutral-800 tracking-tighter mb-6">
                    R{{ item.price | number:'1.0-0' }}
                </div>
                <button (click)="buyAgain(item)" class="w-full btn-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform mt-auto">
                    Add to Cart
                </button>
             </div>
          </div>
        }
      </div>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  rawOrders = signal<any[]>([]);
  orders = signal<any[]>([]);
  buyAgainItems = signal<any[]>([]);
  activeTab = signal<'orders' | 'buy-again'>('orders');
  loading = signal(true);
  userId = '';
  
  searchQuery = '';
  filterType = '3months';

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private productService: ProductService,
    public ts: TranslationService,
    private router: Router,
    public deviceService: DeviceService
  ) {
    this.userId = localStorage.getItem('user_id') || '';
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getUserOrders(this.userId).subscribe({
      next: (data) => {
        this.rawOrders.set(data);
        this.applyFilters();
        this.extractBuyAgainItems(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = this.rawOrders();

    // Text Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.items.some((i: any) => i.productName.toLowerCase().includes(q))
      );
    }

    // Time Filter
    const now = new Date();
    if (this.filterType === '3months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      filtered = filtered.filter(o => new Date(o.createdAt) >= threeMonthsAgo);
    } else if (this.filterType === '2026') {
      filtered = filtered.filter(o => new Date(o.createdAt).getFullYear() === 2026);
    } else if (this.filterType === '2025') {
      filtered = filtered.filter(o => new Date(o.createdAt).getFullYear() === 2025);
    } else if (this.filterType === 'archived') {
       filtered = [];
    }

    this.orders.set(filtered);
  }


  viewInvoice(orderId: string) {
    alert(`Generating invoice for Order #${orderId}...`);
  }

  extractBuyAgainItems(orders: any[]) {
    const itemsMap = new Map();
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!itemsMap.has(item.productId)) {
          itemsMap.set(item.productId, item);
        }
      });
    });
    this.buyAgainItems.set(Array.from(itemsMap.values()));
  }

  buyAgain(item: any) {
    this.productService.getProduct(item.productId).subscribe(product => {
      const productToCart = {
        ...product,
        selectedVariants: item.selectedVariants
      };
      this.cartService.addToCart(productToCart);
      this.router.navigate(['/cart']);
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return 'Order Received';
      case 'PAID': return 'Payment Confirmed';
      case 'CONFIRMED': return 'Preparing for Shipment';
      case 'PACKED': return 'Packed';
      case 'SHIPPED': return 'On the way';
      case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      case 'RETURNED': return 'Returned';
      default: return status;
    }
  }

  getReturnWindow(dateStr: string): Date {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + 30);
      return date;
  }
}