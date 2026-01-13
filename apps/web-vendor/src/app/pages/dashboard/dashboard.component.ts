import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorService, VendorOrder } from '../../services/vendor.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-amazon-bg min-h-screen">
      <!-- Navbar (Glass Vendor) -->
      <nav class="glass-green px-6 py-2 flex justify-between items-center z-50 sticky top-0">
          <div class="flex items-center gap-4 text-white">
              <span class="text-xl font-bold tracking-tight">Chommie <span class="font-normal text-gray-300 text-sm uppercase tracking-wide">Seller Central</span></span>
              <div class="h-6 w-px bg-white/20"></div>
              <a href="#" class="text-sm font-bold text-gray-200 hover:text-white transition-colors">Inventory</a>
              <a href="#" class="text-sm font-bold text-gray-200 hover:text-white transition-colors">Orders</a>
              <a href="#" class="text-sm font-bold text-gray-200 hover:text-white transition-colors">Reports</a>
          </div>
          <div class="text-sm text-gray-300">
              store_v123 | <a href="#" class="text-white hover:underline">Settings</a>
          </div>
      </nav>

      <div class="p-6 max-w-[1400px] mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-[#111111]">Dashboard</h1>
          <a routerLink="/products/create" class="glass-btn hover:bg-action-hover text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add a Product
          </a>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          
          <div class="glass-panel p-4 border-t-4 border-t-primary hover:scale-105 transition-transform duration-300">
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Today's Sales</p>
            <p class="text-2xl font-bold text-[#111111]">R{{ totalSales() | number:'1.2-2' }}</p>
            <p class="text-xs text-green-600 mt-1 flex items-center gap-1">
                <span>▲ 12%</span> <span class="text-gray-400">vs last week</span>
            </p>
          </div>

          <div class="glass-panel p-4 border-t-4 border-t-[#FFA41C] hover:scale-105 transition-transform duration-300">
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Open Orders</p>
            <p class="text-2xl font-bold text-[#111111]">{{ activeOrders() }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ pendingShipment() }} requiring action</p>
          </div>

          <div class="glass-panel p-4 border-t-4 border-t-[#007185] hover:scale-105 transition-transform duration-300">
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Products</p>
            <p class="text-2xl font-bold text-[#111111]">{{ totalProducts() }}</p>
            <p class="text-xs text-amazon-link mt-1 hover:underline cursor-pointer">View Inventory</p>
          </div>

          <div class="glass-panel p-4 border-t-4 border-t-gray-400 hover:scale-105 transition-transform duration-300">
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account Health</p>
            <p class="text-xl font-bold text-green-600">Good</p>
            <p class="text-xs text-gray-400 mt-1">Rating: 4.8/5</p>
          </div>

        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- Sales by Category (Visual Chart) -->
            <div class="glass-panel p-4">
                <h2 class="font-bold text-[#111111] mb-4">Sales by Category</h2>
                <div class="space-y-4">
                    <div *ngFor="let cat of salesByCategory()" class="space-y-1">
                        <div class="flex justify-between text-xs font-bold text-gray-600">
                            <span>{{ cat.name }}</span>
                            <span>R{{ cat.total | number:'1.0-0' }}</span>
                        </div>
                        <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-primary transition-all duration-1000" [style.width.%]="cat.percentage"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Selling Products -->
            <div class="lg:col-span-2 glass-panel">
                <div class="p-4 border-b border-gray-200/50 flex justify-between items-center bg-gray-50/30">
                    <h2 class="font-bold text-[#111111]">Top Selling Products</h2>
                    <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">Units Sold</span>
                </div>
                <div class="divide-y divide-gray-100/50">
                    <div *ngFor="let p of topProducts()" class="p-3 flex items-center gap-4 hover:bg-white/40 transition-colors">
                        <div class="w-10 h-10 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">IMG</div>
                        <div class="flex-grow">
                            <div class="text-sm font-medium line-clamp-1">{{ p.name }}</div>
                            <div class="text-xs text-gray-500">R{{ p.price | number:'1.2-2' }} each</div>
                        </div>
                        <div class="font-bold text-lg text-primary">{{ p.unitsSold }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Recent Orders Widget -->
            <div class="lg:col-span-2 glass-panel">
                <div class="p-4 border-b border-gray-200/50 flex justify-between items-center bg-gray-50/30">
                    <h2 class="font-bold text-[#111111]">Recent Orders</h2>
                    <a routerLink="/orders" class="text-sm text-amazon-link hover:underline hover:text-action">View All</a>
                </div>
                <div class="divide-y divide-gray-100/50">
                    <div *ngFor="let order of recentOrders()" class="p-4 hover:bg-white/40 transition-colors flex justify-between items-center">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-bold text-amazon-link cursor-pointer hover:underline">{{ order.id.slice(0, 10) }}...</span>
                                <span class="text-xs text-gray-500">{{ order.createdAt | date:'short' }}</span>
                            </div>
                            <div class="text-sm text-[#111111]">
                                <span *ngFor="let item of order.items" class="block">
                                    {{ item.quantity }}x {{ item.productName }}
                                </span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-[#111111]">R{{ order.totalAmount | number:'1.2-2' }}</div>
                            <span class="inline-block px-2 py-0.5 text-[10px] rounded border uppercase font-bold mt-1"
                                [ngClass]="{
                                    'bg-green-100 text-green-800 border-green-200': order.status === 'PAID' || order.status === 'COMPLETED',
                                    'bg-yellow-50 text-yellow-800 border-yellow-200': order.status === 'PENDING',
                                    'bg-blue-50 text-blue-800 border-blue-200': order.status === 'SHIPPED',
                                    'bg-gray-100 text-gray-800 border-gray-200': order.status === 'PROCESSING'
                                }">
                                {{ order.status }}
                            </span>
                        </div>
                    </div>
                    <div *ngIf="recentOrders().length === 0" class="p-8 text-center text-gray-500">
                        No orders to display.
                    </div>
                </div>
            </div>

            <!-- News / Actions Widget -->
            <div class="glass-panel h-fit">
                <div class="p-4 border-b border-gray-200/50 bg-gray-50/30">
                    <h2 class="font-bold text-[#111111]">News & Alerts</h2>
                </div>
                <div class="p-4 space-y-4">
                    <div class="text-sm">
                        <span class="block font-bold text-gray-800 mb-1">New Fee Schedule</span>
                        <p class="text-gray-600 leading-tight">Effective Jan 15, referral fees for Electronics will change.</p>
                        <a href="#" class="text-xs text-amazon-link hover:underline block mt-1">Read more</a>
                    </div>
                    <hr class="border-gray-100/50">
                    <div class="text-sm">
                        <span class="block font-bold text-gray-800 mb-1">Holiday Settings</span>
                        <p class="text-gray-600 leading-tight">Review your shipping settings for the upcoming holiday season.</p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  `
})
export class VendorDashboardComponent implements OnInit {
  totalSales = signal(0);
  activeOrders = signal(0);
  pendingShipment = signal(0);
  totalProducts = signal(0);
  recentOrders = signal<VendorOrder[]>([]);
  
  // Analytics Signals
  salesByCategory = signal<{name: string, total: number, percentage: number}[]>([]);
  topProducts = signal<{name: string, price: number, unitsSold: number}[]>([]);

  constructor(private vendorService: VendorService) {}

  ngOnInit() {
    this.vendorService.getOrders().subscribe(orders => {
        this.recentOrders.set(orders.slice(0, 5));
        
        // Calculate Stats
        const sales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        this.totalSales.set(sales);
        
        const active = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
        this.activeOrders.set(active);

        const pending = orders.filter(o => o.status === 'PAID' || o.status === 'PROCESSING').length;
        this.pendingShipment.set(pending);

        this.calculateAnalytics(orders);
    });

    this.vendorService.getProducts().subscribe((products: any[]) => {
        this.totalProducts.set(products.length);
    });
  }

  calculateAnalytics(orders: any[]) {
    // 1. Calculate Top Products
    const productStats = new Map<string, any>();
    orders.forEach(order => {
        order.items.forEach((item: any) => {
            const current = productStats.get(item.productName) || { name: item.productName, price: item.price, unitsSold: 0 };
            current.unitsSold += item.quantity;
            productStats.set(item.productName, current);
        });
    });
    const sortedProducts = Array.from(productStats.values())
        .sort((a, b) => b.unitsSold - a.unitsSold)
        .slice(0, 5);
    this.topProducts.set(sortedProducts);

    // 2. Mock Sales by Category (since Order items don't store category currently)
    // In a real app, we'd join with product data or store category in OrderItem
    // For now, let's derive it or use common categories for the demo
    const categoryTotals = [
        { name: 'Electronics', total: this.totalSales() * 0.65 },
        { name: 'Home & Kitchen', total: this.totalSales() * 0.25 },
        { name: 'Other', total: this.totalSales() * 0.10 }
    ];
    const max = Math.max(...categoryTotals.map(c => c.total));
    this.salesByCategory.set(categoryTotals.map(c => ({
        ...c,
        percentage: (c.total / max) * 100
    })));
  }
}