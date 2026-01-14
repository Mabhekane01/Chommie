import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorService, VendorOrder } from '../../services/vendor.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      <!-- Vendor Navigation (Standard) -->
      <nav class="bg-white border-b border-neutral-300 px-8 py-3 flex justify-between items-center sticky top-0 z-50">
          <div class="flex items-center gap-8">
              <a routerLink="/" class="font-header font-bold text-2xl tracking-tight text-neutral-charcoal flex items-center gap-1">
                Chommie<span class="text-primary">.central</span>
              </a>
              <div class="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
                  <a href="#" class="hover:text-primary transition-colors">Inventory</a>
                  <a href="#" class="hover:text-primary transition-colors">Orders</a>
                  <a href="#" class="hover:text-primary transition-colors">Analytics</a>
              </div>
          </div>
          <div class="flex items-center gap-4">
              <div class="text-xs text-neutral-500 hidden sm:block">
                  Store ID: <span class="font-mono text-neutral-700">v123_nexus</span>
              </div>
              <button class="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              </button>
              <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                  VN
              </div>
          </div>
      </nav>

      <div class="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
        
        <!-- Welcome & Primary Action -->
        <div class="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-neutral-200 pb-6">
          <div>
             <h1 class="text-3xl font-header font-bold text-neutral-charcoal">Dashboard</h1>
             <p class="text-neutral-500 text-sm mt-1">
                Overview of your store performance
             </p>
          </div>
          <a routerLink="/products/create" class="btn-primary flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
            Add New Product
          </a>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
            <span class="text-xs font-bold text-neutral-500 uppercase tracking-wide">Total Sales</span>
            <div class="mt-2 flex items-baseline gap-2">
                <div class="text-3xl font-header font-bold text-neutral-charcoal">R{{ totalSales() | number:'1.0-0' }}</div>
                <div class="text-xs font-bold text-emerald-600 flex items-center">
                    <span>▲</span> 12.4%
                </div>
            </div>
          </div>

          <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
            <span class="text-xs font-bold text-neutral-500 uppercase tracking-wide">Open Orders</span>
            <div class="mt-2">
                <div class="text-3xl font-header font-bold text-neutral-charcoal">{{ activeOrders() }}</div>
                <div class="text-xs text-neutral-500 mt-1">{{ pendingShipment() }} waiting for shipment</div>
            </div>
          </div>

          <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
            <span class="text-xs font-bold text-neutral-500 uppercase tracking-wide">Active Listings</span>
            <div class="mt-2">
                <div class="text-3xl font-header font-bold text-neutral-charcoal">{{ totalProducts() }}</div>
                <a href="#" class="text-xs text-primary hover:underline mt-1 block">Manage Inventory</a>
            </div>
          </div>

          <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
            <span class="text-xs font-bold text-neutral-500 uppercase tracking-wide">Account Health</span>
            <div class="mt-2">
                <div class="text-3xl font-header font-bold text-emerald-600">Good</div>
                <div class="text-xs text-neutral-500 mt-1">0 Policy Violations</div>
            </div>
          </div>

        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <!-- Sector Distribution -->
            <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm">
                <h2 class="font-header font-bold text-neutral-charcoal text-lg mb-6">
                   Sales by Category
                </h2>
                <div class="space-y-6">
                    <div *ngFor="let cat of salesByCategory()" class="space-y-2">
                        <div class="flex justify-between items-end text-sm">
                            <span class="font-medium text-neutral-600">{{ cat.name }}</span>
                            <span class="font-bold text-neutral-charcoal">R{{ cat.total | number:'1.0-0' }}</span>
                        </div>
                        <div class="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div class="h-full bg-primary rounded-full" [style.width.%]="cat.percentage"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Performance Nodes -->
            <div class="lg:col-span-2 bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
                <div class="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
                    <h2 class="font-header font-bold text-neutral-charcoal text-lg">Top Selling Products</h2>
                    <span class="text-xs font-bold text-neutral-500 uppercase">Last 30 Days</span>
                </div>
                <div class="divide-y divide-neutral-200">
                    <div *ngFor="let p of topProducts()" class="p-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors">
                        <div class="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-md flex items-center justify-center p-1">
                           <span class="text-[8px] font-bold text-neutral-400">IMG</span>
                        </div>
                        <div class="flex-grow">
                            <div class="text-sm font-bold text-neutral-charcoal">{{ p.name }}</div>
                            <div class="text-xs text-neutral-500">Unit Price: R{{ p.price | number:'1.0-0' }}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-neutral-charcoal">{{ p.unitsSold }}</div>
                            <div class="text-xs text-neutral-400">Sold</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Transmission Stream (Recent Orders) -->
            <div class="lg:col-span-2 bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
                <div class="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
                    <h2 class="font-header font-bold text-neutral-charcoal text-lg">Recent Orders</h2>
                    <a routerLink="/orders" class="text-sm font-bold text-primary hover:underline">View All</a>
                </div>
                <div class="divide-y divide-neutral-200">
                    <div *ngFor="let order of recentOrders()" class="p-4 hover:bg-neutral-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div class="space-y-1 flex-grow">
                            <div class="flex items-center gap-3">
                                <span class="text-sm font-bold text-primary font-mono">{{ order.id.slice(0, 10).toUpperCase() }}</span>
                                <span class="text-xs text-neutral-400">{{ order.createdAt | date:'medium' }}</span>
                            </div>
                            <div class="text-sm text-neutral-600">
                                <span *ngFor="let item of order.items" class="mr-3">
                                    {{ item.quantity }}x {{ item.productName }}
                                </span>
                            </div>
                        </div>
                        <div class="text-right flex items-center gap-4">
                            <div class="text-lg font-bold text-neutral-charcoal">R{{ order.totalAmount | number:'1.0-0' }}</div>
                            <span class="inline-block px-2 py-1 text-xs rounded border font-bold"
                                [ngClass]="{
                                    'bg-emerald-50 text-emerald-700 border-emerald-200': order.status === 'PAID' || order.status === 'COMPLETED',
                                    'bg-amber-50 text-amber-700 border-amber-200': order.status === 'PENDING',
                                    'bg-blue-50 text-blue-700 border-blue-200': order.status === 'SHIPPED',
                                    'bg-neutral-50 text-neutral-600 border-neutral-200': order.status === 'PROCESSING'
                                }">
                                {{ order.status }}
                            </span>
                        </div>
                    </div>
                    <div *ngIf="recentOrders().length === 0" class="p-10 text-center text-neutral-400 text-sm italic">
                        No recent orders found.
                    </div>
                </div>
            </div>

            <!-- News & System Alerts -->
            <div class="bg-white border border-neutral-300 rounded-lg shadow-sm h-fit overflow-hidden">
                <div class="p-6 border-b border-neutral-200 bg-neutral-50/50">
                    <h2 class="font-header font-bold text-neutral-charcoal text-lg">News & Alerts</h2>
                </div>
                <div class="p-6 space-y-6">
                    <div class="space-y-2">
                        <span class="block text-xs font-bold text-primary uppercase tracking-wide">Policy Update</span>
                        <p class="text-sm text-neutral-600 leading-relaxed">Effective next month, referral fees for Electronics will be adjusted. Please review the new fee schedule.</p>
                        <a href="#" class="text-xs font-bold text-primary hover:underline block mt-1">Read More -></a>
                    </div>
                    
                    <div class="h-px bg-neutral-200"></div>

                    <div class="space-y-2">
                        <span class="block text-xs font-bold text-neutral-500 uppercase tracking-wide">Tip</span>
                        <p class="text-sm text-neutral-600 leading-relaxed">Stock up for the upcoming holiday season! Forecasts show a 20% increase in demand.</p>
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
  
  salesByCategory = signal<{name: string, total: number, percentage: number}[]>([]);
  topProducts = signal<{name: string, price: number, unitsSold: number}[]>([]);

  constructor(private vendorService: VendorService) {}

  ngOnInit() {
    this.vendorService.getOrders().subscribe(orders => {
        this.recentOrders.set(orders.slice(0, 5));
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

    const categoryTotals = [
        { name: 'Electronics', total: this.totalSales() * 0.65 },
        { name: 'Home', total: this.totalSales() * 0.25 },
        { name: 'Other', total: this.totalSales() * 0.10 }
    ];
    const max = Math.max(...categoryTotals.map(c => c.total));
    this.salesByCategory.set(categoryTotals.map(c => ({
        ...c,
        percentage: (c.total / max) * 100
    })));
  }
}