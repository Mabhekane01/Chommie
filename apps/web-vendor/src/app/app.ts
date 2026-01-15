import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { DeviceService } from './services/device.service';
import { TranslationService } from './services/translation.service';
import { VendorService } from './services/vendor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private vendorService = inject(VendorService);
  private router = inject(Router);

  isLoggedIn = signal(false);
  vendorName = signal<string | null>(null);
  showSidebar = signal(false);
  currentUrl = signal('');

  showNav = computed(() => {
    const url = this.currentUrl();
    const authRoutes = ['/login', '/register'];
    return !authRoutes.some(route => url.startsWith(route));
  });

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects || event.url);
    });
  }

  ngOnInit() {
    this.currentUrl.set(window.location.pathname);
    this.checkAuth();
  }

  checkAuth() {
    const token = localStorage.getItem('access_token');
    const name = localStorage.getItem('user_name');
    this.isLoggedIn.set(!!token);
    this.vendorName.set(name || 'Vendor');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
