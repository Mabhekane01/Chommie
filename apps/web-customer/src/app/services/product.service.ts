import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IProduct, CreateProductDto, UpdateProductDto } from '@chommie/shared-types';
import { environment } from '../../environments/environment';

const MOCK_PRODUCTS: IProduct[] = [
  {
    _id: 'p1',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation, exceptional sound quality, and crystal-clear hands-free calling.',
    price: 6999,
    category: 'Electronics',
    stock: 50,
    images: ['https://m.media-amazon.com/images/I/61vJtKbAssL._AC_SL1500_.jpg'],
    ratings: 4.8,
    numReviews: 1250,
    isLightningDeal: true,
    discountPrice: 5999,
    createdAt: new Date(),
    bnplEligible: true,
    trustScoreDiscount: 10,
    vendorId: 'v1',
    bulkPricing: [
        { minQuantity: 5, discountPercentage: 10 },
        { minQuantity: 10, discountPercentage: 20 }
    ]
  },
  {
    _id: 'p2',
    name: 'Apple MacBook Air M2 - Midnight',
    description: 'Supercharged by M2. 13.6-inch Liquid Retina display, 8GB RAM, 256GB SSD storage.',
    price: 23999,
    category: 'Electronics',
    stock: 5,
    lowStockThreshold: 10,
    images: ['https://m.media-amazon.com/images/I/719C6bJv8jL._AC_SL1500_.jpg'],
    ratings: 4.9,
    numReviews: 890,
    createdAt: new Date(),
    bnplEligible: true,
    trustScoreDiscount: 0,
    vendorId: 'v1'
  },
  {
    _id: 'p3',
    name: 'Nespresso Vertuo Next Coffee Machine',
    description: 'Versatile brewing machine for 5 cup sizes. One-touch brewing system.',
    price: 3299,
    category: 'Home',
    stock: 100,
    images: ['https://m.media-amazon.com/images/I/71glf+X+HCL._AC_SL1500_.jpg'],
    ratings: 4.5,
    numReviews: 450,
    isLightningDeal: true,
    discountPrice: 2499,
    createdAt: new Date(),
    bnplEligible: true,
    trustScoreDiscount: 5,
    vendorId: 'v2'
  },
  {
    _id: 'p4',
    name: 'Samsung 65" QLED 4K Smart TV',
    description: 'Quantum Dot technology with 100% Color Volume. AirSlim design.',
    price: 14999,
    category: 'Electronics',
    stock: 2,
    lowStockThreshold: 10,
    images: ['https://m.media-amazon.com/images/I/914ZFE5Rk1L._AC_SL1500_.jpg'],
    ratings: 4.7,
    numReviews: 320,
    createdAt: new Date(),
    bnplEligible: false,
    trustScoreDiscount: 0,
    vendorId: 'v1'
  },
  {
    _id: 'p5',
    name: 'Adidas Ultraboost Light Running Shoes',
    description: 'Lightest Ultraboost ever. Responsive energy return and cushioning.',
    price: 2499,
    category: 'Fashion',
    stock: 200,
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/0fbed4646c1d46e0aae0af260107e982_9366/Ultraboost_Light_Running_Shoes_White_HQ6351_01_standard.jpg'],
    ratings: 4.6,
    numReviews: 120,
    createdAt: new Date(),
    bnplEligible: true,
    trustScoreDiscount: 10,
    vendorId: 'v3'
  },
  {
    _id: 'p6',
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker and warmer.',
    price: 1999,
    category: 'Home',
    stock: 80,
    images: ['https://m.media-amazon.com/images/I/71WtwEvYDOS._AC_SL1500_.jpg'],
    ratings: 4.8,
    numReviews: 5000,
    isLightningDeal: true,
    discountPrice: 1599,
    createdAt: new Date(),
    bnplEligible: true,
    trustScoreDiscount: 5,
    vendorId: 'v2'
  },
  {
    _id: 'p7',
    name: 'Kindle Paperwhite (16 GB)',
    description: 'Now with a 6.8" display and thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster turns.',
    price: 3499,
    category: 'Electronics',
    stock: 60,
    images: ['https://m.media-amazon.com/images/I/51p4bEivw5L._AC_SL1000_.jpg'],
    ratings: 4.9,
    numReviews: 2100,
    createdAt: new Date(),
    bnplEligible: true,
    trustScoreDiscount: 0,
    vendorId: 'v1'
  },
  {
    _id: 'p8',
    name: 'Levi\'s Men\'s 501 Original Fit Jeans',
    description: 'The original blue jean since 1873. Straight leg with button fly.',
    price: 899,
    category: 'Fashion',
    stock: 150,
    images: ['https://m.media-amazon.com/images/I/61s-L+X5wCL._AC_UX569_.jpg'],
    ratings: 4.4,
    numReviews: 300,
    createdAt: new Date(),
    bnplEligible: true,
    trustScoreDiscount: 10,
    vendorId: 'v3'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.apiUrl).pipe(
      catchError(() => of(MOCK_PRODUCTS))
    );
  }

  getProduct(id: string): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const p = MOCK_PRODUCTS.find(p => p._id === id || p.id === id);
        return p ? of(p) : of(MOCK_PRODUCTS[0]);
      })
    );
  }

  getProductsByCategory(category: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.apiUrl}/category/${category}`).pipe(
      catchError(() => {
        if (!category) return of(MOCK_PRODUCTS);
        return of(MOCK_PRODUCTS.filter(p => p.category === category));
      })
    );
  }

  getFilteredProducts(filters: any): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.apiUrl}/filter`, { params: filters }).pipe(
      catchError(() => {
        let res = [...MOCK_PRODUCTS];
        if (filters.category) res = res.filter(p => p.category === filters.category);
        if (filters.isLightningDeal) res = res.filter(p => p.isLightningDeal);
        if (filters.query) {
            const q = filters.query.toLowerCase();
            res = res.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }
        return of(res);
      })
    );
  }

  searchProducts(query: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.apiUrl}/search/query`, {
      params: { q: query }
    }).pipe(
      catchError(() => {
        const q = query.toLowerCase();
        return of(MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(q)));
      })
    );
  }

  getSuggestions(query: string): Observable<{ suggestions: {text: string, category?: string}[] }> {
    return this.http.get<{ suggestions: {text: string, category?: string}[] }>(`${this.apiUrl}/search/suggest`, {
      params: { q: query }
    }).pipe(
      catchError(() => {
        const q = query.toLowerCase();
        const results: {text: string, category?: string}[] = [];
        
        // 1. Exact match suggestions
        MOCK_PRODUCTS
            .filter(p => p.name.toLowerCase().includes(q))
            .slice(0, 3)
            .forEach(p => results.push({ text: p.name }));

        // 2. Scoped suggestions (Amazon Style)
        const categories = Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)));
        categories.forEach(cat => {
            results.push({ text: query, category: cat });
        });

        return of({ suggestions: results.slice(0, 8) });
      })
    );
  }

  createProduct(product: CreateProductDto): Observable<IProduct> {
    return this.http.post<IProduct>(this.apiUrl, product).pipe(
        catchError(() => {
            const newP = { ...product, _id: 'mock_' + Date.now(), createdAt: new Date(), ratings: 0, numReviews: 0 } as IProduct;
            MOCK_PRODUCTS.push(newP);
            return of(newP);
        })
    );
  }

  updateProduct(id: string, product: UpdateProductDto): Observable<IProduct> {
    return this.http.patch<IProduct>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getReviews(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reviews/product/${productId}`).pipe(
        catchError(() => of([
            { _id: 'r1', userName: 'John Doe', rating: 5, comment: 'Amazing product! Delivered in 1 day.', verifiedPurchase: true, helpfulVotes: 12, createdAt: new Date() },
            { _id: 'r2', userName: 'Jane Smith', rating: 4, comment: 'Good quality, but a bit pricey.', verifiedPurchase: true, helpfulVotes: 3, createdAt: new Date() }
        ]))
    );
  }

  addReview(review: { productId: string; userId: string; userName: string; rating: number; comment: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reviews`, review).pipe(
        catchError(() => of({ ...review, _id: 'mock_rev', createdAt: new Date() }))
    );
  }

  voteHelpful(reviewId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reviews/${reviewId}/helpful`, {}).pipe(catchError(() => of({})));
  }

  getWishlist(userId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/wishlist/${userId}`).pipe(
        catchError(() => of({ products: [] }))
    );
  }

  addToWishlist(userId: string, productId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/wishlist`, { userId, productId }).pipe(catchError(() => of({})));
  }

  removeFromWishlist(userId: string, productId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/wishlist/${userId}/${productId}`).pipe(catchError(() => of({})));
  }

  getSellerReviews(vendorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reviews/seller/${vendorId}`).pipe(catchError(() => of([])));
  }

  addSellerReview(review: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reviews/seller`, review).pipe(catchError(() => of({})));
  }

  getRelatedProducts(productId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${environment.apiUrl}/recommendations/related/${productId}`).pipe(
        catchError(() => of(MOCK_PRODUCTS.slice(0, 4)))
    );
  }

  getFrequentlyBoughtTogether(productId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${environment.apiUrl}/recommendations/frequently-bought/${productId}`).pipe(
        catchError(() => of(MOCK_PRODUCTS.slice(4, 6)))
    );
  }

  getProductComparison(productId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${environment.apiUrl}/recommendations/comparison/${productId}`).pipe(
        catchError(() => of(MOCK_PRODUCTS.slice(0, 3)))
    );
  }

  getAlsoViewedProducts(productId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${environment.apiUrl}/recommendations/also-viewed/${productId}`).pipe(
        catchError(() => of(MOCK_PRODUCTS.slice(2, 6)))
    );
  }

  getPersonalizedRecommendations(userId: string): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${environment.apiUrl}/recommendations/user/${userId}`).pipe(
        catchError(() => of(MOCK_PRODUCTS.reverse().slice(0, 4)))
    );
  }

  getProductInsight(productId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/recommendations/insight/${productId}`).pipe(
        catchError(() => of({
            summary: 'A highly rated choice for professionals seeking efficiency and reliability.',
            pros: ['Excellent performance', 'Sleek design'],
            cons: ['Standard warranty'],
            sentiment: 'Positive'
        }))
    );
  }

  getQuestions(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${productId}/questions`).pipe(
        catchError(() => of([
            { 
                text: 'Does this come with a warranty?', 
                answers: [{ text: 'Yes, 1 year manufacturer warranty.', userName: 'TechGiant', createdAt: new Date() }] 
            }
        ]))
    );
  }

  askQuestion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/questions`, data).pipe(catchError(() => of({})));
  }

  answerQuestion(questionId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/questions/${questionId}/answer`, data).pipe(catchError(() => of({})));
  }

  aiChat(query: string, userId?: string | null): Observable<any> {
    return this.http.post(`${environment.apiUrl}/ai/chat`, { query, userId });
  }

  getDeliveryEstimation(productId: string, zipCode?: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productId}/delivery-estimation`, {
        params: zipCode ? { zipCode } : {}
    }).pipe(
        catchError(() => {
            const date = new Date();
            date.setDate(date.getDate() + 3);
            return of({
                estimatedDate: date,
                days: 3,
                formattedDate: date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })
            });
        })
    );
  }

  getPurchasedProductIds(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/orders/user/${userId}/purchased-products`).pipe(
        catchError(() => of([]))
    );
  }
}
