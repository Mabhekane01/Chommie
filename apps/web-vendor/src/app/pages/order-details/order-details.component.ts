import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE ORDER DETAILS UI -->
        <div class="p-4 space-y-6 animate-fade-in">
           <div class="flex items-center gap-3 pt-2">
              <button routerLink="/orders" class="p-2 text-neutral-400">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <h1 class="text-xl font-bold">Order Details</h1>
           </div>

           <div *ngIf="loading()" class="py-20 flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>

           <div *ngIf="!loading() && order" class="space-y-4">
              <!-- Summary Card Mobile -->
              <div class="bg-white p-5 rounded-3xl border-2 border-neutral-100 shadow-sm space-y-2">
                 <div class="flex justify-between items-center">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Order ID</span>
                    <span class="text-xs font-bold text-neutral-800">#{{ order.id.slice(0, 12).toUpperCase() }}</span>
                 </div>
                 <div class="flex justify-between items-center">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</span>
                    <span class="text-xs font-black text-emerald-600 uppercase">{{ order.status }}</span>
                 </div>
                 <div class="flex justify-between items-center pt-2 border-t border-neutral-50 mt-2">
                    <span class="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total Proceeds</span>
                    <span class="text-base font-black text-primary">R{{ order.totalAmount | number:'1.0-0' }}</span>
                 </div>
              </div>

              <!-- Shipping Mobile -->
              <div class="bg-white p-5 rounded-3xl border-2 border-neutral-100 shadow-sm space-y-3">
                 <h2 class="text-xs font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-50 pb-2">Shipping Information</h2>
                 <div class="text-sm font-bold text-neutral-800">{{ order.shippingAddress }}</div>
                 <div class="text-xs text-neutral-500 uppercase font-bold tracking-tighter">Standard Marketplace Logistics</div>
              </div>

              <!-- Items Mobile -->
              <div class="space-y-3">
                 <h2 class="text-xs font-black uppercase tracking-widest text-neutral-400 px-1">Order Items</h2>
                 <div *ngFor="let item of order.items" class="bg-white p-4 rounded-2xl border-2 border-neutral-100 shadow-sm flex gap-4">
                    <div class="w-16 h-16 bg-neutral-50 rounded-xl flex items-center justify-center shrink-0 border border-neutral-100 p-1">
                       <img [src]="item.productImage" class="max-w-full max-h-full object-contain mix-blend-multiply">
                    </div>
                    <div class="flex-grow">
                       <div class="text-xs font-bold text-neutral-800 line-clamp-2 leading-tight uppercase tracking-tight">{{ item.productName }}</div>
                       <div class="mt-1 text-[10px] font-black text-neutral-400">QTY: {{ item.quantity }} • R{{ item.price | number:'1.0-0' }}</div>
                    </div>
                 </div>
              </div>

              <div class="pt-4 flex flex-col gap-3">
                 <button *ngIf="order.status === 'PAID' || order.status === 'PROCESSING'" 
                         (click)="confirmShipment()"
                         class="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg active:scale-[0.98] transition-all">Confirm Shipment</button>
                 <button class="w-full bg-white border-2 border-neutral-100 text-neutral-400 py-4 rounded-2xl font-black uppercase tracking-[0.2em]">Contact Buyer</button>
              </div>
           </div>
        </div>
      } @else {
        <!-- DESKTOP ORDER DETAILS UI -->
        <div class="p-8 max-w-[1200px] mx-auto space-y-8 animate-fade-in text-sm">
          <div class="flex justify-between items-end border-b border-neutral-200 pb-6">
             <div>
                <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4">
                   <a routerLink="/orders" class="hover:text-primary transition-colors">Order Manifest</a>
                   <span>›</span>
                   <span class="text-neutral-800">Order ID: {{ order?.id?.slice(0, 12)?.toUpperCase() }}</span>
                </nav>
                <h1 class="text-3xl font-header font-bold text-neutral-charcoal tracking-tight">Order Details</h1>
             </div>
             <div class="flex gap-4">
                <button class="bg-white border-2 border-neutral-300 px-6 py-2 rounded-xl hover:bg-neutral-50 shadow-sm font-black uppercase text-[10px] tracking-widest text-neutral-600 transition-all">Print Packing Slip</button>
                <button class="bg-white border-2 border-neutral-300 px-6 py-2 rounded-xl hover:bg-neutral-50 shadow-sm font-black uppercase text-[10px] tracking-widest text-neutral-600 transition-all">Edit Shipment</button>
             </div>
          </div>

          <div *ngIf="loading()" class="py-32 flex justify-center">
               <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          </div>

          <div *ngIf="!loading() && order" class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <!-- Left: Order Info -->
              <div class="lg:col-span-2 space-y-8">
                  <div class="bg-white border border-neutral-300 rounded-[2rem] shadow-sm overflow-hidden">
                      <div class="p-8 border-b border-neutral-100 bg-neutral-50/30 flex justify-between items-center">
                          <h2 class="text-sm font-black text-neutral-400 uppercase tracking-[0.2em]">Asset Transmissions</h2>
                          <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100 bg-emerald-50 px-3 py-1 rounded-full shadow-sm">{{ order.status }}</span>
                      </div>
                      <div class="p-8 space-y-8">
                          <div *ngFor="let item of order.items" class="flex gap-8 group">
                              <div class="w-24 h-24 shrink-0 flex items-center justify-center p-2 border-2 border-neutral-100 rounded-2xl bg-white shadow-inner group-hover:border-primary/20 transition-all">
                                 <img [src]="item.productImage" class="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110">
                              </div>
                              <div class="flex-grow space-y-2 py-1">
                                 <div class="font-black text-neutral-800 uppercase tracking-tight text-base">{{ item.productName }}</div>
                                 <div class="flex gap-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                    <span>Asset ID: {{ item.productId.slice(0, 10).toUpperCase() }}</span>
                                    <span>Quantity: {{ item.quantity }} Units</span>
                                 </div>
                                 <div class="text-sm font-black text-primary tracking-tight">Unit Price: R{{ item.price | number:'1.0-0' }}</div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <!-- Shipping Manifest -->
                  <div class="bg-white border border-neutral-300 rounded-[2rem] p-8 shadow-sm">
                      <h2 class="text-sm font-black text-neutral-400 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-neutral-50">Logistics Manifest</h2>
                      <div class="grid grid-cols-2 gap-10">
                          <div class="space-y-4">
                             <div class="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Recipient Coordinates</div>
                             <div class="text-sm font-bold text-neutral-800 leading-relaxed uppercase tracking-tight">
                                {{ order.shippingAddress }}
                             </div>
                          </div>
                          <div class="space-y-4">
                             <div class="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Logistics Channel</div>
                             <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h14a2 2 0 002-2V8m-7 0V4"></path></svg>
                                </div>
                                <div class="text-xs font-black text-neutral-700 uppercase tracking-widest">Standard Marketplace Protocol</div>
                             </div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Right: Settlement Summary -->
              <div class="bg-[#131921] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <h2 class="text-sm font-black uppercase tracking-[0.2em] text-white/40 mb-8 relative z-10">Settlement</h2>
                  
                  <div class="space-y-6 relative z-10">
                      <div class="flex justify-between items-end">
                         <span class="text-[10px] font-black text-white/40 uppercase tracking-widest">Gross Transmission</span>
                         <span class="text-sm font-bold tracking-tight">R{{ order.totalAmount | number:'1.0-0' }}</span>
                      </div>
                      <div class="flex justify-between items-end">
                         <span class="text-[10px] font-black text-white/40 uppercase tracking-widest">Nexus Commission (15%)</span>
                         <span class="text-sm font-bold text-red-400 tracking-tight">-R{{ (order.totalAmount * 0.15) | number:'1.0-0' }}</span>
                      </div>
                      <div class="h-px bg-white/10 my-4"></div>
                      <div class="flex justify-between items-end">
                         <span class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Net Settlement</span>
                         <span class="text-2xl font-black text-primary tracking-tighter">R{{ (order.totalAmount * 0.85) | number:'1.0-0' }}</span>
                      </div>

                      <div class="pt-10 space-y-4">
                         <button *ngIf="order.status === 'PAID' || order.status === 'PROCESSING'" 
                                 (click)="confirmShipment()"
                                 class="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Confirm Shipment</button>
                         <button class="w-full bg-white/5 border border-white/10 text-white/60 py-4 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all">Contact Nexus Node</button>
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
export class OrderDetailsComponent implements OnInit {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  order: any | null = null;
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrder(id).subscribe({
        next: (data) => {
          this.order = data;
          this.loading.set(false);
        },
        error: () => {
          alert('Could not load order details.');
          this.router.navigate(['/orders']);
        }
      });
    }
  }

  confirmShipment() {
    if (!this.order) return;
    if (confirm('Confirm items have been dispatched to logistics partner?')) {
        this.orderService.updateStatus(this.order.id, 'SHIPPED').subscribe({
            next: () => {
                alert('Shipment confirmed.');
                this.router.navigate(['/orders']);
            },
            error: () => alert('Failed to update status.')
        });
    }
  }
}
