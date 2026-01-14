import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BnplService, TrustProfile } from '../../services/bnpl.service';

@Component({
  selector: 'app-bnpl-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32 pt-10">
      <div class="w-full px-6 animate-fade-in">
        
        <!-- Header -->
        <div class="mb-12 border-b border-neutral-200 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
           <div>
               <h1 class="text-3xl font-normal text-neutral-charcoal mb-2">
                  Chommie BNPL
               </h1>
               <p class="text-sm text-neutral-600">
                  Manage your credit, installments, and trust score.
               </p>
           </div>
           <button class="text-sm text-primary hover:underline">How it works</button>
        </div>

        <!-- Score & Limit Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           <!-- Credit Limit -->
           <div class="border border-neutral-300 rounded-lg p-6 bg-white shadow-sm">
               <h2 class="text-lg font-bold text-neutral-800 mb-4">Available Credit</h2>
               <div class="flex items-baseline gap-2 mb-4">
                   <span class="text-4xl font-normal text-neutral-800">R{{ profile()?.creditLimit || 500 | number:'1.0-0' }}</span>
                   <span class="text-sm text-neutral-500">limit</span>
               </div>
               
               <div class="w-full bg-neutral-200 rounded-full h-2.5 mb-2">
                   <div class="bg-emerald-600 h-2.5 rounded-full transition-all duration-1000" [style.width]="((profile()?.currentScore || 0) / 1000 * 100) + '%'"></div>
               </div>
               <p class="text-xs text-neutral-500">Based on your payment history and trust score.</p>
           </div>

           <!-- Trust Score -->
           <div class="border border-neutral-300 rounded-lg p-6 bg-white shadow-sm flex items-center justify-between">
               <div>
                   <h2 class="text-lg font-bold text-neutral-800 mb-2">Trust Score</h2>
                   <p class="text-sm text-neutral-600 mb-4">{{ profile()?.tier || 'BRONZE' }} TIER</p>
                   <p class="text-xs text-neutral-500">On-time payments: <span class="font-bold text-emerald-700">{{ profile()?.onTimePayments || 0 }}</span></p>
               </div>
               <div class="relative w-32 h-32 flex items-center justify-center rounded-full border-4" [ngClass]="getScoreColor(profile()?.currentScore || 0)">
                   <div class="text-center">
                       <div class="text-2xl font-bold text-neutral-800">{{ profile()?.currentScore || 0 }}</div>
                       <div class="text-xs text-neutral-500">/ 1000</div>
                   </div>
               </div>
           </div>
        </div>

        <!-- Active Installments -->
        <div>
           <h2 class="text-xl font-bold text-neutral-800 mb-6">Active Payment Plans</h2>
           
           <div *ngIf="loading()" class="py-20 flex justify-center">
               <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
           </div>

           <div *ngIf="!loading() && plans().length === 0" class="border border-neutral-300 rounded-lg p-10 text-center bg-neutral-50">
               <p class="text-neutral-700 mb-2">You have no active payment plans.</p>
               <button class="btn-primary text-sm py-1.5 px-4 rounded-md shadow-sm">Shop Now</button>
           </div>

           <div class="space-y-6">
               <div *ngFor="let plan of plans()" class="border border-neutral-300 rounded-lg overflow-hidden bg-white shadow-sm">
                   <div class="bg-neutral-50 border-b border-neutral-200 px-6 py-3 flex justify-between items-center text-sm">
                       <div>
                           <span class="font-bold text-neutral-700 block">Plan #{{ plan.orderId.substring(0, 8).toUpperCase() }}</span>
                           <span class="text-xs text-neutral-500">Created {{ plan.createdAt | date:'mediumDate' }}</span>
                       </div>
                       <span class="px-2 py-1 rounded text-xs font-bold border" 
                             [ngClass]="plan.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200'">
                           {{ plan.status }}
                       </span>
                   </div>

                   <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                       <!-- Summary -->
                       <div>
                           <div class="flex justify-between text-sm mb-2">
                               <span class="text-neutral-600">Total Amount</span>
                               <span class="font-bold">R{{ plan.totalAmount | number:'1.0-0' }}</span>
                           </div>
                           <div class="flex justify-between text-sm mb-4">
                               <span class="text-neutral-600">Remaining Balance</span>
                               <span class="font-bold text-primary">R{{ plan.remainingBalance | number:'1.0-0' }}</span>
                           </div>
                           <div class="w-full bg-neutral-200 rounded-full h-2">
                               <div class="bg-primary h-2 rounded-full" [style.width]="((plan.totalAmount - plan.remainingBalance) / plan.totalAmount * 100) + '%'"></div>
                           </div>
                       </div>

                       <!-- Installments -->
                       <div class="space-y-3">
                           <h3 class="text-sm font-bold text-neutral-800 mb-2">Payment Schedule</h3>
                           <div *ngFor="let inst of plan.installments; let i = index" class="flex justify-between items-center text-sm border-b border-neutral-100 pb-2 last:border-0">
                               <div>
                                   <div class="font-medium text-neutral-800">Installment {{ i + 1 }}</div>
                                   <div class="text-xs text-neutral-500">Due {{ inst.dueDate | date:'mediumDate' }}</div>
                               </div>
                               <div class="flex items-center gap-4">
                                   <span class="font-bold">R{{ inst.amount | number:'1.0-0' }}</span>
                                   <button *ngIf="inst.status !== 'PAID'" (click)="payInstallment(plan.id, i)" class="btn-primary text-xs py-1 px-3 rounded shadow-sm">Pay</button>
                                   <span *ngIf="inst.status === 'PAID'" class="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">PAID</span>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
           </div>
        </div>

      </div>
    </div>
  `
})
export class BnplDashboardComponent implements OnInit {
  profile = signal<TrustProfile | null>(null);
  plans = signal<any[]>([]);
  loading = signal(true);
  userId = '';

  constructor(private bnplService: BnplService) {
    this.userId = localStorage.getItem('user_id') || '';
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.bnplService.getProfile(this.userId).subscribe(profile => {
      this.profile.set(profile);
    });

    this.bnplService.getPlans(this.userId).subscribe(plans => {
      this.plans.set(plans);
      this.loading.set(false);
    });
  }

  payInstallment(planId: string, index: number) {
    if (!confirm('Proceed with payment?')) return;

    this.bnplService.payInstallment(planId, index).subscribe({
      next: () => {
        alert('Payment successful');
        this.loadData();
      },
      error: (err) => {
        alert('Payment failed');
        console.error(err);
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 800) return 'border-emerald-500 text-emerald-700';
    if (score >= 600) return 'border-amber-400 text-amber-700';
    return 'border-red-500 text-red-700';
  }
}