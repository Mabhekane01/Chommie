import { Component, OnInit, signal, OnDestroy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { SocketService } from '../../services/socket.service';
import { TranslationService } from '../../services/translation.service';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#FAF3E1] text-neutral-charcoal pb-32" [ngClass]="deviceService.isMobile() ? 'pt-2' : 'pt-10'">
      <div class="w-full px-6 animate-fade-in">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-8">
          <a routerLink="/account" class="hover:text-primary transition-colors">{{ ts.t('nav.account') }}</a>
          <span>›</span>
          <a routerLink="/orders" class="hover:text-primary transition-colors">Your Orders</a>
          <span>›</span>
          <span class="text-primary">Track Package</span>
        </nav>

        <div *ngIf="loading()" class="py-20 flex justify-center">
             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>

        <div *ngIf="!loading() && order()" class="space-y-8 max-w-[1200px] mx-auto">
            
            <!-- Live Status Node -->
            <div class="bg-white border border-neutral-300 rounded-sm p-8 shadow-sm relative overflow-hidden">
               <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                  <div class="space-y-2">
                     <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-sm">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span class="text-[10px] font-black uppercase tracking-widest text-emerald-700">Live Tracking Active</span>
                     </div>
                     <h1 class="text-3xl font-bold tracking-tight text-neutral-800">
                        {{ order()!.status === 'DELIVERED' ? 'Package Delivered' : 'Your package is on its way' }}
                     </h1>
                     <p class="text-neutral-500 font-medium text-sm">
                        Standard Shipping • Order #{{ order()!.id.slice(0,12).toUpperCase() }}
                     </p>
                  </div>

                  <div class="bg-neutral-50 border border-neutral-200 p-6 rounded-sm min-w-[240px] text-center">
                     <div class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Expected Arrival</div>
                     <div class="text-xl font-bold text-neutral-800 tracking-tight uppercase">Today by 8 PM</div>
                  </div>
               </div>

               <!-- Live Map Simulation -->
               <div class="mt-10 h-[300px] bg-neutral-100 rounded-sm relative overflow-hidden border border-neutral-200 shadow-inner group">
                  <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
                  
                  <!-- Simulation Elements -->
                  <div class="absolute inset-0 flex items-center justify-center p-10">
                     <div class="w-full h-full relative border border-dashed border-neutral-300 rounded-sm">
                        <!-- Start Point -->
                        <div class="absolute top-1/2 left-10 -translate-y-1/2 flex flex-col items-center gap-2">
                           <div class="w-3 h-3 bg-neutral-400 rounded-full border-2 border-white shadow-md"></div>
                           <span class="text-[9px] font-bold text-neutral-400 uppercase">Warehouse</span>
                        </div>

                        <!-- Progress Line -->
                        <div class="absolute top-1/2 left-10 right-10 h-1 bg-neutral-200 -translate-y-1/2">
                           <div class="h-full bg-primary relative transition-all duration-[2000ms]" [style.width.%]="getProgressPercent()">
                              <!-- Delivery Vehicle Icon -->
                              <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-[#131921] rounded-sm flex items-center justify-center shadow-lg border border-white/10">
                                 <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                              </div>
                           </div>
                        </div>

                        <!-- Destination -->
                        <div class="absolute top-1/2 right-10 -translate-y-1/2 flex flex-col items-center gap-2">
                           <div class="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                           </div>
                           <span class="text-[9px] font-bold text-emerald-600 uppercase">Home</span>
                        </div>
                     </div>
                  </div>

                  <!-- Status HUD Overlay -->
                  <div class="absolute bottom-4 left-4 right-4 flex justify-between">
                     <div class="bg-white/90 border border-neutral-200 px-4 py-2 rounded-sm flex items-center gap-3 shadow-md">
                        <div class="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Distance Remaining: <span class="text-neutral-800">4.2 KM</span></div>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Historical Log & Metadata -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                <!-- Timeline List -->
                <div class="lg:col-span-2 bg-white border border-neutral-300 rounded-sm p-8 shadow-sm">
                    <h2 class="text-sm font-bold text-neutral-800 uppercase tracking-widest mb-8 border-b border-neutral-100 pb-4">Delivery History</h2>
                    <div class="border-l-2 border-neutral-100 ml-2 space-y-10 pl-8 py-2 relative">
                        <div *ngFor="let step of (order()!.trackingHistory || []).slice().reverse(); let first = first" class="relative">
                            <div class="absolute -left-[41px] top-1 w-5 h-5 rounded-sm border-2 border-white flex items-center justify-center shadow-sm transition-all"
                                 [ngClass]="first ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-400'">
                               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            
                            <div class="space-y-1">
                                <div class="text-sm font-bold text-neutral-800 uppercase tracking-tight">{{ step.status.replace('_', ' ') }}</div>
                                <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{{ step.timestamp | date:'EEEE, MMM d, h:mm a' }}</div>
                                <p class="text-xs text-neutral-600 leading-relaxed max-w-lg">{{ step.description }}</p>
                                <div class="text-[9px] font-bold text-neutral-400 uppercase pt-1">Location: Cape Town, ZA</div>
                            </div>
                        </div>

                        <!-- Initial State -->
                        <div *ngIf="!order()!.trackingHistory?.length" class="relative">
                             <div class="absolute -left-[41px] top-1 w-5 h-5 rounded-sm bg-primary border-2 border-white flex items-center justify-center shadow-sm">
                                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                             </div>
                             <div class="space-y-1">
                                <div class="text-sm font-bold text-neutral-800 uppercase tracking-tight">Order Placed</div>
                                <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{{ order()!.createdAt | date:'short' }}</div>
                                <p class="text-xs text-neutral-600">We have received your order and are preparing it for shipment.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info Cards -->
                <div class="space-y-6">
                    <!-- Target Address -->
                    <div class="bg-white border border-neutral-300 p-6 rounded-sm shadow-sm space-y-4">
                        <div class="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Shipping Address</div>
                        <p class="text-sm font-bold text-neutral-800 leading-relaxed uppercase tracking-tight">
                            {{ order()!.shippingAddress }}
                        </p>
                    </div>

                    <!-- Order Summary -->
                    <div class="bg-[#131921] text-white p-6 rounded-sm shadow-xl space-y-6 relative overflow-hidden">
                        <div class="text-[10px] font-black text-white/40 uppercase tracking-widest">Order Summary</div>
                        
                        <div class="space-y-4 relative z-10">
                           <div class="flex justify-between items-end text-xs">
                               <span class="text-white/40 uppercase">Items Total</span>
                               <span class="font-bold">R{{ order()!.totalAmount | number:'1.0-0' }}</span>
                           </div>
                           <div class="flex justify-between items-end text-xs">
                               <span class="text-white/40 uppercase">Shipping Fee</span>
                               <span class="font-bold text-emerald-400 uppercase">Free</span>
                           </div>
                           <div class="h-px bg-white/10 my-2"></div>
                           <div class="flex justify-between items-end">
                               <span class="text-[10px] font-black text-primary uppercase tracking-widest">Total</span>
                               <span class="text-xl font-black text-primary tracking-tighter">R{{ order()!.totalAmount | number:'1.0-0' }}</span>
                           </div>
                        </div>

                        <button class="w-full py-3 bg-white/5 border border-white/10 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Download Invoice</button>
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
  public deviceService = inject(DeviceService);
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
      if (!this.order()) return 5;
      const status = this.order()!.status;
      switch(status) {
          case 'PENDING': return 10;
          case 'PAID':
          case 'CONFIRMED': return 25;
          case 'PROCESSING':
          case 'PACKED': return 40;
          case 'SHIPPED': return 65;
          case 'OUT_FOR_DELIVERY': return 85;
          case 'DELIVERED': return 100;
          default: return 5;
      }
  }

  loadOrder(id: string) {
    this.orderService.getUserOrders(this.userId).subscribe(orders => {
        const found = orders.find(o => o.id === id || o._id === id);
        if (found) {
            this.order.set(found);
        }
        this.loading.set(false);
    });
  }
}