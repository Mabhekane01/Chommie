import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VendorOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  items: any[];
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = `${environment.apiUrl}/vendors`;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<VendorOrder[]> {
    const vendorId = localStorage.getItem('vendor_id') || 'vendor-1'; // Fallback for dev
    return this.http.get<VendorOrder[]>(`${environment.apiUrl}/orders/vendor/${vendorId}`);
  }

  getProducts(): Observable<any[]> {
    const vendorId = localStorage.getItem('vendor_id') || 'vendor-1';
    return this.http.get<any[]>(`${environment.apiUrl}/products/vendor/${vendorId}`);
  }

  createProduct(product: any): Observable<any> {
    const vendorId = localStorage.getItem('vendor_id');
    return this.http.post(`${environment.apiUrl}/products`, { ...product, vendorId });
  }

  updateProduct(product: any): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/products/${product._id || product.id}`, product);
  }

  getReviews(): Observable<any[]> {
    const vendorId = localStorage.getItem('vendor_id') || 'vendor-1';
    return this.http.get<any[]>(`${environment.apiUrl}/reviews/vendor/${vendorId}`);
  }

  createCoupon(coupon: any): Observable<any> {
    const vendorId = localStorage.getItem('vendor_id') || 'vendor-1';
    return this.http.post(`${environment.apiUrl}/orders/coupons`, { ...coupon, vendorId });
  }

  getCoupons(): Observable<any[]> {
    const vendorId = localStorage.getItem('vendor_id') || 'vendor-1';
    return this.http.get<any[]>(`${environment.apiUrl}/orders/coupons/vendor/${vendorId}`);
  }
}
