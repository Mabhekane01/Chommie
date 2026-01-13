import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white min-h-screen pb-12">
      <div class="container mx-auto px-4 py-8 max-w-[800px]">
        
        <!-- Breadcrumb -->
        <div class="text-sm text-gray-500 mb-6">
            <a routerLink="/orders" class="hover:underline hover:text-action">Your Orders</a> › <span class="text-[#C45500]">Track Package</span>
        </div>

        <h1 class="text-3xl font-normal text-[#111111] mb-2">Track Package</h1>
        <p class="text-sm text-gray-600 mb-8">Order # {{ order()?.id }}</p>

        <div *ngIf="loading()" class="flex justify-center py-20">
             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-action"></div>
        </div>

        <div *ngIf="!loading() && order()" class="space-y-8">
            
            <!-- Delivery Estimate Card -->
            <div class="product-card p-6 border-l-8 border-l-green-600">
                <h2 class="text-2xl font-bold text-green-700 mb-1">
                    {{ order()!.status === 'DELIVERED' ? 'Delivered' : 'Arriving Tomorrow' }}
                </h2>
                <p class="text-gray-600 text-sm">Your package is on its way.</p>
            </div>

            <!-- Tracking Timeline Visual -->
            <div class="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <div class="relative">
                    <!-- Vertical Line -->
                    <div class="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

                    <!-- Steps -->
                    <div class="space-y-10">
                        <div *ngFor="let step of (order()!.trackingHistory || []).slice().reverse()" class="relative pl-10">
                            <!-- Dot -->
                            <div class="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center"
                                [ngClass]="step === (order()!.trackingHistory[order()!.trackingHistory.length - 1]) ? 'bg-green-600 scale-110' : 'bg-gray-300'">
                            </div>
                            
                            <div>
                                <div class="flex justify-between items-start">
                                    <h3 class="font-bold text-[#111111]">{{ step.status.replace('_', ' ') }}</h3>
                                    <span class="text-xs text-gray-500 font-medium">{{ step.timestamp | date:'EEEE, MMM d, h:mm a' }}</span>
                                </div>
                                <p class="text-sm text-gray-600 mt-1">{{ step.description }}</p>
                            </div>
                        </div>

                        <!-- Initial Step if no history -->
                        <div *ngIf="!order()!.trackingHistory?.length" class="relative pl-10">
                             <div class="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm bg-green-600"></div>
                             <div>
                                <div class="flex justify-between items-start">
                                    <h3 class="font-bold text-[#111111]">Ordered</h3>
                                    <span class="text-xs text-gray-500 font-medium">{{ order()!.createdAt | date:'short' }}</span>
                                </div>
                                <p class="text-sm text-gray-600 mt-1">We've received your order.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Shipping Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="p-4 border border-gray-200 rounded-xl">
                    <h4 class="font-bold text-sm mb-2 uppercase text-gray-500 tracking-wider">Shipping Address</h4>
                    <p class="text-sm text-gray-700 leading-relaxed">{{ order()!.shippingAddress }}</p>
                </div>
                <div class="p-4 border border-gray-200 rounded-xl">
                    <h4 class="font-bold text-sm mb-2 uppercase text-gray-500 tracking-wider">Carrier</h4>
                    <p class="text-sm text-gray-700">Chommie Logistics Express</p>
                    <p class="text-xs text-amazon-link mt-1 hover:underline cursor-pointer">View carrier details</p>
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
export class OrderTrackingComponent implements OnInit {
  order = signal<any | null>(null);
  loading = signal(true);
  userId = localStorage.getItem('user_id') || '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
        this.loadOrder(id);
    }
  }

  loadOrder(id: string) {
    this.orderService.getUserOrders(this.userId).subscribe(orders => {
        this.order.set(orders.find(o => o.id === id));
        this.loading.set(false);
    });
  }
}
