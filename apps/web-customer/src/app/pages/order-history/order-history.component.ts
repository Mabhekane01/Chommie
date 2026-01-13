import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white min-h-screen pb-12">
      <div class="container mx-auto px-4 py-8 max-w-[1000px]">
        
        <!-- Breadcrumb -->
        <div class="text-sm text-amazon-link mb-4 hover:underline cursor-pointer">
            Your Account
        </div>

        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-normal text-[#111111]">Your Orders</h1>
            
            <div class="flex items-center gap-2">
                <div class="relative">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-2 top-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                     <input type="text" placeholder="Search all orders" class="pl-9 pr-3 py-1.5 border border-gray-400 rounded-[3px] shadow-inner text-sm focus:border-action focus:ring-1 focus:ring-action outline-none w-64">
                </div>
                <button class="bg-[#303333] text-white text-sm font-bold py-1.5 px-4 rounded-[20px]">Search Orders</button>
            </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-300 mb-6 text-sm">
            <div class="flex gap-8">
                <button (click)="activeTab.set('orders')" class="pb-2 border-b-2 font-bold transition-colors" 
                    [class.border-action]="activeTab() === 'orders'" 
                    [class.text-black]="activeTab() === 'orders'" 
                    [class.border-transparent]="activeTab() !== 'orders'" 
                    [class.text-amazon-link]="activeTab() !== 'orders'">Orders</button>
                <button (click)="activeTab.set('buy-again')" class="pb-2 border-b-2 font-bold transition-colors" 
                    [class.border-action]="activeTab() === 'buy-again'" 
                    [class.text-black]="activeTab() === 'buy-again'" 
                    [class.border-transparent]="activeTab() !== 'buy-again'" 
                    [class.text-amazon-link]="activeTab() !== 'buy-again'">Buy Again</button>
                <button class="pb-2 border-b-2 border-transparent text-amazon-link hover:text-action cursor-not-allowed">Not Yet Shipped</button>
                <button class="pb-2 border-b-2 border-transparent text-amazon-link hover:text-action cursor-not-allowed">Cancelled Orders</button>
            </div>
        </div>

        <div class="mb-4 text-sm text-[#111111]" *ngIf="activeTab() === 'orders'">
            <span class="font-bold">{{ orders().length }} orders</span> placed in <span class="bg-[#F0F2F2] border border-gray-300 rounded-[8px] px-2 py-1 text-xs cursor-pointer shadow-sm">past 3 months ▼</span>
        </div>

        <div *ngIf="loading()" class="flex justify-center py-20">
             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-action"></div>
        </div>

        <!-- Orders View -->
        <div *ngIf="!loading() && activeTab() === 'orders'" class="space-y-6">
          <div *ngIf="orders().length === 0" class="text-center py-20 bg-white rounded border border-gray-200">
             <p class="text-gray-500">You have no orders in this time period.</p>
          </div>

          <div *ngFor="let order of orders()" class="border border-gray-300 rounded-[8px] overflow-hidden">
            
            <!-- Card Header -->
            <div class="bg-[#F0F2F2] px-6 py-3 border-b border-gray-300 text-xs text-[#565959] flex justify-between items-start">
              <div class="flex gap-10">
                  <div>
                    <div class="uppercase mb-1">Order Placed</div>
                    <div class="text-[#111111]">{{ order.createdAt | date }}</div>
                  </div>
                  <div>
                    <div class="uppercase mb-1">Total</div>
                    <div class="text-[#111111]">R{{ order.totalAmount | number:'1.2-2' }}</div>
                  </div>
                  <div>
                    <div class="uppercase mb-1">Ship To</div>
                    <div class="text-amazon-link hover:underline cursor-pointer flex items-center gap-1 group">
                        User <span class="group-hover:text-action">▼</span>
                    </div>
                  </div>
              </div>
              
              <div class="text-right">
                  <div class="uppercase mb-1">Order # {{ order.id.slice(0, 16) }}</div>
                  <div class="flex gap-3 justify-end text-amazon-link">
                      <span class="hover:underline hover:text-action cursor-pointer">View order details</span>
                      <span class="text-gray-300">|</span>
                      <span class="hover:underline hover:text-action cursor-pointer">Invoice</span>
                  </div>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-6 bg-white">
               <div class="flex flex-col md:flex-row justify-between">
                   
                   <!-- Left: Status & Items -->
                   <div class="flex-grow">
                       <h2 class="text-lg font-bold text-[#111111] mb-2" [ngClass]="{
                           'text-green-700': order.status === 'DELIVERED',
                           'text-[#B12704]': order.status === 'PENDING' || order.status === 'PROCESSING' || order.status === 'CONFIRMED'
                       }">
                           {{ getStatusText(order.status) }}
                       </h2>
                        
                       <!-- Tracking Timeline -->
                       <div class="mb-6 mt-4 relative">
                           <div class="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                               <div class="h-full bg-green-600 transition-all duration-500" [style.width]="getTrackingProgress(order.status) + '%'"></div>
                           </div>
                           <div class="flex justify-between text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wide">
                               <span>Ordered</span>
                               <span>Shipped</span>
                               <span>Out for Delivery</span>
                               <span>Delivered</span>
                           </div>
                       </div>

                       <div class="space-y-6">
                           <div *ngFor="let item of order.items" class="flex gap-4">
                               <div class="w-20 h-20 bg-gray-100 flex items-center justify-center border border-gray-200 rounded-[2px] cursor-pointer" [routerLink]="['/products', item.productId]">
                                   <span class="text-xs text-gray-400">Img</span>
                               </div>
                               
                               <div>
                                   <div class="text-amazon-link font-medium hover:underline hover:text-action cursor-pointer mb-1" [routerLink]="['/products', item.productId]">
                                       {{ item.productName }}
                                   </div>
                                   <div class="text-xs text-[#565959] mb-1">
                                       Sold by: Chommie Retail
                                   </div>
                                   
                                   <!-- Selected Variants -->
                                   <div *ngIf="item.selectedVariants" class="text-[10px] text-gray-500 mb-1 flex gap-x-3">
                                       <div *ngFor="let v of item.selectedVariants | keyvalue">
                                           <span class="font-bold">{{ v.key }}:</span> {{ v.value }}
                                       </div>
                                   </div>

                                   <div class="text-xs text-[#B12704] font-bold">
                                       R{{ item.price | number:'1.2-2' }}
                                   </div>
                                   
                                   <div class="mt-2">
                                       <button (click)="buyAgain(item)" class="bg-[#F0C14B] hover:bg-[#F4D078] border border-[#a88734] rounded-[8px] py-1 px-3 text-xs shadow-sm text-[#111111] transition-colors">
                                           Buy it again
                                       </button>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>

                   <!-- Right: Action Buttons -->
                   <div class="w-full md:w-64 space-y-2 mt-6 md:mt-0 flex flex-col">
                       <button [routerLink]="['/orders/track', order.id]" class="w-full bg-white border border-gray-300 hover:bg-gray-50 rounded-[8px] py-1.5 px-4 text-sm shadow-sm text-[#111111] font-medium transition-colors">
                           Track package
                       </button>
                       <button class="w-full bg-white border border-gray-300 hover:bg-gray-50 rounded-[8px] py-1.5 px-4 text-sm shadow-sm text-[#111111] font-medium transition-colors">
                           Write a product review
                       </button>
                       <button [routerLink]="['/returns', order.id]" class="w-full bg-white border border-gray-300 hover:bg-gray-50 rounded-[8px] py-1.5 px-4 text-sm shadow-sm text-[#111111] font-medium transition-colors">
                           Return or replace items
                       </button>
                   </div>
               </div>
            </div>
          </div>
        </div>

        <!-- Buy Again View -->
        <div *ngIf="!loading() && activeTab() === 'buy-again'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
           <div *ngIf="buyAgainItems().length === 0" class="col-span-full text-center py-20 bg-white rounded border border-gray-200">
             <p class="text-gray-500">You haven't purchased anything yet.</p>
           </div>

           <div *ngFor="let item of buyAgainItems()" class="border border-gray-300 rounded-[8px] p-4 flex flex-col bg-white">
              <div class="h-40 flex items-center justify-center mb-4 cursor-pointer" [routerLink]="['/products', item.productId]">
                  <div class="w-32 h-32 bg-gray-100 flex items-center justify-center border border-gray-200 rounded">
                      <span class="text-gray-400 text-xs">Img</span>
                  </div>
              </div>
              <div class="text-amazon-link text-sm font-medium hover:underline hover:text-action cursor-pointer line-clamp-2 mb-2" [routerLink]="['/products', item.productId]">
                  {{ item.productName }}
              </div>
              <div class="text-lg font-bold text-[#B12704] mb-4">
                  R{{ item.price | number:'1.2-2' }}
              </div>
              <button (click)="buyAgain(item)" class="w-full bg-[#F0C14B] hover:bg-[#F4D078] border border-[#a88734] rounded-full py-1.5 text-sm shadow-sm text-[#111111] font-medium mt-auto transition-colors">
                  Add to Cart
              </button>
           </div>
        </div>

      </div>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  orders = signal<any[]>([]);
  buyAgainItems = signal<any[]>([]);
  activeTab = signal<'orders' | 'buy-again'>('orders');
  loading = signal(true);
  userId = '';

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private productService: ProductService,
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
        this.orders.set(data);
        this.extractBuyAgainItems(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.loading.set(false);
      }
    });
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
    // We need the full product object for the cart
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

  getTrackingProgress(status: string): number {
    switch (status) {
        case 'PENDING':
        case 'PAID':
        case 'CONFIRMED':
            return 25;
        case 'PACKED':
        case 'SHIPPED':
            return 50;
        case 'OUT_FOR_DELIVERY':
            return 75;
        case 'DELIVERED':
        case 'RETURNED':
            return 100;
        default:
            return 0;
    }
  }
}
