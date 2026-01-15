import { Injectable as NgInjectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@NgInjectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`; // Gateway

  constructor(private http: HttpClient) {}

  getVendorOrders(vendorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vendor/${vendorId}`);
  }

  getOrder(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateStatus(orderId: string, status: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/status`, { status });
  }
}
