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
    const vendorId = localStorage.getItem('vendor_id') || 'vendor-1';
    return this.http.get<VendorOrder[]>(`${this.apiUrl}/${vendorId}/orders`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/orders/${orderId}/status`, { status });
  }

  getProducts(): Observable<any[]> {
    const vendorId = localStorage.getItem('vendor_id') || 'vendor-1';
    return this.http.get<any[]>(`${this.apiUrl}/${vendorId}/products`);
  }

  getProduct(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/products/${id}`);
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
    return this.http.get<any[]>(`${this.apiUrl}/${vendorId}/reviews`);
  }

  getVendorProfile(vendorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${vendorId}/profile`);
  }

  respondToReview(reviewId: string, response: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/reviews/${reviewId}/response`, { response });
  }

  createCoupon(coupon: any): Observable<any> {
    const vendorId = localStorage.getItem('vendor_id') || 'vendor-1';
    return this.http.post(`${environment.apiUrl}/orders/coupons`, { ...coupon, vendorId });
  }

  getCoupons(): Observable<any[]> {
    const vendorId = localStorage.getItem('vendor_id') || 'vendor-1';
    return this.http.get<any[]>(`${this.apiUrl}/${vendorId}/coupons`);
  }

  getStoreSettings(vendorId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/vendors/${vendorId}/settings`);
  }

  updateStoreSettings(vendorId: string, settings: any): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/vendors/${vendorId}/settings`, settings);
  }

  getPendingVendors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/approvals/pending`);
  }

  approveVendor(vendorId: string, status: 'APPROVED' | 'REJECTED'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${vendorId}/approve`, { status });
  }
}