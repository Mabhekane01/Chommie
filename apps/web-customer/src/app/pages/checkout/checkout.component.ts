import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { BnplService } from '../../services/bnpl.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white border-b border-gray-200 py-4 mb-6">
        <div class="container mx-auto px-4 max-w-[1150px] flex justify-between items-center">
            <h1 class="text-2xl font-bold tracking-tight text-primary cursor-pointer" routerLink="/">Chommie</h1>
            <h2 class="text-2xl font-normal">Checkout (<span class="text-amazon-link hover:text-action cursor-pointer" routerLink="/cart">{{ cartService.cartItems().length }} items</span>)</h2>
            <div class="w-8"></div> <!-- Spacer -->
        </div>
    </div>

    <div class="bg-[#EAEDED] min-h-screen pb-12">
      <div class="container mx-auto px-4 py-4 max-w-[1150px]">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <!-- Left: Checkout Steps -->
          <div class="lg:col-span-3 space-y-4">
            
            <!-- Step 1: Shipping Address -->
            <div class="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                <div class="flex gap-4">
                    <span class="text-lg font-bold text-gray-700">1</span>
                    <div class="flex-grow">
                        <div class="flex justify-between items-center mb-4">
                             <h3 class="text-lg font-bold">Shipping address</h3>
                             <button *ngIf="savedAddresses().length > 0 && !showNewAddressForm()" (click)="showNewAddressForm.set(true)" class="text-xs text-action hover:underline">
                                + Add a new address
                             </button>
                        </div>
                        
                        <!-- Saved Addresses List -->
                        <div *ngIf="savedAddresses().length > 0 && !showNewAddressForm()" class="space-y-3">
                            <div *ngFor="let addr of savedAddresses()" 
                                 (click)="selectAddress(addr.id)"
                                 class="border rounded-[4px] p-3 cursor-pointer hover:bg-gray-50 flex items-start gap-3"
                                 [ngClass]="selectedAddressId() === addr.id ? 'border-action bg-[#FCF5EE]' : 'border-gray-300'">
                                <input type="radio" name="address" [checked]="selectedAddressId() === addr.id" class="mt-1 accent-action">
                                <div class="text-sm">
                                    <div class="font-bold">{{ addr.fullName }}</div>
                                    <div>{{ addr.street }}</div>
                                    <div>{{ addr.city }}, {{ addr.state }} {{ addr.zip }}</div>
                                    <div class="text-gray-500 text-xs">Phone: {{ addr.phone }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- New Address Form -->
                        <div *ngIf="showNewAddressForm() || savedAddresses().length === 0">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                                <div class="md:col-span-2">
                                    <label class="block text-xs font-bold mb-1">Full Name</label>
                                    <input type="text" [(ngModel)]="newAddress.fullName" class="w-full border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-action outline-none shadow-inner">
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-xs font-bold mb-1">Street address</label>
                                    <input type="text" [(ngModel)]="newAddress.street" class="w-full border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-action outline-none shadow-inner" placeholder="123 Main St">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold mb-1">City</label>
                                    <input type="text" [(ngModel)]="newAddress.city" class="w-full border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-action outline-none shadow-inner">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold mb-1">Province/State</label>
                                    <input type="text" [(ngModel)]="newAddress.state" class="w-full border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-action outline-none shadow-inner">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold mb-1">Postal Code</label>
                                    <input type="text" [(ngModel)]="newAddress.zip" class="w-full border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-action outline-none shadow-inner">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold mb-1">Phone Number</label>
                                    <input type="text" [(ngModel)]="newAddress.phone" class="w-full border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-action outline-none shadow-inner">
                                </div>
                                <div class="md:col-span-2 flex items-center gap-2 mt-2">
                                    <input type="checkbox" [(ngModel)]="newAddress.isDefault" class="accent-action">
                                    <span class="text-sm">Make this my default address</span>
                                </div>
                                <div class="md:col-span-2 mt-2 flex gap-3">
                                    <button (click)="addNewAddress()" class="bg-[#F0C14B] border border-[#a88734] rounded-[3px] py-1 px-3 text-sm shadow-sm">Use this address</button>
                                    <button *ngIf="savedAddresses().length > 0" (click)="showNewAddressForm.set(false)" class="text-xs text-blue-600 hover:underline self-center">Cancel</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Step 2: Payment Method -->
            <div class="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                <div class="flex gap-4">
                    <span class="text-lg font-bold text-gray-700">2</span>
                    <div class="flex-grow">
                        <h3 class="text-lg font-bold mb-4">Payment method</h3>
                        
                        <div class="space-y-3 max-w-xl">
                            <!-- BNPL Option -->
                            <div 
                                (click)="selectPayment('BNPL')"
                                class="border rounded-[4px] p-3 cursor-pointer transition-all"
                                [ngClass]="selectedPaymentMethod() === 'BNPL' ? 'border-action bg-[#FCF5EE]' : 'border-gray-300 hover:bg-gray-50'"
                            >
                                <div class="flex items-start gap-3">
                                    <input type="radio" name="payment" [checked]="selectedPaymentMethod() === 'BNPL'" class="mt-1 accent-action">
                                    <div class="flex-grow">
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold text-sm">Chommie BNPL (0% Interest)</span>
                                            <span *ngIf="bnplEligible()" class="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-bold">ELIGIBLE</span>
                                        </div>
                                        <p class="text-xs text-gray-600">Split into 2 bi-weekly payments. No credit checks required.</p>
                                        <p *ngIf="!bnplEligible() && selectedPaymentMethod() === 'BNPL'" class="text-xs text-red-700 mt-1 font-bold">{{ bnplReason() }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Card Option -->
                            <div 
                                (click)="selectPayment('CARD')"
                                class="border rounded-[4px] p-3 cursor-pointer transition-all"
                                [ngClass]="selectedPaymentMethod() === 'CARD' ? 'border-action bg-[#FCF5EE]' : 'border-gray-300 hover:bg-gray-50'"
                            >
                                <div class="flex items-start gap-3">
                                    <input type="radio" name="payment" [checked]="selectedPaymentMethod() === 'CARD'" class="mt-1 accent-action">
                                    <div class="flex-grow text-sm">
                                        <span class="font-bold">Credit or Debit Card</span>
                                        <p class="text-xs text-gray-600">Secure payment via PayFast gateway.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 3: Review Items -->
            <div class="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                <div class="flex gap-4">
                    <span class="text-lg font-bold text-gray-700">3</span>
                    <div class="flex-grow">
                        <h3 class="text-lg font-bold mb-4">Review items and shipping</h3>
                        <div class="border rounded-[4px] overflow-hidden">
                            <div *ngFor="let item of cartService.cartItems()" class="p-4 flex gap-4 border-b last:border-0 bg-white">
                                <img [src]="item.images[0]" class="w-16 h-16 object-contain">
                                <div class="flex-grow text-sm">
                                    <div class="font-bold">{{ item.name }}</div>
                                    <div class="text-[#B12704] font-bold">R{{ item.price | number:'1.2-2' }}</div>
                                    <div class="text-gray-500">Quantity: {{ item.quantity }}</div>
                                    
                                    <!-- Selected Variants -->
                                    <div *ngIf="item.selectedVariants" class="text-[10px] text-gray-600 mt-1 flex gap-x-2">
                                        <div *ngFor="let v of item.selectedVariants | keyvalue">
                                            <span class="font-bold">{{ v.key }}:</span> {{ v.value }}
                                        </div>
                                    </div>
                                </div>
                                <div class="text-xs text-green-700 font-bold self-center">
                                    Arriving Tomorrow
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

          </div>

          <!-- Right: Summary Box (Sticky) -->
          <div class="lg:col-span-1">
              <div class="bg-white p-4 rounded-sm border border-gray-300 shadow-sm sticky top-24">
                  <button 
                    (click)="placeOrder()"
                    [disabled]="processing() || (selectedPaymentMethod() === 'BNPL' && !bnplEligible())"
                    class="w-full bg-action hover:bg-action-hover text-white py-2 rounded-[20px] shadow-sm text-sm font-medium transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ processing() ? 'Processing...' : 'Place your order' }}
                  </button>
                  <p class="text-[10px] text-gray-500 text-center mb-4">
                    By placing your order, you agree to Chommie's privacy notice and conditions of use.
                  </p>

                  <hr class="mb-4">

                  <!-- Coupon Section -->
                  <div class="mb-4">
                      <div class="flex gap-2">
                          <input type="text" [(ngModel)]="couponCode" placeholder="Enter code" class="flex-grow border border-gray-400 rounded-[3px] px-2 py-1 text-sm focus:border-action outline-none">
                          <button (click)="applyCoupon()" class="bg-white border border-gray-400 hover:bg-gray-50 px-3 py-1 rounded-[3px] text-xs font-medium shadow-sm">Apply</button>
                      </div>
                      <div *ngIf="appliedCoupon()" class="text-[10px] text-green-700 font-bold mt-1">
                          Coupon "{{ appliedCoupon().code }}" applied!
                      </div>
                  </div>

                  <h3 class="font-bold text-sm mb-2">Order Summary</h3>
                  <div class="space-y-1 text-xs text-gray-600 mb-2">
                      <div class="flex justify-between">
                          <span>Items:</span>
                          <span>R{{ cartService.totalAmount() | number:'1.2-2' }}</span>
                      </div>
                      <div class="flex justify-between">
                          <span>Shipping & handling:</span>
                          <span>R0.00</span>
                      </div>
                      <div *ngIf="discountAmount() > 0" class="flex justify-between text-[#B12704]">
                          <span>Coupon Discount:</span>
                          <span>-R{{ discountAmount() | number:'1.2-2' }}</span>
                      </div>
                  </div>
                  <hr class="mb-2">
                  <div class="flex justify-between text-lg font-bold text-[#B12704]">
                      <span>Order total:</span>
                      <span>R{{ (cartService.totalAmount() - discountAmount()) | number:'1.2-2' }}</span>
                  </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  savedAddresses = signal<any[]>([]);
  selectedAddressId = signal<string | null>(null);
  showNewAddressForm = signal(false);

  newAddress = {
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    isDefault: false
  };
  
  selectedPaymentMethod = signal<'BNPL' | 'CARD'>('BNPL');
  bnplEligible = signal(false);
  bnplReason = signal('');
  processing = signal(false);
  couponCode = signal('');
  appliedCoupon = signal<any | null>(null);
  discountAmount = signal(0);
  userId = '';

  constructor(
    public cartService: CartService,
    private bnplService: BnplService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
    this.userId = localStorage.getItem('user_id') || '';
  }

  ngOnInit() {
    if (this.cartService.cartItems().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    this.loadUserAddresses();
    this.checkBnplEligibility();
  }

  loadUserAddresses() {
    this.authService.getProfile(this.userId).subscribe({
      next: (user) => {
        if (user.addresses && user.addresses.length > 0) {
            this.savedAddresses.set(user.addresses);
            // Select default or first
            const defaultAddr = user.addresses.find((a: any) => a.isDefault);
            this.selectedAddressId.set(defaultAddr ? defaultAddr.id : user.addresses[0].id);
        } else {
            this.showNewAddressForm.set(true);
        }
      },
      error: (err) => {
          console.error('Failed to load profile', err);
          this.showNewAddressForm.set(true);
      }
    });
  }

  selectAddress(id: string) {
    this.selectedAddressId.set(id);
    this.showNewAddressForm.set(false);
  }

  addNewAddress() {
    if (!this.newAddress.fullName || !this.newAddress.street || !this.newAddress.city || !this.newAddress.zip) {
        alert('Please fill in all required fields');
        return;
    }

    this.authService.addAddress(this.userId, this.newAddress).subscribe({
        next: (user) => {
            this.savedAddresses.set(user.addresses);
            // Find the new one (last added usually, or match props)
            // Just select the last one
            const newAddr = user.addresses[user.addresses.length - 1];
            this.selectedAddressId.set(newAddr.id);
            this.showNewAddressForm.set(false);
            // Reset form
            this.newAddress = { fullName: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false };
        },
        error: (err) => alert('Failed to save address')
    });
  }

  selectPayment(method: 'BNPL' | 'CARD') {
    this.selectedPaymentMethod.set(method);
  }

  applyCoupon() {
    if (!this.couponCode()) return;
    
    this.orderService.validateCoupon(this.couponCode(), this.cartService.totalAmount()).subscribe({
      next: (res) => {
        if (res.status === 'error') {
          alert(res.message);
          this.appliedCoupon.set(null);
          this.discountAmount.set(0);
          return;
        }
        this.appliedCoupon.set(res);
        if (res.type === 'PERCENTAGE') {
          this.discountAmount.set((this.cartService.totalAmount() * Number(res.value)) / 100);
        } else {
          this.discountAmount.set(Number(res.value));
        }
      },
      error: (err) => alert('Invalid coupon code')
    });
  }

  checkBnplEligibility() {
    const total = this.cartService.totalAmount();
    if (total <= 0) return;

    this.bnplService.checkEligibility(this.userId, total).subscribe({
      next: (result) => {
        this.bnplEligible.set(result.eligible);
        this.bnplReason.set(result.reason || '');
        
        // Auto-switch to CARD if BNPL is not eligible
        if (!result.eligible) {
          // this.selectedPaymentMethod.set('CARD'); // Optional: enforce switch? No, let user see why.
        }
      },
      error: () => {
        this.bnplEligible.set(false);
        this.bnplReason.set('Unable to verify eligibility at this time.');
      }
    });
  }

  placeOrder() {
    this.processing.set(true);

    let fullAddress = '';
    
    if (this.showNewAddressForm()) {
        // Use new address form data directly if they didn't save it? 
        // Better to force save, but for UX let's use it if valid.
        // Actually, let's assume they selected one.
        // If they are in "New Address" mode, we should valid and use that.
         if (!this.newAddress.street) {
             alert('Please select or enter a shipping address');
             this.processing.set(false);
             return;
         }
         fullAddress = `${this.newAddress.fullName}, ${this.newAddress.street}, ${this.newAddress.city}, ${this.newAddress.zip}`;
    } else {
        const addr = this.savedAddresses().find(a => a.id === this.selectedAddressId());
        if (!addr) {
             alert('Please select a shipping address');
             this.processing.set(false);
             return;
        }
        fullAddress = `${addr.fullName}, ${addr.street}, ${addr.city}, ${addr.zip}`;
    }
    
    const orderItems = this.cartService.cartItems().map(item => ({
      productId: item.id!,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
      vendorId: item.vendorId,
      selectedVariants: item.selectedVariants
    }));

    const orderData = {
      userId: this.userId,
      email: localStorage.getItem('user_email') || 'user@example.com',
      paymentMethod: this.selectedPaymentMethod(),
      items: orderItems,
      shippingAddress: fullAddress,
      couponCode: this.appliedCoupon()?.code
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        console.log('Order created:', order);
        this.cartService.clearCart();
        this.bnplService.triggerRefresh(); // Refresh trust score widget
        this.processing.set(false);
        // Navigate to success page or order history
        this.router.navigate(['/orders']); 
      },
      error: (err) => {
        console.error('Order creation failed:', err);
        this.processing.set(false);
        alert('Failed to place order. Please try again.');
      }
    });
  }
}
