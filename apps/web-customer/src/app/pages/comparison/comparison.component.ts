import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ComparisonService } from '../../services/comparison.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white min-h-screen pb-12">
      <div class="container mx-auto px-4 py-8 max-w-[1500px]">
        
        <h1 class="text-3xl font-normal text-[#111111] mb-6">Compare Products</h1>

        <div *ngIf="comparisonService.compareList().length === 0" class="text-center py-20 border border-gray-200 rounded">
            <p class="text-gray-500 text-lg mb-4">No items selected for comparison.</p>
            <a routerLink="/products" class="text-amazon-link hover:underline">Browse products</a>
        </div>

        <div *ngIf="comparisonService.compareList().length > 0" class="overflow-x-auto">
            <table class="w-full text-sm border-collapse table-fixed">
                <thead>
                    <tr>
                        <th class="w-48 p-4 bg-gray-50 border-b border-gray-200 text-left align-bottom">
                            <button (click)="comparisonService.clearComparison()" class="text-xs text-gray-500 hover:text-action underline">Clear All</button>
                        </th>
                        <th *ngFor="let product of comparisonService.compareList()" class="w-64 p-4 border-b border-gray-200 align-top relative group">
                            <button (click)="comparisonService.removeFromCompare(product.id || product._id)" class="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-xl font-bold">×</button>
                            <div class="h-40 flex items-center justify-center mb-4 cursor-pointer" [routerLink]="['/products', product.id || product._id]">
                                <img [src]="product.images[0]" class="max-h-full max-w-full object-contain">
                            </div>
                            <div class="text-amazon-link hover:underline cursor-pointer line-clamp-3 mb-2 h-12" [routerLink]="['/products', product.id || product._id]">
                                {{ product.name }}
                            </div>
                            <div class="text-[#B12704] font-bold text-lg mb-2">
                                R{{ product.price | number:'1.2-2' }}
                            </div>
                            <button (click)="addToCart(product)" class="w-full bg-[#F0C14B] border border-[#a88734] rounded-[20px] py-1.5 text-xs shadow-sm font-medium hover:bg-[#F4D078]">
                                Add to Cart
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-gray-200">
                        <td class="p-4 bg-gray-50 font-bold text-gray-700">Customer Rating</td>
                        <td *ngFor="let product of comparisonService.compareList()" class="p-4 text-center">
                            <div class="flex justify-center text-yellow-500 mb-1">
                                <span *ngFor="let s of [1,2,3,4,5]">{{ s <= Math.round(product.ratings || 0) ? '★' : '☆' }}</span>
                            </div>
                            <div class="text-xs text-amazon-link">({{ product.numReviews || 0 }} reviews)</div>
                        </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                        <td class="p-4 bg-gray-50 font-bold text-gray-700">Shipping</td>
                        <td *ngFor="let product of comparisonService.compareList()" class="p-4 text-center">
                            <div *ngIf="product.price >= 500" class="text-sm">
                                <span class="font-bold">FREE Shipping</span> on orders over R500
                            </div>
                            <div *ngIf="product.price < 500" class="text-sm text-gray-500">
                                + Shipping costs
                            </div>
                        </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                        <td class="p-4 bg-gray-50 font-bold text-gray-700">Sold By</td>
                        <td *ngFor="let product of comparisonService.compareList()" class="p-4 text-center text-amazon-link">
                            Chommie Retail
                        </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                        <td class="p-4 bg-gray-50 font-bold text-gray-700">Item Dimensions</td>
                        <td *ngFor="let product of comparisonService.compareList()" class="p-4 text-center text-gray-600">
                            - <!-- Dimensions would be a real field -->
                        </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                        <td class="p-4 bg-gray-50 font-bold text-gray-700">Description</td>
                        <td *ngFor="let product of comparisonService.compareList()" class="p-4 text-xs text-gray-600 leading-relaxed text-left">
                            {{ product.description }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

      </div>
    </div>
  `
})
export class ComparisonComponent {
  Math = Math;

  constructor(
    public comparisonService: ComparisonService,
    private cartService: CartService
  ) {}

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }
}
