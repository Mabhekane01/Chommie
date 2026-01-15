import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Track current user state
  currentUser = signal<any | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) { }

  private getUserFromStorage() {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('access_token');
    return userId && token ? { id: userId, token } : null;
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  requestEmailVerification(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-email-verification`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  verify2FA(email: string, otp: string) {
    return this.http.post(`${this.apiUrl}/verify-2fa`, { email, otp });
  }

  resendVerification(email: string) {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  toggle2FA(userId: string, enabled: boolean) {
    return this.http.post(`${this.apiUrl}/toggle-2fa`, { userId, enabled });
  }


  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  addAddress(userId: string, address: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/address`, { userId, address });
  }

  removeAddress(userId: string, addressId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/address/${userId}/${addressId}`);
  }

  getProfile(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${userId}`);
  }

  updateFavoriteCategory(userId: string, category: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/favorite-category`, { userId, category });
  }

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }
}