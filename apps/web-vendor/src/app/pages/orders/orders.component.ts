import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      <!-- Standard Vendor Nav -->
      <nav class="bg-white border-b border-neutral-300 px-8 py-3 flex justify-between items-center sticky top-0 z-50">
          <div class="flex items-center gap-8">
              <a routerLink="/" class="font-header font-bold text-2xl tracking-tight text-neutral-charcoal flex items-center gap-1">
                Chommie<span class="text-primary">.central</span>
              </a>
              <div class="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
                  <a routerLink="/dashboard" class="hover:text-primary transition-colors">Dashboard</a>
                  <a href="#" class="hover:text-primary transition-colors">Catalog</a>
                  <a routerLink="/orders" class="hover:text-primary transition-colors text-primary font-bold">Orders</a>
              </div>
          </div>
          <div class="flex items-center gap-4">
              <input type="text" placeholder="Search order ID, ASIN, etc." class="border border-neutral-300 rounded-md px-3 py-1 text-sm w-64 shadow-inner focus:ring-primary focus:border-primary outline-none">
          </div>
      </nav>

      <div class="p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
        
        <div class="flex justify-between items-center">
           <h1 class="text-3xl font-header font-bold text-neutral-charcoal">Manage Orders</h1>
           
           <div class="flex gap-2 text-sm">
               <button class="bg-white border border-neutral-300 px-4 py-1.5 rounded-md hover:bg-neutral-50 shadow-sm font-medium text-neutral-700">Export Orders</button>
               <button class="bg-white border border-neutral-300 px-4 py-1.5 rounded-md hover:bg-neutral-50 shadow-sm font-medium text-neutral-700">Print Packing Slips</button>
           </div>
        </div>

        <!-- Filters -->
        <div class="bg-white border border-neutral-300 rounded-lg p-4 flex gap-4 text-sm shadow-sm">
            <div class="flex items-center gap-2 border-r border-neutral-200 pr-4">
                <span class="font-bold text-neutral-600">Filter by:</span>
                <select class="border border-neutral-300 rounded px-2 py-1 outline-none bg-neutral-50">
                    <option>Ship by date: Ascending</option>
                    <option>Order date: Descending</option>
                </select>
            </div>
            <div class="flex gap-4 font-medium text-neutral-600">
                <button class="text-primary font-bold border-b-2 border-primary pb-4 -mb-4.5">Unshipped ({{ getCount('PAID') + getCount('PROCESSING') }})</button>
                <button class="hover:text-primary">Pending</button>
                <button class="hover:text-primary">Shipped</button>
                <button class="hover:text-primary">Cancelled</button>
            </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
            <table class="w-full text-sm text-left">
                <thead class="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wide">
                    <tr>
                        <th class="px-6 py-3 w-10">
                            <input type="checkbox" class="rounded border-neutral-300 text-primary focus:ring-primary">
                        </th>
                        <th class="px-6 py-3">Order Details</th>
                        <th class="px-6 py-3">Product Name</th>
                        <th class="px-6 py-3">Status</th>
                        <th class="px-6 py-3 text-right">Proceeds</th>
                        <th class="px-6 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-neutral-200">
                    <tr *ngFor="let order of orders()" class="hover:bg-neutral-50 transition-colors">
                        <td class="px-6 py-4">
                            <input type="checkbox" class="rounded border-neutral-300 text-primary focus:ring-primary">
                        </td>
                        <td class="px-6 py-4">
                           <div class="font-bold text-primary hover:underline cursor-pointer">{{ order.orderId }}</div>
                           <div class="text-xs text-neutral-500 mt-1">{{ order.createdAt | date:'medium' }}</div>
                           <div class="text-xs text-neutral-600 mt-1">Ship to: <span class="font-bold">Customer</span></div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="space-y-2">
                               <div *ngFor="let item of order.items" class="flex gap-3 items-center">
                                  <div class="bg-neutral-100 border border-neutral-200 w-8 h-8 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                                      {{ item.quantity }}x
                                  </div>
                                  <div>
                                      <div class="font-medium text-neutral-700 line-clamp-1 max-w-[250px]">{{ item.productName }}</div>
                                      <div class="text-xs text-neutral-500">SKU: {{ item.sku || 'N/A' }}</div>
                                  </div>
                               </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                                  [ngClass]="getStatusColor(order.status)">
                              {{ order.status.toLowerCase().replace('_', ' ') }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right font-bold text-neutral-800">
                           R{{ order.totalAmount | number:'1.0-0' }}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <div class="flex flex-col gap-2 items-center">
                               <button *ngIf="order.status === 'PROCESSING' || order.status === 'PAID'" 
                                       (click)="updateStatus(order.orderId, 'SHIPPED')"
                                       class="btn-primary py-1 px-4 text-xs rounded shadow-sm w-28">
                                  Confirm Shipment
                               </button>
                               <button class="btn-secondary py-1 px-4 text-xs rounded shadow-sm w-28">
                                  Print Slip
                               </button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="orders().length === 0">
                        <td colspan="6" class="px-6 py-20 text-center text-neutral-500 italic">No orders found matching your filters.</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="bg-neutral-50 border-t border-neutral-200 px-6 py-3 flex justify-between items-center text-xs text-neutral-500">
                <span>Showing {{ orders().length }} orders</span>
                <div class="flex gap-2">
                    <button class="hover:underline">Previous</button>
                    <span>1</span>
                    <button class="hover:underline">Next</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class VendorOrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  vendorId = ''; 

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.vendorId = localStorage.getItem('vendor_id') || 'vendor-1';
    this.fetchOrders();
  }

  fetchOrders() {
    this.orderService.getVendorOrders(this.vendorId)
      .subscribe({
        next: (data) => this.orders.set(data),
        error: (err) => console.error('Failed to load orders', err)
      });
  }

  updateStatus(orderId: string, status: string) {
    if (!confirm(`Confirm shipment for order ${orderId}?`)) return;

    this.orderService.updateStatus(orderId, status).subscribe({
        next: () => {
            this.fetchOrders();
        },
        error: (err) => alert('Failed to update status')
    });
  }

  getCount(status: string) {
      return this.orders().filter(o => o.status === status).length;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-emerald-100 text-emerald-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}