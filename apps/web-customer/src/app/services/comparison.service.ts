import { Injectable, signal, effect } from '@angular/core';
import { IProduct } from '@chommie/shared-types';

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {
  compareList = signal<IProduct[]>(JSON.parse(localStorage.getItem('comparison_list') || '[]'));

  constructor() {
    // Sync with local storage
    effect(() => {
      localStorage.setItem('comparison_list', JSON.stringify(this.compareList()));
    });
  }

  addToCompare(product: IProduct) {
    // Limit to 4 items
    if (this.compareList().length >= 4) {
      alert('You can compare up to 4 items.');
      return;
    }
    
    // Check if already added
    if (this.compareList().some(p => (p.id || p._id) === (product.id || product._id))) {
      return;
    }

    // Check category consistency (optional but good for UX)
    if (this.compareList().length > 0 && this.compareList()[0].category !== product.category) {
      if (!confirm('This item is in a different category. Start a new comparison?')) {
        return;
      }
      this.compareList.set([product]);
      return;
    }

    this.compareList.update(list => [...list, product]);
  }

  removeFromCompare(productId: string) {
    this.compareList.update(list => list.filter(p => (p.id || p._id) !== productId));
  }

  clearComparison() {
    this.compareList.set([]);
  }
}
