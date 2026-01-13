import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateOrderDto {
  userId: string;
  paymentMethod: 'CARD' | 'EFT' | 'BNPL' | 'ZAPPER' | 'SNAPSCAN';
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.apiUrl, orderData);
  }

  requestReturn(userId: string, returnData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/return`, { userId, returnData });
  }

  getUserReturns(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/returns/${userId}`);
  }

  getUserOrders(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  validateCoupon(code: string, orderAmount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-coupon`, { code, orderAmount });
  }
}
