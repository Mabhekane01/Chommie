import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TrustScoreWidgetComponent } from './components/trust-score-widget/trust-score-widget';
import { FabCartComponent } from './components/fab-cart/fab-cart.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CartService } from './services/cart.service';
import { ProductService } from './services/product.service';
import { TranslationService } from './services/translation.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule, TrustScoreWidgetComponent, FabCartComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isLoggedIn = signal(false);
  userId = signal<string | null>(null);
  showNotifications = signal(false);
  showSidebar = signal(false);
  
  // Location & Language
  showLocationModal = signal(false);
  showLanguageModal = signal(false);
  currentLocation = signal(localStorage.getItem('delivery_location') || 'South Africa');
  currentLanguage = signal(localStorage.getItem('app_language') || 'EN');
  
  // Search state
  searchQuery = '';
  selectedCategory = 'All';
  categories = signal(['All', 'Electronics', 'Books', 'Fashion', 'Home', 'Beauty', 'Sports']);
  suggestions = signal<string[]>([]);
  showSuggestions = signal(false);
  private searchSubject = new Subject<string>();

  cartItemCount = computed(() => {
    return this.cartService.cartItems().reduce((acc, item) => acc + item.quantity, 0);
  });

  constructor(
    private router: Router, 
    public cartService: CartService,
    private productService: ProductService,
    public notificationService: NotificationService,
    public ts: TranslationService
  ) {
    // Setup autocomplete debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) return [ { suggestions: [] } ];
        return this.productService.getSuggestions(query);
      })
    ).subscribe(result => {
      this.suggestions.set(result.suggestions);
      this.showSuggestions.set(result.suggestions.length > 0);
    });
  }

  ngOnInit() {
    this.checkAuth();
    if (this.userId()) {
      this.notificationService.loadNotifications(this.userId()!);
    }
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
  }

  updateLocation(location: string) {
    this.currentLocation.set(location);
    localStorage.setItem('delivery_location', location);
    this.showLocationModal.set(false);
    // In a real app, trigger a reload or service update here
  }

  updateLanguage(lang: string) {
    this.currentLanguage.set(lang);
    this.ts.setLanguage(lang);
    this.showLanguageModal.set(false);
  }

  markNotificationRead(id: string) {
    this.notificationService.markAsRead(id);
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }

  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.showSuggestions.set(false);
    this.performSearch();
  }

  performSearch() {
    const query = this.searchQuery.trim();
    const category = this.selectedCategory;
    
    this.showSuggestions.set(false);
    
    const queryParams: any = {};
    if (query) queryParams.q = query;
    if (category !== 'All') queryParams.category = category;
    
    this.router.navigate(['/products'], { queryParams });
  }

  checkAuth() {
    const token = localStorage.getItem('access_token');
    const id = localStorage.getItem('user_id');
    this.isLoggedIn.set(!!token);
    this.userId.set(id);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    this.isLoggedIn.set(false);
    this.userId.set(null);
    this.router.navigate(['/login']);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}