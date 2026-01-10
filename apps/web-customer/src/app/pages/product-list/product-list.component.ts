import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { IProduct } from '@chommie/shared-types';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold">Products</h1>
        
        <div class="relative w-full md:w-96">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search products..." 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div *ngIf="loading()" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>

      <div *ngIf="!loading() && products().length === 0" class="text-center py-10">
        <p class="text-gray-500 text-xl">No products found for "{{ searchQuery }}".</p>
        <button (click)="loadProducts()" class="mt-4 text-green-700 font-semibold hover:underline">Clear Search</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div *ngFor="let product of products()" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div class="h-48 bg-gray-200 flex items-center justify-center relative group cursor-pointer" [routerLink]="['/products', product.id]">
            <img *ngIf="product.images && product.images.length > 0" [src]="product.images[0]" [alt]="product.name" class="object-cover h-full w-full">
            <span *ngIf="!product.images || product.images.length === 0" class="text-gray-400">No Image</span>
            
            <div *ngIf="product.bnplEligible" class="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                BNPL
            </div>
          </div>
          <div class="p-4">
            <div class="text-xs text-green-700 font-bold mb-1 uppercase tracking-wider">{{ product.category }}</div>
            <h2 class="text-lg font-semibold mb-2 truncate cursor-pointer hover:text-green-700" [routerLink]="['/products', product.id]">{{ product.name }}</h2>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2 h-10">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-green-800">R{{ product.price | number:'1.2-2' }}</span>
            </div>
            <button (click)="addToCart(product)" class="w-full mt-4 bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition-colors shadow-sm">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products = signal<IProduct[]>([]);
  loading = signal(true);
  searchQuery = '';
  private searchSubject = new Subject<string>();

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.searchQuery = '';
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.loading.set(false);
      }
    });
  }

  onSearchChange(query: string) {
    if (!query) {
      this.loadProducts();
      return;
    }
    this.searchSubject.next(query);
  }

  performSearch(query: string) {
    this.loading.set(true);
    this.productService.searchProducts(query).subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error searching products', err);
        this.loading.set(false);
      }
    });
  }

  addToCart(product: IProduct) {
    this.cartService.addToCart(product);
    console.log('Added to cart:', product.name);
  }
}