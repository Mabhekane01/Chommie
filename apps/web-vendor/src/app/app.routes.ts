import { Routes } from '@angular/router';
import { VendorDashboardComponent } from './pages/dashboard/dashboard.component';
import { VendorOrdersComponent } from './pages/orders/orders.component';
import { ProductCreateComponent } from './pages/product-create/product-create.component';
import { VendorReviewsComponent } from './pages/vendor-reviews/vendor-reviews.component';
import { VendorPromotionsComponent } from './pages/promotions/promotions.component';
import { VendorInventoryComponent } from './pages/inventory/inventory.component';
import { VendorMessagesComponent } from './pages/messages/messages.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: VendorDashboardComponent, canActivate: [authGuard] },
  { path: 'orders', component: VendorOrdersComponent, canActivate: [authGuard] },
  { path: 'messages', component: VendorMessagesComponent, canActivate: [authGuard] },
  { path: 'reviews', component: VendorReviewsComponent, canActivate: [authGuard] },
  { path: 'promotions', component: VendorPromotionsComponent, canActivate: [authGuard] },
  { path: 'inventory', component: VendorInventoryComponent, canActivate: [authGuard] },
  { path: 'products/create', component: ProductCreateComponent, canActivate: [authGuard] }
];