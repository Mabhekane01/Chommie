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
    <div class="bg-[#F0F2F2] min-h-screen">
      <nav class="bg-white border-b border-gray-300 px-6 py-2 flex justify-between items-center shadow-sm">
          <div class="flex items-center gap-4">
              <span class="text-xl font-bold text-primary">Chommie <span class="font-normal text-black text-sm uppercase tracking-wide">Seller Central</span></span>
              <div class="h-6 w-px bg-gray-300"></div>
              <a href="/dashboard" class="text-sm font-bold text-gray-700 hover:text-action">Dashboard</a>
              <span class="text-sm font-bold text-[#E77600]">Manage Inventory</span>
          </div>
      </nav>

      <div class="p-6 max-w-[1400px] mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-normal text-[#111111]">Inventory</h1>
            <div class="flex gap-2">
                <input type="text" placeholder="Search SKU, Title, ASIN" class="border border-gray-400 rounded-sm px-2 py-1 text-sm w-64 shadow-inner">
                <a routerLink="/products/create" class="bg-[#F0C14B] border border-[#a88734] rounded-[3px] py-1 px-4 text-sm shadow-sm hover:bg-[#F4D078] font-bold flex items-center">
                    Add a Product
                </a>
            </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-100 text-xs text-gray-500 uppercase border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-2 w-10"><input type="checkbox"></th>
                            <th class="px-4 py-2">Status</th>
                            <th class="px-4 py-2">Image</th>
                            <th class="px-4 py-2">Product Name</th>
                            <th class="px-4 py-2 text-right">Available</th>
                            <th class="px-4 py-2 text-right">Price</th>
                            <th class="px-4 py-2 text-right">Fee Preview</th>
                            <th class="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr *ngFor="let p of products()" class="hover:bg-[#F7FAFA]">
                            <td class="px-4 py-2"><input type="checkbox"></td>
                            <td class="px-4 py-2">
                                <span class="text-green-700 font-bold text-xs" *ngIf="p.stock > 0">Active</span>
                                <span class="text-red-700 font-bold text-xs" *ngIf="p.stock <= 0">Inactive (Out of Stock)</span>
                            </td>
                            <td class="px-4 py-2">
                                <img [src]="p.images[0]" class="w-10 h-10 object-contain border border-gray-200">
                            </td>
                            <td class="px-4 py-2 max-w-xs">
                                <div class="font-bold text-amazon-link hover:underline cursor-pointer truncate">{{ p.name }}</div>
                                <div class="text-xs text-gray-500">ASIN: {{ p._id.slice(0,10) }} | SKU: {{ p._id.slice(10,16) }}</div>
                            </td>
                            <td class="px-4 py-2 text-right">
                                <input type="number" [(ngModel)]="p.stock" (change)="markChanged(p)" class="w-16 border border-gray-300 rounded p-1 text-right text-sm focus:border-action outline-none">
                            </td>
                            <td class="px-4 py-2 text-right">
                                <div class="flex items-center justify-end gap-1">
                                    <span class="text-xs text-gray-500">ZAR</span>
                                    <input type="number" [(ngModel)]="p.price" (change)="markChanged(p)" class="w-20 border border-gray-300 rounded p-1 text-right text-sm focus:border-action outline-none font-bold">
                                </div>
                            </td>
                            <td class="px-4 py-2 text-right text-xs text-gray-500">
                                R{{ (p.price * 0.15) | number:'1.2-2' }}
                            </td>
                            <td class="px-4 py-2">
                                <button *ngIf="hasChanged(p._id)" (click)="saveChanges(p)" class="bg-[#F0C14B] border border-[#a88734] rounded-[3px] py-0.5 px-2 text-xs shadow-sm hover:bg-[#F4D078]">Save</button>
                                <button class="border border-gray-300 bg-gray-100 hover:bg-gray-200 rounded-[3px] py-0.5 px-2 text-xs shadow-sm ml-2">Edit</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="bg-gray-50 p-2 border-t border-gray-200 text-xs text-right text-gray-500">
                {{ products().length }} products
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
            alert('Saved');
        },
        error: () => alert('Failed to save')
    });
  }
}
