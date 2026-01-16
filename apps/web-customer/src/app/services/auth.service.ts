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
  isPlusMember = signal<boolean>(localStorage.getItem('is_plus') === 'true');

  constructor(private http: HttpClient, private router: Router) { }

  private getUserFromStorage() {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('access_token');
    return userId && token ? { id: userId, token } : null;
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.accessToken && res.user) {
          this.handleAuthSuccess(res);
        }
      })
    );
  }

  private handleAuthSuccess(res: any) {
    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('user_id', res.user.id);
    localStorage.setItem('user_name', `${res.user.firstName} ${res.user.lastName}`);
    localStorage.setItem('user_role', res.user.role);
    this.currentUser.set({ id: res.user.id, token: res.accessToken, role: res.user.role });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        if (res.accessToken && res.user) {
          this.handleAuthSuccess(res);
        }
      })
    );
  }

  requestEmailVerification(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-email-verification`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  verify2FA(email: string, otp: string) {
    return this.http.post(`${this.apiUrl}/verify-2fa`, { email, otp }).pipe(
      tap((res: any) => {
        if (res.accessToken && res.user) {
          this.handleAuthSuccess(res);
        }
      })
    );
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

  setPlusMember(isPlus: boolean) {
    localStorage.setItem('is_plus', isPlus ? 'true' : 'false');
    this.isPlusMember.set(isPlus);
  }

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    localStorage.removeItem('is_plus');
    this.currentUser.set(null);
    this.isPlusMember.set(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }
}