import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  
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
    // Component handles session storage to avoid double tap logic issues shown in current file
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
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

  private setSession(userId: string, token: string) {
    localStorage.setItem('user_id', userId);
    localStorage.setItem('access_token', token);
    this.currentUser.set({ id: userId, token });
  }
}
