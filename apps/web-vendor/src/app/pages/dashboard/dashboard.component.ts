import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorService, VendorOrder } from '../../services/vendor.service';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE DASHBOARD UI -->
        <div class="p-4 space-y-6 animate-fade-in">
           <!-- Welcome Header -->
           <div class="flex justify-between items-start pt-2">
              <div>
                 <h1 class="text-xl font-bold">Seller Home</h1>
                 <p class="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Store ID: {{ vendorName() || 'v123' }}</p>
              </div>
              <a routerLink="/products/create" class="bg-primary text-white p-3 rounded-md shadow-sm">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
              </a>
           </div>

           <!-- Metrics Mobile -->
           <div class="grid grid-cols-2 gap-3">
              <div class="bg-white p-4 border border-neutral-300 rounded-lg shadow-sm">
                 <span class="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Total Sales</span>
                 <div class="text-lg font-bold mt-1">R{{ totalSales() | number:'1.0-0' }}</div>
                 <div class="text-[9px] font-bold text-emerald-600">▲ 12% growth</div>
              </div>
              <div class="bg-white p-4 border border-neutral-300 rounded-lg shadow-sm">
                 <span class="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Current Orders</span>
                 <div class="text-lg font-bold mt-1">{{ activeOrders() }}</div>
                 <div class="text-[9px] font-bold text-primary">{{ pendingShipment() }} to ship</div>
              </div>
              <div class="bg-white p-4 border border-neutral-300 rounded-lg shadow-sm">
                 <span class="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Products</span>
                 <div class="text-lg font-bold mt-1">{{ totalProducts() }}</div>
                 <div class="text-[9px] font-bold text-neutral-400">Total Listings</div>
              </div>
              <div class="bg-white p-4 border border-neutral-300 rounded-lg shadow-sm">
                 <span class="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Account Health</span>
                 <div class="text-lg font-bold mt-1 text-emerald-600">Healthy</div>
                 <div class="text-[9px] font-bold text-neutral-400">Good standing</div>
              </div>
           </div>

           <!-- Sales by Category -->
           <div class="bg-white p-5 border border-neutral-300 rounded-lg shadow-sm">
              <h2 class="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Sales by Category</h2>
              <div class="space-y-4">
                 <div *ngFor="let cat of salesByCategory().slice(0, 2)" class="space-y-1">
                    <div class="flex justify-between items-end">
                       <span class="text-[11px] font-bold text-neutral-600">{{ cat.name }}</span>
                       <span class="text-[11px] font-bold">R{{ cat.total | number:'1.0-0' }}</span>
                    </div>
                    <div class="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                       <div class="h-full bg-primary" [style.width.%]="cat.percentage"></div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Recent Orders Mobile -->
           <div class="space-y-4">
              <div class="flex justify-between items-end px-1">
                 <h2 class="text-xs font-bold uppercase tracking-widest text-neutral-500">Recent Orders</h2>
                 <a routerLink="/orders" class="text-[10px] font-bold text-primary uppercase tracking-widest">View All</a>
              </div>
              <div class="space-y-3">
                 <div *ngFor="let order of recentOrders().slice(0, 3)" class="bg-white p-4 border border-neutral-300 rounded-lg shadow-sm flex justify-between items-center">
                    <div class="space-y-1">
                       <div class="text-[11px] font-bold">Order #{{ order.id.slice(0, 8).toUpperCase() }}</div>
                       <div class="text-[9px] font-medium text-neutral-400 tracking-tighter">{{ order.createdAt | date:'mediumDate' }}</div>
                    </div>
                    <div class="text-right">
                       <div class="text-[11px] font-bold text-neutral-800">R{{ order.totalAmount | number:'1.0-0' }}</div>
                       <div class="text-[8px] font-bold px-1.5 py-0.5 rounded border border-neutral-200 mt-1 inline-block uppercase tracking-widest"
                            [ngClass]="{
                                'bg-emerald-50 text-emerald-700 border-emerald-100': order.status === 'PAID' || order.status === 'COMPLETED',
                                'bg-amber-50 text-amber-700 border-amber-200': order.status === 'PENDING'
                            }">{{ order.status }}</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      } @else {
        <!-- DESKTOP DASHBOARD UI -->
        <div class="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
          
          <!-- Desktop Header -->
          <div class="flex justify-between items-end gap-6 border-b border-neutral-200 pb-6">
            <div>
               <h1 class="text-3xl font-header font-bold text-neutral-charcoal">Seller Central Dashboard</h1>
               <p class="text-sm text-neutral-500 mt-1">Manage your business for <span class="font-bold text-neutral-700 underline">{{ vendorName() || 'Your Store' }}</span></p>
            </div>
            <a routerLink="/products/create" class="btn-primary flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
              Add a Product
            </a>
          </div>

          <!-- Metric Cards Desktop -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm hover:shadow transition-shadow">
              <span class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total Sales</span>
              <div class="mt-2 flex items-baseline gap-2">
                  <div class="text-3xl font-bold text-neutral-800 tracking-tight">R{{ totalSales() | number:'1.0-0' }}</div>
                  <div class="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      <span>▲</span> 12%
                  </div>
              </div>
            </div>

            <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm hover:shadow transition-shadow">
              <span class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Pending Orders</span>
              <div class="mt-2">
                  <div class="text-3xl font-bold text-neutral-800 tracking-tight">{{ activeOrders() }}</div>
                  <div class="text-xs text-neutral-500 font-medium mt-1">{{ pendingShipment() }} orders ready to ship</div>
              </div>
            </div>

            <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm hover:shadow transition-shadow">
              <span class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Active Listings</span>
              <div class="mt-2">
                  <div class="text-3xl font-bold text-neutral-800 tracking-tight">{{ totalProducts() }}</div>
                  <a routerLink="/inventory" class="text-xs text-primary font-bold hover:underline mt-1 block">Manage Stock</a>
              </div>
            </div>

            <div class="bg-white border border-neutral-300 rounded-lg p-6 shadow-sm hover:shadow transition-shadow">
              <span class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Customer Satisfaction</span>
              <div class="mt-2">
                  <div class="text-3xl font-bold text-emerald-600 tracking-tight uppercase">{{ satisfactionLevel() }}</div>
                  <div class="text-xs text-neutral-500 font-medium mt-1">{{ avgRating() | number:'1.1-1' }} Avg Rating ({{ numReviews() }} Reviews)</div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <!-- Sales Analytics -->
              <div class="bg-white border border-neutral-300 rounded-lg p-8 shadow-sm">
                  <h2 class="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-8">Sales by Category</h2>
                  <div class="space-y-8">
                      <div *ngFor="let cat of salesByCategory()" class="space-y-3">
                          <div class="flex justify-between items-end text-xs">
                              <span class="font-bold uppercase tracking-tighter text-neutral-600">{{ cat.name }}</span>
                              <span class="font-bold text-neutral-800 tracking-tight">R{{ cat.total | number:'1.0-0' }}</span>
                          </div>
                          <div class="h-2 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                              <div class="h-full bg-primary" [style.width.%]="cat.percentage"></div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Top Products List -->
              <div class="lg:col-span-2 bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
                  <div class="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
                      <h2 class="text-sm font-bold text-neutral-500 uppercase tracking-widest">Best Sellers</h2>
                      <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Last 30 Days</span>
                  </div>
                  <div class="divide-y divide-neutral-200">
                      <div *ngFor="let p of topProducts()" class="p-6 flex items-center gap-6 hover:bg-neutral-50 transition-all group">
                          <div class="w-16 h-16 bg-white border border-neutral-200 rounded-lg flex items-center justify-center p-2 shadow-sm group-hover:border-primary/20 transition-all">
                             <img src="https://m.media-amazon.com/images/I/71qid7QFWJL._SX3000_.jpg" class="max-w-full max-h-full object-contain mix-blend-multiply">
                          </div>
                          <div class="flex-grow">
                              <div class="text-sm font-bold text-neutral-800 uppercase tracking-tight">{{ p.name }}</div>
                              <div class="text-xs text-neutral-400 font-medium mt-1">Price: R{{ p.price | number:'1.0-0' }}</div>
                          </div>
                          <div class="text-right">
                              <div class="text-xl font-bold text-neutral-800 tracking-tight">{{ p.unitsSold }}</div>
                              <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Units Sold</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Recent Orders -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
                  <div class="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
                      <h2 class="text-sm font-bold text-neutral-500 uppercase tracking-widest">Recent Orders</h2>
                      <a routerLink="/orders" class="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View All</a>
                  </div>
                  <div class="divide-y divide-neutral-200">
                      <div *ngFor="let order of recentOrders()" class="p-6 hover:bg-neutral-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm">
                          <div class="space-y-2 flex-grow">
                              <div class="flex items-center gap-4">
                                  <span class="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded">#{{ order.id.slice(0, 8).toUpperCase() }}</span>
                                  <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{{ order.createdAt | date:'medium' }}</span>
                              </div>
                              <div class="text-xs font-bold text-neutral-600">
                                  <span *ngFor="let item of order.items" class="mr-4 text-neutral-500">
                                      {{ item.quantity }}x <span class="text-neutral-800">{{ item.productName }}</span>
                                  </span>
                              </div>
                          </div>
                          <div class="text-right flex items-center gap-6 shrink-0">
                              <div class="text-xl font-bold text-neutral-800 tracking-tight">R{{ order.totalAmount | number:'1.0-0' }}</div>
                              <span class="inline-block px-3 py-1 text-[9px] font-bold rounded-md border uppercase tracking-widest shadow-sm"
                                  [ngClass]="{
                                      'bg-emerald-50 text-emerald-700 border-emerald-200': order.status === 'PAID' || order.status === 'COMPLETED',
                                      'bg-amber-50 text-amber-700 border-amber-200': order.status === 'PENDING',
                                      'bg-blue-50 text-blue-700 border-blue-200': order.status === 'SHIPPED'
                                  }">
                                  {{ order.status }}
                              </span>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- System Alerts -->
              <div class="bg-[#131921] rounded-lg p-8 text-white shadow-lg relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <h2 class="text-sm font-bold uppercase tracking-widest text-white/40 mb-8 relative z-10">Seller News</h2>
                  <div class="space-y-8 relative z-10 text-xs">
                      <div class="space-y-3">
                          <span class="inline-block text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/30 px-2 py-0.5 rounded">Update</span>
                          <p class="font-medium text-white/70 leading-relaxed">Referral fees for Electronics will be updated next month.</p>
                          <a href="#" class="text-[10px] font-bold text-white hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest underline">Read More</a>
                      </div>
                      
                      <div class="h-px bg-white/10"></div>

                      <div class="space-y-3">
                          <span class="inline-block text-[10px] font-bold text-white/40 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded">Tips</span>
                          <p class="font-medium text-white/70 leading-relaxed">We expect high demand for Home products soon. Check your stock levels.</p>
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
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class VendorDashboardComponent implements OnInit {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private vendorService = inject(VendorService);

  vendorName = signal(localStorage.getItem('user_name') || 'Your Store');
  totalSales = signal(0);
  activeOrders = signal(0);
  pendingShipment = signal(0);
  totalProducts = signal(0);
  recentOrders = signal<VendorOrder[]>([]);
  
  avgRating = signal(0);
  numReviews = signal(0);
  satisfactionLevel = signal('N/A');
  
  salesByCategory = signal<{name: string, total: number, percentage: number}[]>([]);
  topProducts = signal<{name: string, price: number, unitsSold: number}[]>([]);

  ngOnInit() {
    const vendorId = localStorage.getItem('vendor_id') || 'vendor-1';

    this.vendorService.getVendorProfile(vendorId).subscribe(profile => {
        if (profile) {
            this.avgRating.set(profile.sellerRating || 0);
            this.numReviews.set(profile.numSellerRatings || 0);
            const level = this.avgRating() >= 4.5 ? 'Elite' : (this.avgRating() >= 4.0 ? 'High' : (this.avgRating() >= 3.0 ? 'Average' : 'Low'));
            this.satisfactionLevel.set(this.numReviews() > 0 ? level : 'New');
        }
    });

    this.vendorService.getOrders().subscribe(orders => {
        this.recentOrders.set(orders.slice(0, 5));
        const sales = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        this.totalSales.set(sales);
        const active = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
        this.activeOrders.set(active);
        const pending = orders.filter(o => o.status === 'PAID' || o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
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
