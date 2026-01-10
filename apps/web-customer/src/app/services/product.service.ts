import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProduct, CreateProductDto, UpdateProductDto } from '@chommie/shared-types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.apiUrl);
  }

  getProduct(id: string): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(category: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.apiUrl}/category/${category}`);
  }

  searchProducts(query: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.apiUrl}/search/query`, {
      params: { q: query }
    });
  }

  createProduct(product: CreateProductDto): Observable<IProduct> {
    return this.http.post<IProduct>(this.apiUrl, product);
  }

  updateProduct(id: string, product: UpdateProductDto): Observable<IProduct> {
    return this.http.patch<IProduct>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getReviews(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reviews/product/${productId}`);
  }

  addReview(review: { productId: string; userId: string; userName: string; rating: number; comment: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reviews`, review);
  }

  getWishlist(userId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/wishlist/${userId}`);
  }

  addToWishlist(userId: string, productId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/wishlist`, { userId, productId });
  }

  removeFromWishlist(userId: string, productId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/wishlist/${userId}/${productId}`);
  }

  getRelatedProducts(productId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${environment.apiUrl}/recommendations/related/${productId}`);
  }
}
