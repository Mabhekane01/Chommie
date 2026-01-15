import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorService } from '../../services/vendor.service';
import { RouterLink } from '@angular/router';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE ORDERS UI -->
        <div class="p-4 space-y-6 animate-fade-in">
           <div class="flex justify-between items-center pt-2">
              <h1 class="text-xl font-bold">Orders</h1>
              <div class="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-neutral-200">
                 <span class="text-[10px] font-bold text-neutral-400">View</span>
                 <select [value]="activeTab()" (change)="onTabChange($any($event.target).value)" class="text-[10px] font-bold text-primary bg-transparent border-0 outline-none uppercase">
                    <option value="unshipped">Unshipped</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="cancelled">Cancelled</option>
                 </select>
              </div>
           </div>

           <div *ngIf="loading()" class="py-20 flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>

           <div *ngIf="!loading() && filteredOrders().length === 0" class="bg-white p-10 text-center rounded-lg border border-neutral-300 shadow-sm">
              <p class="text-neutral-400 text-sm font-bold uppercase tracking-widest">No orders found.</p>
           </div>

           <div class="space-y-4" *ngIf="!loading()">
              <div *ngFor="let order of filteredOrders()" class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <div class="flex justify-between items-start">
                    <div class="space-y-1">
                       <div class="text-sm font-bold text-neutral-800">Order #{{ order.id.slice(0, 8).toUpperCase() }}</div>
                       <div class="text-[10px] font-medium text-neutral-400 uppercase tracking-tighter">{{ order.createdAt | date:'medium' }}</div>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border"
                          [ngClass]="getStatusColor(order.status)">
                       {{ order.status }}
                    </span>
                 </div>

                 <div class="space-y-3">
                    <div *ngFor="let item of order.items" class="flex gap-3 items-center">
                       <div class="w-10 h-10 bg-neutral-50 rounded-md p-1 flex items-center justify-center shrink-0 border border-neutral-200">
                          <img [src]="item.productImage" class="max-w-full max-h-full object-contain mix-blend-multiply">
                       </div>
                       <div class="flex-grow">
                          <div class="text-xs font-bold text-neutral-700 line-clamp-1">{{ item.productName }}</div>
                          <div class="text-[10px] font-bold text-neutral-400">Qty: {{ item.quantity }}</div>
                       </div>
                    </div>
                 </div>

                 <div class="pt-3 border-t border-neutral-100 flex justify-between items-center">
                    <div class="text-base font-bold text-neutral-800">R{{ order.totalAmount | number:'1.0-0' }}</div>
                    <div class="flex gap-2">
                       <button *ngIf="order.status === 'PAID' || order.status === 'CONFIRMED' || order.status === 'PENDING'" 
                               (click)="updateStatus(order.id, 'SHIPPED')"
                               class="bg-emerald-600 text-white px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm active:scale-95 transition-all">Confirm</button>
                       <button [routerLink]="['/orders', order.id]" class="bg-white border border-neutral-300 text-neutral-600 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all">Details</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      } @else {
        <!-- DESKTOP ORDERS UI -->
        <div class="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
          <div class="flex justify-between items-end border-b border-neutral-200 pb-6">
             <div>
                <h1 class="text-3xl font-header font-bold text-neutral-charcoal tracking-tight">Manage Orders</h1>
                <p class="text-sm text-neutral-500 mt-1 font-medium">Process and fulfill incoming transmissions</p>
             </div>
             
             <div class="flex gap-4">
                 <div class="relative w-80 group">
                    <input type="text" placeholder="Search order ID, SKU, etc." class="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium shadow-inner">
                    <svg class="absolute left-3 top-2.5 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
                 <button class="bg-white border border-neutral-300 px-6 py-2 rounded-md hover:bg-neutral-50 shadow-sm font-bold uppercase text-[11px] tracking-widest text-neutral-600 transition-all">Export Report</button>
             </div>
          </div>

          <!-- Orders Table -->
          <div class="bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
              <div class="p-4 bg-neutral-50 border-b border-neutral-200 flex gap-8 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  <button (click)="activeTab.set('unshipped')" [class.text-primary]="activeTab() === 'unshipped'" [class.border-b-2]="activeTab() === 'unshipped'" [class.border-primary]="activeTab() === 'unshipped'" class="pb-1 transition-all">Unshipped ({{ getUnshippedCount() }})</button>
                  <button (click)="activeTab.set('pending')" [class.text-primary]="activeTab() === 'pending'" [class.border-b-2]="activeTab() === 'pending'" [class.border-primary]="activeTab() === 'pending'" class="pb-1 transition-all">Pending ({{ getCount('PENDING') }})</button>
                  <button (click)="activeTab.set('shipped')" [class.text-primary]="activeTab() === 'shipped'" [class.border-b-2]="activeTab() === 'shipped'" [class.border-primary]="activeTab() === 'shipped'" class="pb-1 transition-all">Shipped ({{ getCount('SHIPPED') }})</button>
                  <button (click)="activeTab.set('cancelled')" [class.text-primary]="activeTab() === 'cancelled'" [class.border-b-2]="activeTab() === 'cancelled'" [class.border-primary]="activeTab() === 'cancelled'" class="pb-1 transition-all">Cancelled ({{ getCount('CANCELLED') }})</button>
              </div>

              <div *ngIf="loading()" class="py-32 flex justify-center">
                   <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
              </div>

              <table class="w-full text-left text-sm" *ngIf="!loading()">
                  <thead class="bg-white border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                      <tr>
                          <th class="px-6 py-4 w-10"><input type="checkbox" class="rounded border-neutral-300 text-primary focus:ring-primary"></th>
                          <th class="px-4 py-4">Order Summary</th>
                          <th class="px-4 py-4">Product Attributes</th>
                          <th class="px-4 py-4">Fulfillment State</th>
                          <th class="px-4 py-4 text-right">Settlement</th>
                          <th class="px-6 py-4 text-center">Control</th>
                      </tr>
                  </thead>
                  <tbody class="divide-y divide-neutral-100">
                      <tr *ngFor="let order of filteredOrders()" class="hover:bg-neutral-50/50 transition-all group">
                          <td class="px-6 py-6"><input type="checkbox" class="rounded border-neutral-300 text-primary focus:ring-primary"></td>
                          <td class="px-4 py-6">
                             <div class="font-bold text-primary hover:underline cursor-pointer" [routerLink]="['/orders', order.id]">#{{ order.id.slice(0, 12).toUpperCase() }}</div>
                             <div class="text-[10px] font-medium text-neutral-400 mt-1 uppercase">{{ order.createdAt | date:'medium' }}</div>
                             <div class="text-[10px] text-neutral-500 mt-2 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                Ship to: <span class="font-bold text-neutral-700">Verified Customer</span>
                             </div>
                          </td>
                          <td class="px-4 py-6">
                              <div class="space-y-3">
                                 <div *ngFor="let item of order.items" class="flex gap-3 items-center">
                                    <div class="bg-neutral-50 border border-neutral-200 w-10 h-10 flex items-center justify-center p-1 rounded overflow-hidden">
                                        <img [src]="item.productImage" class="max-w-full max-h-full object-contain mix-blend-multiply">
                                    </div>
                                    <div>
                                        <div class="font-bold text-neutral-700 text-xs truncate max-w-[200px]">{{ item.productName }}</div>
                                        <div class="text-[9px] font-black text-neutral-400 uppercase tracking-tighter mt-0.5">QTY: {{ item.quantity }}</div>
                                    </div>
                                 </div>
                              </div>
                          </td>
                          <td class="px-4 py-6">
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm"
                                    [ngClass]="getStatusColor(order.status)">
                                {{ order.status }}
                              </span>
                          </td>
                          <td class="px-4 py-6 text-right">
                             <div class="text-base font-bold text-neutral-800 tracking-tight">R{{ order.totalAmount | number:'1.0-0' }}</div>
                             <div class="text-[9px] font-bold text-neutral-400 uppercase mt-1">Order Total</div>
                          </td>
                          <td class="px-6 py-6 text-center">
                              <div class="flex flex-col gap-2 items-center">
                                 <button *ngIf="order.status === 'PAID' || order.status === 'CONFIRMED' || order.status === 'PENDING'" 
                                         (click)="updateStatus(order.id, 'SHIPPED')"
                                         class="bg-emerald-600 text-white py-1.5 px-4 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm active:scale-95 transition-all w-32">
                                    Confirm Ship
                                 </button>
                                 <button [routerLink]="['/orders', order.id]" class="bg-white border border-neutral-300 text-neutral-700 py-1.5 px-4 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all w-32 shadow-sm">
                                    View Details
                                 </button>
                              </div>
                          </td>
                      </tr>
                      <tr *ngIf="filteredOrders().length === 0">
                          <td colspan="6" class="px-8 py-20 text-center text-neutral-400 font-bold uppercase tracking-widest">No active transmissions detected in this segment.</td>
                      </tr>
                  </tbody>
              </table>
              
              <div class="bg-neutral-50 border-t border-neutral-200 px-8 py-4 flex justify-between items-center text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                  <span>{{ filteredOrders().length }} transmissions in current segment</span>
                  <div class="flex items-center gap-4">
                      <button class="hover:text-primary transition-colors cursor-pointer disabled:opacity-30" disabled>Previous</button>
                      <span class="w-6 h-6 flex items-center justify-center bg-primary text-white rounded text-[10px] font-bold">1</span>
                      <button class="hover:text-primary transition-colors cursor-pointer disabled:opacity-30" disabled>Next</button>
                  </div>
              </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class VendorOrdersComponent implements OnInit {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private vendorService = inject(VendorService);

  orders = signal<any[]>([]);
  loading = signal(true);
  activeTab = signal<'unshipped' | 'pending' | 'shipped' | 'cancelled'>('unshipped');

  filteredOrders = computed(() => {
    const all = this.orders();
    const tab = this.activeTab();
    
    switch (tab) {
        case 'unshipped': 
            return all.filter(o => ['PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'PACKED'].includes(o.status));
        case 'pending': 
            return all.filter(o => o.status === 'PENDING' || o.status === 'PAID');
        case 'shipped': 
            return all.filter(o => ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status));
        case 'cancelled': 
            return all.filter(o => o.status === 'CANCELLED');
        default: 
            return all;
    }
  });

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading.set(true);
    this.vendorService.getOrders()
      .subscribe({
        next: (data) => {
            console.log('Fetched Vendor Orders:', data);
            this.orders.set(data || []);
            this.loading.set(false);
        },
        error: (err) => {
            console.error('Failed to load orders', err);
            this.loading.set(false);
        }
      });
  }

  onTabChange(tab: any) {
      this.activeTab.set(tab);
  }

  updateStatus(orderId: string, status: string) {
    if (!confirm(`Confirm shipment for order ${orderId}?`)) return;

    this.vendorService.updateOrderStatus(orderId, status).subscribe({
        next: () => {
            this.fetchOrders();
        },
        error: (err) => {
            console.error('Failed to update status', err);
            alert('Failed to update status');
        }
    });
  }

  getCount(status: string) {
      return this.orders().filter(o => o.status === status).length;
  }

  getUnshippedCount() {
      return this.orders().filter(o => ['PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'PACKED'].includes(o.status)).length;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'PROCESSING': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'SHIPPED': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'DELIVERED': return 'bg-neutral-50 text-neutral-700 border-neutral-100';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }
}
