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
      'sidebar.trending': 'Trending',
      'sidebar.best_sellers': 'Best Sellers',
      'sidebar.new_releases': 'New Releases',
      'sidebar.shop_by_dept': 'Shop By Department',
      'sidebar.programs': 'Programs & Features',
      'sidebar.help_settings': 'Help & Settings',
      'search.placeholder': 'Search Chommie...',
      'hero.welcome': 'Welcome to Chommie',
      'hero.subtitle': 'Shop the latest deals and enjoy BNPL flexibility.',
      'product.add_to_cart': 'Add to Cart',
      'product.buy_now': 'Buy Now',
      'product.in_stock': 'In Stock',
      'product.out_of_stock': 'Out of Stock'
    },
    'ZU': {
      'nav.deals': "Iziphesheli zanamuhla",
      'nav.help': 'Usizo kumakhasimende',
      'nav.wishlist': 'Uhlu lwezifiso',
      'nav.giftcards': 'Amakhadi ezipho',
      'nav.sell': 'Dayisa',
      'nav.orders': 'Ukubuyisela nama-oda',
      'nav.cart': 'Inqola',
      'nav.account': 'I-akhawunti yakho',
      'nav.signout': 'Phuma',
      'nav.hello': 'Sawubona',
      'nav.signin': 'Ngena',
      'sidebar.trending': 'Okuthrendayo',
      'sidebar.best_sellers': 'Athengiswa kakhulu',
      'sidebar.new_releases': 'Okusha',
      'sidebar.shop_by_dept': 'Thenga Ngomnyango',
      'sidebar.programs': 'Izinhlelo nezici',
      'sidebar.help_settings': 'Usizo Nezilungiselelo',
      'search.placeholder': 'Sesha i-Chommie...',
      'hero.welcome': 'Siyakwamukela ku-Chommie',
      'hero.subtitle': 'Thenga iziphesheli zakamuva futhi ujabulele i-BNPL.',
      'product.add_to_cart': 'Faka enqoleni',
      'product.buy_now': 'Thenga manje',
      'product.in_stock': 'Ikhona esitokweni',
      'product.out_of_stock': 'Ayikho esitokweni'
    },
    'AF': {
      'nav.deals': "Vandag se aanbiedinge",
      'nav.help': 'Kliëntediens',
      'nav.wishlist': 'Wenslys',
      'nav.giftcards': 'Geskenkkaarte',
      'nav.sell': 'Verkoop',
      'nav.orders': 'Retoere en bestellings',
      'nav.cart': 'Mandjie',
      'nav.account': 'Jou rekening',
      'nav.signout': 'Teken uit',
      'nav.hello': 'Hallo',
      'nav.signin': 'Teken in',
      'sidebar.trending': 'Gewild',
      'sidebar.best_sellers': 'Bestsellers',
      'sidebar.new_releases': 'Nuwe vrystellings',
      'sidebar.shop_by_dept': 'Koop volgens afdeling',
      'sidebar.programs': 'Programme en kenmerke',
      'sidebar.help_settings': 'Hulp en instellings',
      'search.placeholder': 'Soek op Chommie...',
      'hero.welcome': 'Welkom by Chommie',
      'hero.subtitle': 'Koop die nuutste aanbiedinge en geniet BNPL.',
      'product.add_to_cart': 'Voeg by mandjie',
      'product.buy_now': 'Koop nou',
      'product.in_stock': 'In voorraad',
      'product.out_of_stock': 'Uit voorraad'
    }
  };

  setLanguage(lang: string) {
    this.currentLang.set(lang);
    localStorage.setItem('app_language', lang);
  }

  t(key: string): string {
    return this.translations[this.currentLang()][key] || key;
  }
}
