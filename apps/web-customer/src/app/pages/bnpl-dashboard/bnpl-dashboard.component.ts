import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BnplService, TrustProfile } from '../../services/bnpl.service';

@Component({
  selector: 'app-bnpl-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">My BNPL Dashboard</h1>

      <!-- Trust Score Card -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4" 
           [ngClass]="getScoreColor(profile()?.currentScore || 0)">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Trust Score</h2>
            <p class="text-sm text-gray-500">Based on your payment history</p>
          </div>
          <div class="text-right">
            <div class="text-4xl font-bold">{{ profile()?.currentScore || 0 }}</div>
            <div class="text-sm font-semibold uppercase tracking-wide" [ngClass]="getTierColor(profile()?.tier || 'BRONZE')">
              {{ profile()?.tier || 'BRONZE' }}
            </div>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t flex justify-between text-sm">
          <div>
            <span class="block text-gray-500">Credit Limit</span>
            <span class="font-bold text-lg">R{{ profile()?.creditLimit || 500 }}</span>
          </div>
          <div class="text-right">
            <span class="block text-gray-500">On-Time Payments</span>
            <span class="font-bold text-lg">{{ profile()?.onTimePayments || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Active Plans -->
      <h2 class="text-2xl font-bold mb-4">Active Payment Plans</h2>
      
      <div *ngIf="loading()" class="text-center py-8">Loading plans...</div>

      <div *ngIf="!loading() && plans().length === 0" class="text-center py-8 bg-white rounded shadow">
        <p class="text-gray-500">You have no active payment plans.</p>
      </div>

      <div class="space-y-6">
        <div *ngFor="let plan of plans()" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
            <div>
              <span class="font-bold text-gray-700">Order #{{ plan.orderId.substring(0, 8) }}</span>
              <span class="ml-2 text-xs text-gray-500">{{ plan.createdAt | date }}</span>
            </div>
            <div class="px-2 py-1 rounded text-xs font-bold" 
                 [ngClass]="plan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
              {{ plan.status }}
            </div>
          </div>

          <div class="p-4">
            <div class="flex justify-between mb-4">
              <div>
                <p class="text-sm text-gray-500">Total Amount</p>
                <p class="font-bold">R{{ plan.totalAmount | number:'1.2-2' }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">Remaining Balance</p>
                <p class="font-bold text-green-700">R{{ plan.remainingBalance | number:'1.2-2' }}</p>
              </div>
            </div>

            <!-- Installments -->
            <div class="mt-4">
              <h4 class="font-semibold text-sm mb-2 text-gray-600">Installments</h4>
              <div class="space-y-2">
                <div *ngFor="let inst of plan.installments; let i = index" 
                     class="flex justify-between items-center text-sm p-2 rounded"
                     [ngClass]="inst.status === 'PAID' ? 'bg-green-50' : 'bg-gray-50'">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          [ngClass]="inst.status === 'PAID' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'">
                      {{ i + 1 }}
                    </span>
                    <span [ngClass]="inst.status === 'PAID' ? 'text-gray-400 line-through' : ''">
                      Due {{ inst.dueDate | date:'MMM d' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium">R{{ inst.amount | number:'1.2-2' }}</span>
                    <span *ngIf="inst.status === 'PAID'" class="text-green-600">✓ Paid</span>
                    <button *ngIf="inst.status !== 'PAID'" 
                            (click)="payInstallment(plan.id, i)"
                            class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                      Pay Now
                    </button>
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
    // ForkJoin would be better, but doing sequential for simplicity
    this.bnplService.getProfile(this.userId).subscribe(profile => {
      this.profile.set(profile);
    });

    this.bnplService.getPlans(this.userId).subscribe(plans => {
      this.plans.set(plans);
      this.loading.set(false);
    });
  }

  payInstallment(planId: string, index: number) {
    if (!confirm('Are you sure you want to pay this installment now?')) return;

    this.bnplService.payInstallment(planId, index).subscribe({
      next: () => {
        alert('Payment successful! Your Trust Score will be updated.');
        this.loadData(); // Refresh data
      },
      error: (err) => {
        alert('Payment failed. Please try again.');
        console.error(err);
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 800) return 'border-l-purple-600';
    if (score >= 600) return 'border-l-yellow-500';
    if (score >= 300) return 'border-l-gray-400';
    return 'border-l-orange-700';
  }

  getTierColor(tier: string): string {
    switch (tier) {
      case 'PLATINUM': return 'text-purple-600';
      case 'GOLD': return 'text-yellow-600';
      case 'SILVER': return 'text-gray-500';
      default: return 'text-orange-700';
    }
  }
}
