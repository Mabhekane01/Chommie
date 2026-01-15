import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal(localStorage.getItem('app_language') || 'EN');

  private translations: any = {
    'EN': {
      'nav.deals': "Today's Deals",
      'nav.help': 'Customer Service',
      'nav.wishlist': 'Wish List',
      'nav.giftcards': 'Gift Cards',
      'nav.sell': 'Sell',
      'nav.orders': 'Returns & Orders',
      'nav.cart': 'Cart',
      'nav.account': 'Your Account',
      'nav.signout': 'Sign Out',
      'nav.hello': 'Hello',
      'nav.signin': 'Sign in',
      'account.orders': 'Your Orders',
      'account.orders_desc': 'Track, return, or buy things again',
      'account.security': 'Login & security',
      'account.security_desc': 'Edit login, name, and mobile number',
      'account.addresses': 'Your Addresses',
      'account.addresses_desc': 'Edit addresses for orders and gifts',
      'account.payments': 'Your Payments',
      'search.placeholder': 'Search Chommie...'
    }
  };

  setLanguage(lang: string) {
    this.currentLang.set(lang);
    localStorage.setItem('app_language', lang);
  }

  t(key: string): string {
    const lang = this.currentLang();
    if (!this.translations[lang]) return key;
    return this.translations[lang][key] || key;
  }
}