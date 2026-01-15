import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export enum TrustTier {
...
})
export class BnplService {
  private apiUrl = `${environment.apiUrl}/bnpl`;
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

  useCoins(userId: string, amount: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/use-coins`, { userId, amount });
  }

  getPlans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/plans/${userId}`);
  }

  payInstallment(planId: string, installmentIndex: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/pay`, { planId, installmentIndex });
  }
}
