import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, filter } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TrustScoreWidgetComponent } from './components/trust-score-widget/trust-score-widget';
import { FabCartComponent } from './components/fab-cart/fab-cart.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotificationDropdownComponent } from './components/notification-dropdown/notification-dropdown.component';
import { CartService } from './services/cart.service';
import { ProductService } from './services/product.service';
import { TranslationService } from './services/translation.service';
import { NotificationService } from './services/notification.service';
import { BnplService } from './services/bnpl.service';
import { DeviceService } from './services/device.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule, TrustScoreWidgetComponent, FabCartComponent, SidebarComponent, NotificationDropdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isLoggedIn = signal(false);
  userName = signal<string | null>(null);
  userId = signal<string | null>(null);
  showNotifications = signal(false);
  showSidebar = signal(false);
  coinsBalance = signal(0);
  currentUrl = signal('');
  
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

  showNav = computed(() => {
    const url = this.currentUrl();
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    return !authRoutes.some(route => url.startsWith(route));
  });

  constructor(
    private router: Router, 
    public cartService: CartService,
    private productService: ProductService,
    public notificationService: NotificationService,
    public ts: TranslationService,
    private bnplService: BnplService,
    public deviceService: DeviceService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects || event.url);
    });

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
    this.currentUrl.set(window.location.pathname);
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
  }

  updateLanguage(lang: string) {
    this.currentLanguage.set(lang);
    localStorage.setItem('app_language', lang);
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

  buyAgain() {
    if (!this.isLoggedIn()) {
        this.router.navigate(['/login']);
        return;
    }
    this.router.navigate(['/products'], { queryParams: { filter: 'buy-again' } });
  }

  checkAuth() {
    const token = localStorage.getItem('access_token');
    const id = localStorage.getItem('user_id');
    const name = localStorage.getItem('user_name');
    this.isLoggedIn.set(!!token);
    this.userId.set(id);
    this.userName.set(name || 'User');

    if (id) {
      this.bnplService.getProfile(id).subscribe(profile => {
        if (profile) {
          this.coinsBalance.set(profile.coinsBalance);
        }
      });
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    this.isLoggedIn.set(false);
    this.userId.set(null);
    this.userName.set(null);
    this.router.navigate(['/login']);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}