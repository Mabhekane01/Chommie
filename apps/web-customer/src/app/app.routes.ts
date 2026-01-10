import { Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'orders', component: OrderHistoryComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
