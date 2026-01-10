import { Injectable, computed, signal } from '@angular/core';
import { IProduct } from '@chommie/shared-types';

export interface CartItem extends IProduct {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);

  totalAmount = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  addToCart(product: IProduct) {
    this.cartItems.update(items => {
      const existingItem = items.find(i => i.id === product.id);
      if (existingItem) {
        return items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { ...product, quantity: 1 }];
    });
  }

  removeFromCart(productId: string) {
    this.cartItems.update(items => items.filter(i => i.id !== productId));
  }

  updateQuantity(productId: string, quantity: number) {
    this.cartItems.update(items => {
      if (quantity <= 0) {
        return items.filter(i => i.id !== productId);
      }
      return items.map(i => i.id === productId ? { ...i, quantity } : i);
    });
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
