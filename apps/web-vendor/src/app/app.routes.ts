import { Routes } from '@angular/router';
import { VendorDashboardComponent } from './pages/dashboard/dashboard.component';
import { VendorOrdersComponent } from './pages/orders/orders.component';
import { OrderDetailsComponent } from './pages/order-details/order-details.component';
import { ProductCreateComponent } from './pages/product-create/product-create.component';
import { VendorReviewsComponent } from './pages/vendor-reviews/vendor-reviews.component';
import { VendorPromotionsComponent } from './pages/promotions/promotions.component';
import { VendorInventoryComponent } from './pages/inventory/inventory.component';
import { VendorSettingsComponent } from './pages/settings/settings.component';
import { VendorMessagesComponent } from './pages/messages/messages.component';
import { ProductEditComponent } from './pages/product-edit/product-edit.component';
import { SecurityComponent } from './pages/account/security/security.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'dashboard', component: VendorDashboardComponent, canActivate: [authGuard] },
  { path: 'orders', component: VendorOrdersComponent, canActivate: [authGuard] },
  { path: 'orders/:id', component: OrderDetailsComponent, canActivate: [authGuard] },
  { path: 'messages', component: VendorMessagesComponent, canActivate: [authGuard] },
  { path: 'vendor-reviews', component: VendorReviewsComponent, canActivate: [authGuard] },
  { path: 'promotions', component: VendorPromotionsComponent, canActivate: [authGuard] },
  { path: 'inventory', component: VendorInventoryComponent, canActivate: [authGuard] },
  { path: 'settings', component: VendorSettingsComponent, canActivate: [authGuard] },
  { path: 'account/security', component: SecurityComponent, canActivate: [authGuard] },
  { path: 'products/create', component: ProductCreateComponent, canActivate: [authGuard] },
  { path: 'products/edit/:id', component: ProductEditComponent, canActivate: [authGuard] }
];