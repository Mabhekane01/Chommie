import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { TranslationService } from '../../services/translation.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32 pt-6">
      <div class="w-full px-6 animate-fade-in">
        <h1 class="text-2xl font-normal text-neutral-charcoal mb-6">{{ ts.t('nav.orders') }}</h1>
           
           <div class="flex flex-col md:flex-row gap-4 justify-between">
               <!-- Search -->
               <div class="relative flex-grow max-w-lg">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg class="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   </div>
                   <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="applyFilters()" placeholder="Search all orders" class="pl-10 w-full border border-neutral-400 rounded-sm py-1.5 shadow-inner focus:ring-primary focus:border-primary outline-none text-sm">
                   <button (click)="applyFilters()" class="absolute inset-y-0 right-0 px-4 bg-neutral-800 text-white text-sm font-bold rounded-r-sm hover:bg-neutral-700">Search Orders</button>
               </div>
               
               <!-- Filter -->
               <div class="flex items-center gap-2">
                   <span class="text-sm font-bold text-neutral-700">Filter by:</span>
                   <select [(ngModel)]="filterType" (change)="applyFilters()" class="border border-neutral-300 rounded-sm py-1 px-2 text-sm shadow-sm bg-neutral-50 hover:bg-neutral-100 cursor-pointer outline-none">
                       <option value="3months">Past 3 months</option>
                       <option value="2026">2026</option>
                       <option value="2025">2025</option>
                       <option value="archived">Archived Orders</option>
                   </select>
               </div>
           </div>

        <!-- Tabs -->
        <div class="border-b border-neutral-300 mb-6 flex gap-6 text-sm">
            <button (click)="activeTab.set('orders')" class="pb-3 border-b-2 transition-colors font-medium" 
                [class.border-primary]="activeTab() === 'orders'" 
                [class.text-primary]="activeTab() === 'orders'"
                [class.border-transparent]="activeTab() !== 'orders'"
                [class.text-neutral-600]="activeTab() !== 'orders'">
                {{ ts.t('account.orders') }}
            </button>
            <button (click)="activeTab.set('buy-again')" class="pb-3 border-b-2 transition-colors font-medium" 
                [class.border-primary]="activeTab() === 'buy-again'" 
                [class.text-primary]="activeTab() === 'buy-again'"
                [class.border-transparent]="activeTab() !== 'buy-again'"
                [class.text-neutral-600]="activeTab() !== 'buy-again'">
                Buy Again
            </button>
            <button class="pb-3 border-b-2 border-transparent text-neutral-600 hover:text-primary transition-colors font-medium">Not Yet Shipped</button>
            <button class="pb-3 border-b-2 border-transparent text-neutral-600 hover:text-primary transition-colors font-medium">Cancelled Orders</button>
        </div>

        <div *ngIf="loading()" class="py-20 flex justify-center">
             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>

        <!-- Orders Feed -->
        <div *ngIf="!loading() && activeTab() === 'orders'" class="space-y-6">
          <div *ngIf="orders().length === 0" class="border border-neutral-300 rounded-md p-10 text-center bg-neutral-50">
             <p class="text-neutral-700 mb-2">You have no orders in the selected period.</p>
             <button class="btn-primary text-sm py-1.5 px-4 rounded-md">Start Shopping</button>
          </div>

          <div *ngFor="let order of orders()" class="border border-neutral-300 rounded-md overflow-hidden bg-white hover:border-neutral-400 transition-colors">
            
            <!-- Order Header -->
            <div class="bg-neutral-100 border-b border-neutral-200 px-4 py-3 flex flex-col md:flex-row justify-between text-xs text-neutral-600 gap-4">
              <div class="flex gap-8">
                  <div>
                    <div class="uppercase font-bold mb-1 text-neutral-500 text-[10px]">Order Placed</div>
                    <div>{{ order.createdAt | date:'longDate' }}</div>
                  </div>
                  <div>
                    <div class="uppercase font-bold mb-1 text-neutral-500 text-[10px]">Total</div>
                    <div>R{{ order.totalAmount | number:'1.0-0' }}</div>
                  </div>
                  <div class="hidden sm:block">
                    <div class="uppercase font-bold mb-1 text-neutral-500 text-[10px]">Ship To</div>
                    <div class="text-primary hover:underline cursor-pointer flex items-center group">
                        User <svg class="w-3 h-3 text-neutral-400 group-hover:text-primary" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                  </div>
              </div>
              
              <div class="flex flex-col items-end">
                  <div class="flex gap-1 text-xs">
                      <span>Order #</span>
                      <span class="text-neutral-800">{{ order.id }}</span>
                  </div>
                  <div class="flex gap-3 mt-1 text-primary">
                      <button (click)="viewInvoice(order.id)" class="hover:underline text-left">View Invoice</button>
                  </div>
              </div>
            </div>

            <!-- Order Body -->
            <div class="p-4 md:p-6">
               <div class="flex flex-col lg:flex-row gap-6">
                   
                   <!-- Left: Status & Items -->
                   <div class="lg:col-span-9 space-y-6">
                       <div class="mb-2">
                          <h2 class="text-lg font-bold text-neutral-800">
                              {{ getStatusText(order.status) }}
                          </h2>
                          <p class="text-sm text-neutral-500" *ngIf="order.status === 'DELIVERED'">
                              Package was left near the front door or porch.
                          </p>
                       </div>
                        
                       <div class="space-y-6">
                           <div *ngFor="let item of order.items" class="flex gap-4">
                               <div class="w-24 h-24 flex-shrink-0 flex items-center justify-center p-1 border border-neutral-200 rounded-sm bg-white cursor-pointer" [routerLink]="['/products', item.productId]">
                                   <img [src]="item.productImage || 'https://via.placeholder.com/150'" class="max-w-full max-h-full object-contain">
                               </div>
                               
                               <div class="flex-grow text-sm">
                                   <a [routerLink]="['/products', item.productId]" class="font-bold text-primary hover:underline line-clamp-2 mb-1">
                                       {{ item.productName }}
                                   </a>
                                   <div class="text-neutral-500 text-xs mb-2">Return window closed on {{ getReturnWindow(order.createdAt) | date:'mediumDate' }}</div>
                                   
                                   <div class="flex gap-2">
                                       <button [routerLink]="['/products', item.productId]" class="btn-primary text-xs py-1 px-3 rounded-md">Buy it again</button>
                                       <button [routerLink]="['/products', item.productId]" class="btn-secondary text-xs py-1 px-3 rounded-md">View your item</button>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>

                   <!-- Right: Actions -->
                   <div class="lg:col-span-3 flex flex-col gap-2">
                       <button [routerLink]="['/orders/track', order.id]" class="btn-primary w-full text-sm py-1.5 rounded-md shadow-sm">
                           Track Package
                       </button>
                       <button [routerLink]="['/returns', order.id]" class="btn-secondary w-full text-sm py-1.5 rounded-md shadow-sm">
                           Return or Replace Items
                       </button>
                       <button class="btn-secondary w-full text-sm py-1.5 rounded-md shadow-sm">
                           Share Gift Receipt
                       </button>
                       <button class="btn-secondary w-full text-sm py-1.5 rounded-md shadow-sm">
                           Write a Product Review
                       </button>
                   </div>
               </div>
            </div>
          </div>
        </div>

        <!-- Buy Again Grid -->
        <div *ngIf="!loading() && activeTab() === 'buy-again'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
           <div *ngIf="buyAgainItems().length === 0" class="col-span-full py-20 text-center">
             <p class="text-neutral-600">You have no items to buy again.</p>
           </div>

           <div *ngFor="let item of buyAgainItems()" class="border border-neutral-200 rounded-md p-4 hover:shadow-md transition-shadow bg-white flex flex-col">
              <div class="h-40 flex items-center justify-center mb-4 cursor-pointer" [routerLink]="['/products', item.productId]">
                  <img [src]="item.productImage || 'https://via.placeholder.com/150'" class="max-w-full max-h-full object-contain">
              </div>
              <a [routerLink]="['/products', item.productId]" class="text-sm font-medium text-primary hover:underline line-clamp-2 h-10 mb-2">
                  {{ item.productName }}
              </a>
              <div class="text-lg font-bold text-neutral-charcoal mb-3">
                  R{{ item.price | number:'1.0-0' }}
              </div>
              <button (click)="buyAgain(item)" class="btn-primary w-full text-xs py-1.5 rounded-md shadow-sm mt-auto">
                  {{ ts.t('product.add_to_cart') }}
              </button>
           </div>
        </div>

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
    private router: Router
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
       // Mock logic for archived
       filtered = [];
    }

    this.orders.set(filtered);
  }


  viewInvoice(orderId: string) {
    // In a real app, this would open a PDF or a print-friendly route
    alert(`Generating invoice for Order #${orderId}... (This would download a PDF)`);
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
      date.setDate(date.getDate() + 30); // 30 day return policy
      return date;
  }
}