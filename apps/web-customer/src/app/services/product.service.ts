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

  getFilteredProducts(filters: any): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.apiUrl}/filter`, { params: filters });
  }

  searchProducts(query: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.apiUrl}/search/query`, {
      params: { q: query }
    });
  }

  getSuggestions(query: string): Observable<{ suggestions: string[] }> {
    return this.http.get<{ suggestions: string[] }>(`${this.apiUrl}/search/suggest`, {
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

  voteHelpful(reviewId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reviews/${reviewId}/helpful`, {});
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

  getSellerReviews(vendorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reviews/seller/${vendorId}`);
  }

  addSellerReview(review: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reviews/seller`, review);
  }

  getRelatedProducts(productId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${environment.apiUrl}/recommendations/related/${productId}`);
  }

  getFrequentlyBoughtTogether(productId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${environment.apiUrl}/recommendations/frequently-bought/${productId}`);
  }

  getProductComparison(productId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${environment.apiUrl}/recommendations/comparison/${productId}`);
  }

  getPersonalizedRecommendations(userId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${environment.apiUrl}/recommendations/user/${userId}`);
  }

  getQuestions(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${productId}/questions`);
  }

  askQuestion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/questions`, data);
  }

  answerQuestion(questionId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/questions/${questionId}/answer`, data);
  }
}
