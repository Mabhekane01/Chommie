import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-gray-900">Vendor Portal</h1>
            </div>
            <div class="flex items-center">
              <a routerLink="/dashboard" class="text-indigo-600 hover:text-indigo-900 font-medium">Back to Dashboard</a>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">List a New Product</h3>
            <div class="mt-5">
              <form (ngSubmit)="onSubmit()" class="space-y-6">
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Product Name</label>
                  <input type="text" name="name" [(ngModel)]="product.name" required
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" rows="3" [(ngModel)]="product.description" required
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>

                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Price (ZAR)</label>
                    <input type="number" name="price" [(ngModel)]="product.price" required min="0"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category" [(ngModel)]="product.category" required
                      class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home">Home</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Stock Quantity</label>
                  <input type="number" name="stock" [(ngModel)]="product.stock" required min="0"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Image URL</label>
                  <input type="text" name="image" [(ngModel)]="product.image" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="https://example.com/image.jpg">
                </div>

                <div class="flex items-center">
                  <input id="bnpl" name="bnplEligible" type="checkbox" [(ngModel)]="product.bnplEligible"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                  <label for="bnpl" class="ml-2 block text-sm text-gray-900">Enable BNPL for this product</label>
                </div>

                <div class="pt-5">
                  <div class="flex justify-end">
                    <button type="button" routerLink="/dashboard"
                      class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Cancel
                    </button>
                    <button type="submit" [disabled]="submitting()"
                      class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                      {{ submitting() ? 'Saving...' : 'Save Product' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ProductCreateComponent {
  product = {
    name: '',
    description: '',
    price: 0,
    category: 'Electronics',
    stock: 10,
    image: '',
    bnplEligible: true
  };
  submitting = signal(false);

  constructor(private vendorService: VendorService, private router: Router) {}

  onSubmit() {
    this.submitting.set(true);
    // Transform simple image string to array for backend
    const productData = {
        ...this.product,
        images: this.product.image ? [this.product.image] : []
    };
    
    this.vendorService.createProduct(productData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.submitting.set(false);
        alert('Failed to create product');
      }
    });
  }
}
