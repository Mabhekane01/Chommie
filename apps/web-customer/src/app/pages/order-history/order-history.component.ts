import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Order History</h1>

      <div *ngIf="loading()" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>

      <div *ngIf="!loading() && orders().length === 0" class="text-center py-10 bg-white rounded-lg shadow">
        <p class="text-gray-500 text-xl">You haven't placed any orders yet.</p>
      </div>

      <div *ngIf="!loading() && orders().length > 0" class="space-y-6">
        <div *ngFor="let order of orders()" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-500">Order Placed</p>
              <p class="font-semibold">{{ order.createdAt | date }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Total</p>
              <p class="font-semibold">R{{ order.totalAmount | number:'1.2-2' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <span class="px-2 py-1 text-xs rounded-full font-semibold"
                [ngClass]="getStatusClass(order.status)">
                {{ order.status }}
              </span>
            </div>
            <div>
              <p class="text-sm text-gray-500">Order #</p>
              <p class="font-mono text-sm">{{ order.id.slice(0, 8) }}</p>
            </div>
          </div>

          <div class="p-6">
            <div *ngFor="let item of order.items" class="flex items-center gap-4 mb-4 last:mb-0">
              <div class="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                Img
              </div>
              <div class="flex-grow">
                <h4 class="font-semibold">{{ item.productName }}</h4>
                <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
              </div>
              <p class="font-semibold">R{{ item.price | number:'1.2-2' }}</p>
            </div>
            
            <div class="mt-4 pt-4 border-t flex justify-between items-center">
              <span class="text-sm text-gray-600">Payment Method: {{ order.paymentMethod }}</span>
              <button class="text-green-700 font-semibold hover:underline">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  orders = signal<any[]>([]);
  loading = signal(true);
  userId = '';

  constructor(private orderService: OrderService) {
    this.userId = localStorage.getItem('user_id') || '';
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getUserOrders(this.userId).subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.loading.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
