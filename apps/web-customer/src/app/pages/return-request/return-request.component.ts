import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-return-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white min-h-screen pb-12">
      <div class="container mx-auto px-4 py-8 max-w-[800px]">
        
        <h1 class="text-2xl font-normal text-[#111111] mb-6">Return Items</h1>

        <div *ngIf="loading()" class="flex justify-center py-20">
             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-action"></div>
        </div>

        <div *ngIf="!loading() && order()" class="space-y-6">
            
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-sm mb-6">
                <div class="text-sm font-bold">Order # {{ order().id }}</div>
                <div class="text-xs text-gray-500">Placed on {{ order().createdAt | date }}</div>
            </div>

            <!-- Items Selection -->
            <div class="space-y-4">
                <div *ngFor="let item of order().items" class="border border-gray-300 rounded-sm p-4 flex gap-4 bg-white">
                    <div class="flex items-start pt-2">
                        <input type="checkbox" [checked]="isSelected(item.id)" (change)="toggleItem(item)" class="h-5 w-5 accent-action">
                    </div>
                    
                    <div class="w-20 h-20 bg-gray-100 flex items-center justify-center border border-gray-200">
                        <span class="text-xs text-gray-400">Img</span>
                    </div>

                    <div class="flex-grow">
                        <div class="font-bold text-sm mb-1">{{ item.productName }}</div>
                        <div class="text-xs text-gray-500 mb-2">Sold by Chommie Retail</div>
                        <div class="text-[#B12704] font-bold text-sm">R{{ item.price | number:'1.2-2' }}</div>
                        
                        <!-- Return Reason (If Selected) -->
                        <div *ngIf="isSelected(item.id)" class="mt-4 bg-gray-50 p-3 rounded border border-gray-200">
                            <label class="block text-xs font-bold mb-1">Why are you returning this?</label>
                            <select [(ngModel)]="getSelection(item.id).reason" class="w-full border border-gray-300 rounded p-1 text-sm mb-2">
                                <option value="">Choose a response</option>
                                <option value="DAMAGED">Item arrived damaged</option>
                                <option value="WRONG_ITEM">Wrong item was sent</option>
                                <option value="NO_LONGER_NEEDED">No longer needed</option>
                                <option value="DEFECTIVE">Item defective or doesn't work</option>
                                <option value="BETTER_PRICE_AVAILABLE">Better price available</option>
                            </select>

                            <label class="block text-xs font-bold mb-1">Comments (Optional)</label>
                            <textarea [(ngModel)]="getSelection(item.id).condition" rows="2" class="w-full border border-gray-300 rounded p-1 text-sm" placeholder="Please provide more details..."></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end pt-6">
                <button (click)="submitReturn()" [disabled]="selectedItems.length === 0 || submitting()" class="bg-[#F0C14B] border border-[#a88734] rounded-[8px] py-2 px-6 text-sm shadow-sm hover:bg-[#F4D078] disabled:opacity-50">
                    {{ submitting() ? 'Submitting...' : 'Submit Return Request' }}
                </button>
            </div>

        </div>
      </div>
    </div>
  `
})
export class ReturnRequestComponent implements OnInit {
  order = signal<any | null>(null);
  loading = signal(true);
  submitting = signal(false);
  selectedItems: any[] = [];
  userId = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) {
    this.userId = localStorage.getItem('user_id') || '';
  }

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
        this.loadOrder(orderId);
    }
  }

  loadOrder(id: string) {
    // We assume we can get single order details via existing service
    // But OrderService.getUserOrders returns array. 
    // We need getOrder(id). Check API Gateway... it has GET :id.
    // OrderService frontend needs getOrder(id).
    // I'll cheat and use getUserOrders and find, or add getOrder properly.
    // Let's add getOrder to frontend service quickly or assume it's there.
    // Actually, I'll filter getUserOrders for now to be safe without editing service file again immediately.
    this.orderService.getUserOrders(this.userId).subscribe(orders => {
        const found = orders.find(o => o.id === id);
        this.order.set(found);
        this.loading.set(false);
    });
  }

  isSelected(itemId: string) {
    return this.selectedItems.some(i => i.orderItemId === itemId);
  }

  toggleItem(item: any) {
    if (this.isSelected(item.id)) {
        this.selectedItems = this.selectedItems.filter(i => i.orderItemId !== item.id);
    } else {
        this.selectedItems.push({
            orderItemId: item.id,
            productId: item.productId,
            quantity: item.quantity,
            reason: '',
            condition: ''
        });
    }
  }

  getSelection(itemId: string) {
    return this.selectedItems.find(i => i.orderItemId === itemId);
  }

  submitReturn() {
    // Validate reasons
    const invalid = this.selectedItems.find(i => !i.reason);
    if (invalid) {
        alert('Please select a reason for all selected items.');
        return;
    }

    this.submitting.set(true);
    const returnData = {
        orderId: this.order().id,
        items: this.selectedItems
    };

    this.orderService.requestReturn(this.userId, returnData).subscribe({
        next: () => {
            alert('Return requested successfully. You will receive an email with instructions.');
            this.router.navigate(['/orders']);
        },
        error: (err) => {
            console.error(err);
            alert('Failed to request return');
            this.submitting.set(false);
        }
    });
  }
}
