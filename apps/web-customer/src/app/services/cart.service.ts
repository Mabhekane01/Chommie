import { Injectable, computed, signal } from '@angular/core';
import { IProduct } from '@chommie/shared-types';

export interface CartItem extends IProduct {
  quantity: number;
  selectedVariants?: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);
  savedItems = signal<CartItem[]>([]);

  totalAmount = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  private isSameItem(item: CartItem, product: any): boolean {
    if (item.id !== (product.id || product._id)) return false;
    
    // Compare variants
    const v1 = item.selectedVariants || {};
    const v2 = product.selectedVariants || {};
    
    const keys1 = Object.keys(v1);
    const keys2 = Object.keys(v2);
    
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => v1[key] === v2[key]);
  }

  addToCart(product: any, quantity: number = 1) {
    this.cartItems.update(items => {
      const existingItem = items.find(i => this.isSameItem(i, product));
      if (existingItem) {
        return items.map(i => this.isSameItem(i, product) ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...items, { ...product, id: product.id || product._id, quantity }];
    });
  }

  removeFromCart(productId: string, variants?: any) {
    this.cartItems.update(items => items.filter(i => !this.isSameItem(i, { id: productId, selectedVariants: variants })));
  }

  updateQuantity(productId: string, quantity: number, variants?: any) {
    this.cartItems.update(items => {
      if (quantity <= 0) {
        return items.filter(i => !this.isSameItem(i, { id: productId, selectedVariants: variants }));
      }
      return items.map(i => this.isSameItem(i, { id: productId, selectedVariants: variants }) ? { ...i, quantity } : i);
    });
  }

  saveForLater(productId: string, variants?: any) {
    const itemToSave = this.cartItems().find(i => this.isSameItem(i, { id: productId, selectedVariants: variants }));
    if (itemToSave) {
      this.removeFromCart(productId, variants);
      this.savedItems.update(items => {
        const existing = items.find(i => this.isSameItem(i, { id: productId, selectedVariants: variants }));
        if (existing) return items; 
        return [...items, itemToSave];
      });
    }
  }

  moveToCart(productId: string, variants?: any) {
    const itemToMove = this.savedItems().find(i => this.isSameItem(i, { id: productId, selectedVariants: variants }));
    if (itemToMove) {
      this.removeFromSaved(productId, variants);
      this.addToCart(itemToMove);
    }
  }

  removeFromSaved(productId: string, variants?: any) {
    this.savedItems.update(items => items.filter(i => !this.isSameItem(i, { id: productId, selectedVariants: variants })));
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
