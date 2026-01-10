import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorService, VendorOrder } from '../../services/vendor.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-gray-900">Vendor Portal</h1>
            </div>
            <div class="flex items-center">
              <span class="text-gray-500 mr-4">Welcome, Vendor</span>
              <button routerLink="/products/create" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add Product
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">R{{ totalRevenue() | number:'1.2-2' }}</dd>
            </div>
          </div>
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">Active Orders</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ activeOrders() }}</dd>
            </div>
          </div>
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">Products Listed</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">12</dd>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Orders</h3>
          </div>
          <ul class="divide-y divide-gray-200">
            <li *ngFor="let order of orders()">
              <div class="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                <div class="flex items-center justify-between">
                  <div class="text-sm font-medium text-indigo-600 truncate">
                    Order #{{ order.id }}
                  </div>
                  <div class="ml-2 flex-shrink-0 flex">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="order.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                      {{ order.status }}
                    </span>
                  </div>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500">
                      R{{ order.totalAmount | number:'1.2-2' }}
                    </p>
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Placed on {{ order.createdAt | date:'mediumDate' }}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  orders = signal<VendorOrder[]>([]);
  totalRevenue = signal(0);
  activeOrders = signal(0);

  constructor(private vendorService: VendorService) {}

  ngOnInit() {
    this.vendorService.getOrders().subscribe(data => {
      this.orders.set(data);
      this.calculateStats(data);
    });
  }

  calculateStats(orders: VendorOrder[]) {
    const revenue = orders
      .filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    this.totalRevenue.set(revenue);
    
    const active = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
    this.activeOrders.set(active);
  }
}
