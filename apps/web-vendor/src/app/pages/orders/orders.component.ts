import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-8 text-gray-800">Order Management</h1>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let order of orders()">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ order.orderId.substring(0,8) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.createdAt | date:'short' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="getStatusColor(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                <div *ngFor="let item of order.items">
                  {{ item.quantity }}x {{ item.productName }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">R{{ order.totalAmount | number:'1.2-2' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-4">Details</button>
                <button *ngIf="order.status === 'PROCESSING' || order.status === 'PAID'" 
                        (click)="updateStatus(order.orderId, 'SHIPPED')"
                        class="text-green-600 hover:text-green-900 font-bold">
                   Ship Order
                </button>
                <span *ngIf="order.status === 'SHIPPED'" class="text-gray-400">Shipped</span>
              </td>
            </tr>
            <tr *ngIf="orders().length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">No orders found for this vendor.</td>
            </tr>
          </tbody>
        </table>
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
    if (!confirm(`Mark order #${orderId.substring(0,8)} as ${status}?`)) return;

    this.orderService.updateStatus(orderId, status).subscribe({
        next: () => {
            this.fetchOrders(); // Refresh
        },
        error: (err) => alert('Failed to update status')
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
