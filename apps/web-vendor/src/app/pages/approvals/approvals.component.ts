import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 max-w-[1200px] mx-auto space-y-8 animate-fade-in">
      <div class="border-b border-neutral-200 pb-6">
         <h1 class="text-3xl font-header font-bold text-neutral-charcoal tracking-tight">Vendor Approvals</h1>
         <p class="text-sm text-neutral-500 mt-1 uppercase tracking-widest font-bold">Admin Console</p>
      </div>

      <div class="bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
          <div class="p-6 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center">
              <h2 class="text-sm font-bold text-neutral-500 uppercase tracking-widest">Pending Applications</h2>
              <span class="bg-primary text-white text-[10px] font-black px-2 py-1 rounded-full">{{ pendingVendors().length }} TOTAL</span>
          </div>

          <div class="divide-y divide-neutral-200">
              <div *ngIf="pendingVendors().length === 0" class="p-20 text-center text-neutral-400">
                  <p class="font-bold uppercase tracking-widest text-xs">No pending applications at this time.</p>
              </div>

              <div *ngFor="let vendor of pendingVendors()" class="p-8 flex justify-between items-center hover:bg-neutral-50 transition-all">
                  <div class="flex items-center gap-6">
                      <div class="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 font-bold text-lg uppercase">
                          {{ vendor.firstName?.charAt(0) }}
                      </div>
                      <div>
                          <h3 class="text-lg font-bold text-neutral-800">{{ vendor.firstName }} {{ vendor.lastName }}</h3>
                          <div class="text-xs text-neutral-500 font-medium">{{ vendor.email }}</div>
                          <div class="flex gap-4 mt-2">
                              <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Registered: {{ vendor.createdAt | date:'medium' }}</span>
                          </div>
                      </div>
                  </div>

                  <div class="flex gap-3">
                      <button (click)="approve(vendor.id)" class="px-6 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-emerald-700 shadow-sm transition-all">Approve</button>
                      <button (click)="reject(vendor.id)" class="px-6 py-2 bg-white border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-red-50 transition-all">Reject</button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  `
})
export class ApprovalsComponent implements OnInit {
  private vendorService = inject(VendorService);
  pendingVendors = signal<any[]>([]);

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.vendorService.getPendingVendors().subscribe(res => {
      this.pendingVendors.set(res);
    });
  }

  approve(id: string) {
    if (confirm('Are you sure you want to approve this vendor?')) {
        this.vendorService.approveVendor(id, 'APPROVED').subscribe(() => this.loadPending());
    }
  }

  reject(id: string) {
    if (confirm('Reject this application?')) {
        this.vendorService.approveVendor(id, 'REJECTED').subscribe(() => this.loadPending());
    }
  }
}
