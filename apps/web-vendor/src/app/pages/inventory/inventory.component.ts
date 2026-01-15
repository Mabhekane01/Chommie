import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../services/vendor.service';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-vendor-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE INVENTORY UI -->
        <div class="p-4 space-y-6 animate-fade-in">
           <div class="flex justify-between items-center pt-2 px-1">
              <h1 class="text-xl font-bold">Inventory</h1>
              <a routerLink="/products/create" class="bg-primary text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest shadow-sm">
                 + Add
              </a>
           </div>

           <!-- Mobile Search -->
           <div class="relative">
              <input type="text" placeholder="Filter inventory..." class="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm outline-none focus:border-primary shadow-inner">
              <svg class="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           </div>

           <div class="space-y-4">
              <div *ngFor="let p of products()" class="bg-white p-4 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <div class="flex gap-4">
                    <div class="w-20 h-20 bg-neutral-50 rounded-md p-2 flex items-center justify-center shrink-0 border border-neutral-200">
                       <img [src]="p.images[0]" class="max-w-full max-h-full object-contain mix-blend-multiply">
                    </div>
                    <div class="flex-grow py-1">
                       <h3 class="text-sm font-bold text-neutral-800 line-clamp-2 leading-tight uppercase tracking-tight">{{ p.name }}</h3>
                       <div class="text-[10px] font-medium text-neutral-400 mt-1 uppercase">SKU: {{ p.sku || 'N/A' }}</div>
                       <div class="mt-2">
                          <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded border"
                                [ngClass]="p.stock > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'">
                             {{ p.stock > 0 ? 'Active' : 'Out of Stock' }}
                          </span>
                       </div>
                    </div>
                 </div>

                 <div class="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                    <div class="space-y-1">
                       <label class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Available</label>
                       <input type="number" [(ngModel)]="p.stock" (change)="markChanged(p)" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 text-sm font-bold focus:border-primary outline-none">
                    </div>
                    <div class="space-y-1">
                       <label class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Price (ZAR)</label>
                       <input type="number" [(ngModel)]="p.price" (change)="markChanged(p)" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 text-sm font-bold focus:border-primary outline-none">
                    </div>
                 </div>

                 <div class="flex gap-2 pt-2">
                    <button *ngIf="hasChanged(p._id)" (click)="saveChanges(p)" class="flex-grow bg-emerald-600 text-white py-2.5 rounded-md text-[11px] font-bold uppercase tracking-widest shadow-sm">Save</button>
                    <button [routerLink]="['/products/edit', p._id || p.id]" class="flex-grow bg-white border border-neutral-300 text-neutral-700 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors">Edit</button>
                 </div>
              </div>
           </div>
        </div>
      } @else {
        <!-- DESKTOP INVENTORY UI -->
        <div class="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
          <div class="flex justify-between items-end border-b border-neutral-200 pb-6">
             <div>
                <h1 class="text-3xl font-header font-bold text-neutral-charcoal tracking-tight">Manage Inventory</h1>
                <p class="text-sm text-neutral-500 mt-1 font-medium uppercase tracking-widest">Marketplace Asset Manifest</p>
             </div>
             
             <div class="flex gap-4">
                 <div class="relative w-80 group">
                    <input type="text" placeholder="Search SKU, ASIN, Name" class="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium shadow-inner">
                    <svg class="absolute left-3 top-2.5 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
                 <a routerLink="/products/create" class="btn-primary flex items-center gap-2 px-6 py-2 rounded-md shadow-sm font-bold uppercase tracking-widest text-[11px]">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                     Add a Product
                 </a>
             </div>
          </div>

          <!-- Inventory Table -->
          <div class="bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
              <div class="p-4 bg-neutral-50 border-b border-neutral-200 flex gap-8 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  <button class="text-primary border-b-2 border-primary pb-1">Active Listings</button>
                  <button class="hover:text-neutral-700 transition-colors">Inactive</button>
                  <button class="hover:text-neutral-700 transition-colors">Out of Stock</button>
              </div>

              <table class="w-full text-left text-sm">
                  <thead class="bg-white border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                      <tr>
                          <th class="px-6 py-4 w-10"><input type="checkbox" class="rounded border-neutral-300 text-primary focus:ring-primary"></th>
                          <th class="px-4 py-4">Status</th>
                          <th class="px-4 py-4 text-center">Identity</th>
                          <th class="px-4 py-4">Product Attributes</th>
                          <th class="px-4 py-4 text-right">Available</th>
                          <th class="px-4 py-4 text-right">Market Price</th>
                          <th class="px-4 py-4 text-right">Chommie Fee</th>
                          <th class="px-6 py-4 text-center">Action</th>
                      </tr>
                  </thead>
                  <tbody class="divide-y divide-neutral-100">
                      <tr *ngFor="let p of products()" class="hover:bg-neutral-50/50 transition-colors group">
                          <td class="px-6 py-6"><input type="checkbox" class="rounded border-neutral-300 text-primary focus:ring-primary"></td>
                          <td class="px-4 py-6">
                              <span class="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border" 
                                    [ngClass]="p.stock > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'">
                                 {{ p.stock > 0 ? 'Active' : 'Out of Stock' }}
                              </span>
                          </td>
                          <td class="px-4 py-6">
                              <div class="w-14 h-14 border border-neutral-200 bg-white rounded-md mx-auto flex items-center justify-center p-1 shadow-sm">
                                 <img [src]="p.images[0]" class="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110">
                              </div>
                          </td>
                          <td class="px-4 py-6 max-w-xs">
                              <div class="font-bold text-primary hover:underline cursor-pointer truncate uppercase tracking-tight">{{ p.name }}</div>
                              <div class="flex gap-3 mt-1 text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                                 <span>ID: {{ p._id.slice(0,8).toUpperCase() }}</span>
                                 <span>SKU: {{ p.sku || 'UNSET' }}</span>
                              </div>
                          </td>
                          <td class="px-4 py-6 text-right">
                              <input type="number" [(ngModel)]="p.stock" (change)="markChanged(p)" class="w-20 bg-white border border-neutral-300 rounded-md px-2 py-1.5 text-right text-sm font-bold focus:border-primary outline-none shadow-inner transition-all">
                          </td>
                          <td class="px-4 py-6 text-right">
                              <div class="flex items-center justify-end gap-1">
                                  <span class="text-[10px] font-bold text-neutral-400">R</span>
                                  <input type="number" [(ngModel)]="p.price" (change)="markChanged(p)" class="w-24 bg-white border border-neutral-300 rounded-md px-2 py-1.5 text-right text-sm font-bold focus:border-primary outline-none shadow-inner transition-all">
                              </div>
                              <div class="text-[9px] text-neutral-400 mt-1 font-bold uppercase tracking-tighter">+ R0.00 Logistics</div>
                          </td>
                          <td class="px-4 py-6 text-right">
                              <div class="text-xs font-bold text-neutral-600 tracking-tight">R{{ (p.price * 0.15) | number:'1.0-0' }}</div>
                              <div class="text-[9px] text-neutral-400 font-medium uppercase tracking-tighter">Est. Fee</div>
                          </td>
                          <td class="px-6 py-6 text-center">
                              <div class="flex flex-col gap-2 items-center">
                                 <button *ngIf="hasChanged(p._id)" (click)="saveChanges(p)" class="bg-emerald-600 text-white py-1 px-4 text-[10px] font-bold uppercase rounded shadow-sm w-24 active:scale-95 transition-all">Save</button>
                                 <button [routerLink]="['/products/edit', p._id || p.id]" class="bg-white border border-neutral-300 text-neutral-700 py-1 px-4 text-[10px] font-bold uppercase rounded shadow-sm w-24 hover:bg-neutral-50 active:scale-95 transition-all">Edit</button>
                                 <button class="text-[9px] text-neutral-400 font-bold uppercase hover:text-primary transition-colors">Manifest ▾</button>
                              </div>
                          </td>
                      </tr>
                  </tbody>
              </table>
              
              <div class="bg-neutral-50 border-t border-neutral-200 px-8 py-4 flex justify-between items-center text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                  <span>{{ products().length }} active nodes detected</span>
                  <div class="flex items-center gap-4">
                      <button class="hover:text-primary transition-colors cursor-pointer disabled:opacity-30" disabled>Previous Segment</button>
                      <div class="flex gap-1">
                         <span class="w-6 h-6 flex items-center justify-center bg-primary text-white rounded text-[10px] font-bold">1</span>
                      </div>
                      <button class="hover:text-primary transition-colors cursor-pointer disabled:opacity-30" disabled>Next Segment</button>
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
export class VendorInventoryComponent implements OnInit {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private vendorService = inject(VendorService);

  products = signal<any[]>([]);
  changedProducts = new Set<string>();

  ngOnInit() {
    this.vendorService.getProducts().subscribe(data => this.products.set(data));
  }

  markChanged(product: any) {
    this.changedProducts.add(product._id);
  }

  hasChanged(id: string) {
    return this.changedProducts.has(id);
  }

  saveChanges(product: any) {
    this.vendorService.updateProduct(product).subscribe({
        next: () => {
            this.changedProducts.delete(product._id);
            alert('Saved successfully');
        },
        error: () => alert('Failed to save')
    });
  }
}