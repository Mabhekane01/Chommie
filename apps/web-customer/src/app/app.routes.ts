import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { BnplDashboardComponent } from './pages/bnpl-dashboard/bnpl-dashboard.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ReturnRequestComponent } from './pages/return-request/return-request.component';
import { SellerProfileComponent } from './pages/seller-profile/seller-profile.component';
import { ComparisonComponent } from './pages/comparison/comparison.component';
import { OrderTrackingComponent } from './pages/order-tracking/order-tracking.component';
import { HelpComponent } from './pages/help/help.component';
import { GiftCardsComponent } from './pages/gift-cards/gift-cards.component';
import { SellComponent } from './pages/sell/sell.component';
import { AccountComponent } from './pages/account/account.component';
import { SecurityComponent } from './pages/account/security/security.component';
import { AddressesComponent } from './pages/account/addresses/addresses.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'sellers/:id', component: SellerProfileComponent },
  { path: 'compare', component: ComparisonComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderHistoryComponent, canActivate: [authGuard] },
  { path: 'orders/track/:id', component: OrderTrackingComponent, canActivate: [authGuard] },
  { path: 'returns/:id', component: ReturnRequestComponent, canActivate: [authGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [authGuard] },
  { path: 'help', component: HelpComponent },
  { path: 'gift-cards', component: GiftCardsComponent },
  { path: 'sell', component: SellComponent },
  { path: 'account', component: AccountComponent, canActivate: [authGuard] },
  { path: 'account/security', component: SecurityComponent, canActivate: [authGuard] },
  { path: 'account/addresses', component: AddressesComponent, canActivate: [authGuard] },
  { path: 'bnpl', component: BnplDashboardComponent, canActivate: [authGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent }
];
