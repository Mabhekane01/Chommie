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
    // Mock data for now until backend vendor endpoints are ready
    return of([
      {
        id: 'ord-123',
        totalAmount: 12999.00,
        status: 'PAID',
        createdAt: new Date(),
        items: [{ productName: 'Samsung TV', quantity: 1 }]
      },
      {
        id: 'ord-124',
        totalAmount: 3499.00,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 86400000),
        items: [{ productName: 'Adidas Ultraboost', quantity: 1 }]
      }
    ]);
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/products`);
  }

  createProduct(product: any): Observable<any> {
    const vendorId = localStorage.getItem('vendor_id');
    return this.http.post(`${environment.apiUrl}/products`, { ...product, vendorId });
  }
}
