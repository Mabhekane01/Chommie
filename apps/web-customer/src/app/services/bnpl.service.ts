import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum TrustTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export interface TrustProfile {
  userId: string;
  currentScore: number;
  tier: TrustTier;
  totalPayments: number;
  onTimePayments: number;
  totalOrders: number;
  averagePaymentDelayDays: number;
  disputeCount: number;
  lastCalculatedAt: Date;
  creditLimit: number;
}

@Injectable({
  providedIn: 'root'
})
export class BnplService {
  private apiUrl = 'http://localhost:3000/bnpl'; // Assuming API Gateway is on 3000

  constructor(private http: HttpClient) {}

  getProfile(userId: string): Observable<TrustProfile> {
    return this.http.get<TrustProfile>(`${this.apiUrl}/trust-score/${userId}`);
  }

  createProfile(userId: string): Observable<TrustProfile> {
    return this.http.post<TrustProfile>(`${this.apiUrl}/trust-score/${userId}`, {});
  }

  calculateScore(userId: string): Observable<TrustProfile> {
    return this.http.post<TrustProfile>(`${this.apiUrl}/trust-score/${userId}/calculate`, {});
  }
}
