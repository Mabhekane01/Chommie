import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-vendor-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      <!-- Standard Vendor Nav -->
      <nav class="bg-white border-b border-neutral-300 px-8 py-3 flex justify-between items-center sticky top-0 z-50">
          <div class="flex items-center gap-8">
              <a routerLink="/" class="font-header font-bold text-2xl tracking-tight text-neutral-charcoal flex items-center gap-1">
                Chommie<span class="text-primary">.central</span>
              </a>
              <div class="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
                  <a routerLink="/dashboard" class="hover:text-primary transition-colors">Dashboard</a>
                  <a href="#" class="hover:text-primary transition-colors text-primary font-bold">Catalog</a>
                  <a routerLink="/orders" class="hover:text-primary transition-colors">Orders</a>
              </div>
          </div>
          <div class="flex items-center gap-4">
              <input type="text" placeholder="Search SKU, ASIN, Name" class="border border-neutral-300 rounded-md px-3 py-1 text-sm w-64 shadow-inner focus:ring-primary focus:border-primary outline-none">
          </div>
      </nav>

      <div class="p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
        <div class="flex justify-between items-center">
           <h1 class="text-3xl font-header font-bold text-neutral-charcoal">Manage Inventory</h1>
           
           <div class="flex gap-2 text-sm">
               <a routerLink="/products/create" class="btn-primary py-1.5 px-4 rounded-md shadow-sm font-medium flex items-center gap-2">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                   Add a Product
               </a>
           </div>
        </div>

        <!-- Filters -->
        <div class="bg-white border border-neutral-300 rounded-lg p-4 flex gap-4 text-sm shadow-sm">
            <div class="flex items-center gap-2 border-r border-neutral-200 pr-4">
                <span class="font-bold text-neutral-600">Status:</span>
                <select class="border border-neutral-300 rounded px-2 py-1 outline-none bg-neutral-50">
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Out of Stock</option>
                </select>
            </div>
            <div class="flex gap-4 font-medium text-neutral-600 items-center">
                <button class="text-primary font-bold border-b-2 border-primary pb-4 -mb-4.5">Active</button>
                <button class="hover:text-primary">Inactive</button>
                <button class="hover:text-primary">Suppressed</button>
            </div>
        </div>

        <!-- Inventory Table -->
        <div class="bg-white border border-neutral-300 rounded-lg shadow-sm overflow-hidden">
            <table class="w-full text-sm text-left">
                <thead class="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wide">
                    <tr>
                        <th class="px-6 py-3 w-10"><input type="checkbox" class="rounded border-neutral-300 text-primary focus:ring-primary"></th>
                        <th class="px-6 py-3">Status</th>
                        <th class="px-6 py-3 text-center">Image</th>
                        <th class="px-6 py-3">Product Name</th>
                        <th class="px-6 py-3 text-right">Available</th>
                        <th class="px-6 py-3 text-right">Price + Shipping</th>
                        <th class="px-6 py-3 text-right">Fee Preview</th>
                        <th class="px-6 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-neutral-200">
                    <tr *ngFor="let p of products()" class="hover:bg-neutral-50 transition-colors group">
                        <td class="px-6 py-4"><input type="checkbox" class="rounded border-neutral-300 text-primary focus:ring-primary"></td>
                        <td class="px-6 py-4">
                            <span class="text-emerald-700 font-bold text-xs uppercase" *ngIf="p.stock > 0">Active</span>
                            <span class="text-red-700 font-bold text-xs uppercase" *ngIf="p.stock <= 0">Inactive (Out of Stock)</span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <div class="w-12 h-12 border border-neutral-200 bg-white mx-auto flex items-center justify-center p-1">
                               <img [src]="p.images[0]" class="max-w-full max-h-full object-contain">
                            </div>
                        </td>
                        <td class="px-6 py-4 max-w-xs">
                            <div class="font-bold text-primary hover:underline cursor-pointer truncate">{{ p.name }}</div>
                            <div class="text-xs text-neutral-500 mt-1">ID: {{ p._id.slice(0,10).toUpperCase() }}</div>
                            <div class="text-xs text-neutral-500">SKU: {{ p.sku || 'N/A' }}</div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <input type="number" [(ngModel)]="p.stock" (change)="markChanged(p)" class="w-20 border border-neutral-300 rounded px-2 py-1 text-right text-sm focus:ring-primary focus:border-primary outline-none">
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-1">
                                <span class="text-xs text-neutral-500">R</span>
                                <input type="number" [(ngModel)]="p.price" (change)="markChanged(p)" class="w-24 border border-neutral-300 rounded px-2 py-1 text-right text-sm focus:ring-primary focus:border-primary outline-none">
                            </div>
                            <div class="text-xs text-neutral-500 mt-1">+ R0.00</div>
                        </td>
                        <td class="px-6 py-4 text-right text-xs text-neutral-600">
                            R{{ (p.price * 0.15) | number:'1.0-0' }}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <div class="flex flex-col gap-2 items-center">
                               <button *ngIf="hasChanged(p._id)" (click)="saveChanges(p)" class="btn-primary py-1 px-3 text-xs rounded shadow-sm w-24">Save</button>
                               <button class="btn-secondary py-1 px-3 text-xs rounded shadow-sm w-24 border border-neutral-300">Edit</button>
                               <button class="text-xs text-neutral-500 hover:text-primary hover:underline">Copy listing</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div class="bg-neutral-50 border-t border-neutral-200 px-6 py-3 flex justify-between items-center text-xs text-neutral-500">
                <span>Showing {{ products().length }} products</span>
                <div class="flex gap-2">
                    <button class="hover:underline">Previous</button>
                    <span>1</span>
                    <button class="hover:underline">Next</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class VendorInventoryComponent implements OnInit {
  products = signal<any[]>([]);
  changedProducts = new Set<string>();

  constructor(private vendorService: VendorService) {}

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