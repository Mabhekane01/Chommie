import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

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
  refreshProfile$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  triggerRefresh() {
    this.refreshProfile$.next();
  }

  getProfile(userId: string): Observable<TrustProfile> {
    return this.http.get<TrustProfile>(`${this.apiUrl}/trust-score/${userId}`);
  }

  createProfile(userId: string): Observable<TrustProfile> {
    return this.http.post<TrustProfile>(`${this.apiUrl}/trust-score/${userId}`, {});
  }

  calculateScore(userId: string): Observable<TrustProfile> {
    return this.http.post<TrustProfile>(`${this.apiUrl}/trust-score/${userId}/calculate`, {});
  }

  checkEligibility(userId: string, amount: number): Observable<{ eligible: boolean; reason?: string; limit: number }> {
    return this.http.post<{ eligible: boolean; reason?: string; limit: number }>(`${this.apiUrl}/eligibility`, { userId, amount });
  }

  getPlans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/plans/${userId}`);
  }

  payInstallment(planId: string, installmentIndex: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/pay`, { planId, installmentIndex });
  }
}
