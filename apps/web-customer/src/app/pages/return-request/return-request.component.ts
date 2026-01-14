import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-return-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32 pt-6">
      <div class="w-full px-6 animate-fade-in">
        <h1 class="text-2xl font-normal text-neutral-charcoal mb-2">Return or Replace Items</h1>

        <div *ngIf="loading()" class="py-20 flex justify-center">
             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>

        <div *ngIf="!loading() && order()" class="space-y-8">
            
            <!-- Step 1: Select Items -->
            <div class="bg-white border border-neutral-300 rounded-md overflow-hidden shadow-sm">
                <div class="bg-neutral-50 border-b border-neutral-200 p-4">
                    <h2 class="font-bold text-neutral-800">{{ ts.t('returns.choose') }}</h2>
                </div>
                
                <div class="p-6 space-y-6">
                    <div *ngFor="let item of order().items" class="flex items-start gap-4">
                        <div class="pt-1">
                            <input type="checkbox" [checked]="isSelected(item.id)" (change)="toggleItem(item)" class="w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer">
                        </div>
                        
                        <div class="w-20 h-20 border border-neutral-200 p-1 flex-shrink-0">
                            <img [src]="item.productImage || 'https://via.placeholder.com/150'" class="w-full h-full object-contain">
                        </div>

                        <div class="flex-grow space-y-2">
                            <div class="font-bold text-sm text-primary hover:underline cursor-pointer">{{ item.productName }}</div>
                            <div class="text-xs text-neutral-500">Sold by: Chommie Retail</div>
                            <div class="text-sm font-bold text-neutral-800">R{{ item.price | number:'1.0-0' }}</div>

                            <!-- Reason Selection (Only visible if selected) -->
                            <div *ngIf="isSelected(item.id)" class="bg-neutral-50 p-4 border border-neutral-200 rounded-md mt-2 space-y-3 animate-slide-up">
                                <div>
                                    <label class="block text-sm font-bold text-neutral-700 mb-1">{{ ts.t('returns.reason') }}</label>
                                    <select [(ngModel)]="getSelection(item.id).reason" class="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-sm shadow-sm focus:ring-primary focus:border-primary outline-none">
                                        <option value="">Choose a response</option>
                                        <option value="DAMAGED">Damaged during shipping</option>
                                        <option value="WRONG_ITEM">Wrong item was sent</option>
                                        <option value="NO_LONGER_NEEDED">No longer needed</option>
                                        <option value="DEFECTIVE">Item defective or doesn't work</option>
                                        <option value="BETTER_PRICE_AVAILABLE">Better price available</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-neutral-700 mb-1">{{ ts.t('returns.comments') }}</label>
                                    <textarea [(ngModel)]="getSelection(item.id).condition" rows="2" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-primary focus:border-primary outline-none"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Submit Action -->
            <div class="flex justify-end">
                <button 
                    (click)="submitReturn()" 
                    [disabled]="selectedItems.length === 0 || submitting()" 
                    class="btn-primary py-2 px-8 rounded-md shadow-sm text-sm"
                >
                    {{ submitting() ? 'Processing...' : ts.t('returns.submit') }}
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
    public ts: TranslationService,
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