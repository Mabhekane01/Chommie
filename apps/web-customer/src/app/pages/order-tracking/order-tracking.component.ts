import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { SocketService } from '../../services/socket.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32 pt-10">
      <div class="w-full px-6 animate-fade-in">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <a routerLink="/account" class="hover:underline hover:text-primary">{{ ts.t('nav.account') }}</a>
          <span>›</span>
          <a routerLink="/orders" class="hover:underline hover:text-primary">{{ ts.t('account.orders') }}</a>
          <span>›</span>
          <span class="text-primary font-bold">{{ ts.t('tracking.title') }}</span>
        </nav>

        <div *ngIf="loading()" class="py-20 flex justify-center">
             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>

        <div *ngIf="!loading() && order()" class="space-y-8">
            
            <!-- Order Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-200 pb-6">
               <div>
                  <h1 class="text-2xl font-bold text-neutral-charcoal mb-1">
                     {{ order()!.status === 'DELIVERED' ? ts.t('tracking.delivered') : ts.t('tracking.arriving') }}
                  </h1>
                  <p class="text-sm text-neutral-600" *ngIf="order()!.status !== 'DELIVERED'">
                     {{ ts.t('tracking.estimated') }}: <span class="font-bold text-emerald-700">Tomorrow, by 8pm</span>
                  </p>
                  <p class="text-sm text-neutral-600" *ngIf="order()!.status === 'DELIVERED'">
                     Package was handed to resident
                  </p>
               </div>
               <div class="text-right">
                  <div class="text-xs text-neutral-500 uppercase tracking-wide">Order #</div>
                  <div class="text-sm font-mono font-bold text-neutral-charcoal">{{ order()!.id }}</div>
               </div>
            </div>

            <!-- Visual Progress Bar -->
            <div class="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
                <div class="relative">
                    <!-- Progress Line Base -->
                    <div class="absolute left-0 top-1/2 w-full h-2 bg-neutral-100 rounded-full -translate-y-1/2"></div>
                    
                    <!-- Active Progress Line -->
                    <div class="absolute left-0 top-1/2 h-2 bg-emerald-600 rounded-full -translate-y-1/2 transition-all duration-1000"
                         [style.width]="getProgressPercent() + '%'">
                    </div>

                    <!-- Steps -->
                    <div class="relative flex justify-between">
                        <!-- Ordered -->
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-6 h-6 rounded-full flex items-center justify-center z-10 bg-emerald-600 text-white">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span class="text-xs font-bold text-neutral-charcoal">Ordered</span>
                        </div>

                        <!-- Shipped -->
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors duration-500"
                                 [ngClass]="order()!.status !== 'PENDING' && order()!.status !== 'PROCESSING' ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-400'">
                               <svg *ngIf="order()!.status !== 'PENDING' && order()!.status !== 'PROCESSING'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span class="text-xs font-bold" [ngClass]="order()!.status !== 'PENDING' && order()!.status !== 'PROCESSING' ? 'text-neutral-charcoal' : 'text-neutral-400'">Shipped</span>
                        </div>

                        <!-- Out for Delivery -->
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors duration-500"
                                 [ngClass]="order()!.status === 'SHIPPED' || order()!.status === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-400'">
                               <svg *ngIf="order()!.status === 'SHIPPED' || order()!.status === 'DELIVERED'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span class="text-xs font-bold" [ngClass]="order()!.status === 'SHIPPED' || order()!.status === 'DELIVERED' ? 'text-neutral-charcoal' : 'text-neutral-400'">Out for Delivery</span>
                        </div>

                        <!-- Delivered -->
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors duration-500"
                                 [ngClass]="order()!.status === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-400'">
                               <svg *ngIf="order()!.status === 'DELIVERED'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span class="text-xs font-bold" [ngClass]="order()!.status === 'DELIVERED' ? 'text-neutral-charcoal' : 'text-neutral-400'">Delivered</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detailed History -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Timeline List -->
                <div class="lg:col-span-2">
                    <h3 class="text-lg font-bold text-neutral-charcoal mb-4">{{ ts.t('tracking.history') }}</h3>
                    <div class="border-l-2 border-neutral-200 ml-3 space-y-8 pl-8 py-2">
                        <div *ngFor="let step of (order()!.trackingHistory || []).slice().reverse(); let first = first" class="relative">
                            <div class="absolute -left-[39px] top-1 w-4 h-4 rounded-full border-2 border-white"
                                 [ngClass]="first ? 'bg-primary ring-2 ring-primary/20' : 'bg-neutral-300'">
                            </div>
                            
                            <div class="space-y-1">
                                <div class="text-sm font-bold text-neutral-charcoal">{{ step.status.replace('_', ' ') | titlecase }}</div>
                                <div class="text-xs text-neutral-500">{{ step.timestamp | date:'EEEE, MMMM d, h:mm a' }}</div>
                                <div class="text-sm text-neutral-600">{{ step.description }}</div>
                                <div class="text-xs text-neutral-400 uppercase tracking-wide pt-1">Cape Town, ZA</div>
                            </div>
                        </div>

                        <!-- Initial State -->
                        <div *ngIf="!order()!.trackingHistory?.length" class="relative">
                             <div class="absolute -left-[39px] top-1 w-4 h-4 rounded-full bg-primary ring-2 ring-primary/20 border-2 border-white"></div>
                             <div class="space-y-1">
                                <div class="text-sm font-bold text-neutral-charcoal">Order Placed</div>
                                <div class="text-xs text-neutral-500">{{ order()!.createdAt | date:'short' }}</div>
                                <div class="text-sm text-neutral-600">We have received your order.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info Cards -->
                <div class="space-y-6">
                    <!-- Shipping Address -->
                    <div class="bg-neutral-50 border border-neutral-200 p-6 rounded-lg">
                        <h4 class="text-sm font-bold text-neutral-charcoal mb-2">{{ ts.t('tracking.ship_to') }}</h4>
                        <p class="text-sm text-neutral-600 leading-relaxed">
                            {{ order()!.shippingAddress }}
                        </p>
                    </div>

                    <!-- Order Summary Small -->
                    <div class="bg-neutral-50 border border-neutral-200 p-6 rounded-lg space-y-3">
                        <h4 class="text-sm font-bold text-neutral-charcoal mb-2">Order Summary</h4>
                        <div class="flex justify-between text-sm">
                            <span class="text-neutral-600">Item(s) Subtotal:</span>
                            <span class="font-medium">R{{ order()!.totalAmount | number:'1.0-0' }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-neutral-600">Shipping:</span>
                            <span class="font-medium text-emerald-700">R0.00</span>
                        </div>
                        <div class="border-t border-neutral-200 pt-3 flex justify-between font-bold text-neutral-charcoal">
                            <span>Grand Total:</span>
                            <span>R{{ order()!.totalAmount | number:'1.0-0' }}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order = signal<any | null>(null);
  loading = signal(true);
  userId = localStorage.getItem('user_id') || '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private socketService: SocketService,
    public ts: TranslationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
        this.loadOrder(id);
        
        if (this.userId) {
            this.socketService.connect(this.userId);
        }

        this.socketService.onOrderUpdate((updatedOrder) => {
            if (updatedOrder.id === id || updatedOrder._id === id) {
                this.order.set(updatedOrder);
            }
        });
    }
  }

  ngOnDestroy() {
      // Clean up
  }

  getProgressPercent() {
      if (!this.order()) return 0;
      const status = this.order()!.status;
      switch(status) {
          case 'PENDING':
          case 'PROCESSING': return 5;
          case 'SHIPPED': return 50;
          case 'DELIVERED': return 100;
          default: return 0;
      }
  }

  loadOrder(id: string) {
    this.orderService.getUserOrders(this.userId).subscribe(orders => {
        this.order.set(orders.find(o => o.id === id));
        this.loading.set(false);
    });
  }
}