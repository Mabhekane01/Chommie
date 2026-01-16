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
  cartItems = signal<CartItem[]>(this.loadCart('cart'));
  savedItems = signal<CartItem[]>(this.loadCart('saved'));

  totalAmount = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  private loadCart(key: string): CartItem[] {
    const saved = localStorage.getItem(`chommie_${key}`);
    return saved ? JSON.parse(saved) : [];
  }

  private saveCart(key: string, items: CartItem[]) {
    localStorage.setItem(`chommie_${key}`, JSON.stringify(items));
  }

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
      let newItems;
      if (existingItem) {
        newItems = items.map(i => this.isSameItem(i, product) ? { ...i, quantity: i.quantity + quantity } : i);
      } else {
        newItems = [...items, { ...product, id: product.id || product._id, quantity }];
      }
      this.saveCart('cart', newItems);
      return newItems;
    });
  }

  removeFromCart(productId: string, variants?: any) {
    this.cartItems.update(items => {
        const newItems = items.filter(i => !this.isSameItem(i, { id: productId, selectedVariants: variants }));
        this.saveCart('cart', newItems);
        return newItems;
    });
  }

  updateQuantity(productId: string, quantity: number, variants?: any) {
    this.cartItems.update(items => {
      let newItems;
      if (quantity <= 0) {
        newItems = items.filter(i => !this.isSameItem(i, { id: productId, selectedVariants: variants }));
      } else {
        newItems = items.map(i => this.isSameItem(i, { id: productId, selectedVariants: variants }) ? { ...i, quantity } : i);
      }
      this.saveCart('cart', newItems);
      return newItems;
    });
  }

  saveForLater(productId: string, variants?: any) {
    const itemToSave = this.cartItems().find(i => this.isSameItem(i, { id: productId, selectedVariants: variants }));
    if (itemToSave) {
      this.removeFromCart(productId, variants);
      this.savedItems.update(items => {
        const existing = items.find(i => this.isSameItem(i, { id: productId, selectedVariants: variants }));
        if (existing) return items; 
        const newItems = [...items, itemToSave];
        this.saveCart('saved', newItems);
        return newItems;
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
    this.savedItems.update(items => {
        const newItems = items.filter(i => !this.isSameItem(i, { id: productId, selectedVariants: variants }));
        this.saveCart('saved', newItems);
        return newItems;
    });
  }

  clearCart() {
    this.cartItems.set([]);
    this.saveCart('cart', []);
  }
}
