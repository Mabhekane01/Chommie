import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../services/vendor.service';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-vendor-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE SETTINGS UI -->
        <div class="p-4 space-y-6 animate-fade-in">
           <h1 class="text-xl font-bold pt-2 px-1">Settings</h1>

           <div class="space-y-4">
              <!-- Store Profile Mobile -->
              <div class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <h2 class="text-xs font-bold uppercase tracking-widest text-neutral-400">Store Profile</h2>
                 <div class="space-y-3">
                    <div class="space-y-1">
                       <label class="text-[10px] font-bold text-neutral-500 uppercase">Display Name</label>
                       <input type="text" [(ngModel)]="settings.storeName" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                    </div>
                    <div class="space-y-1">
                       <label class="text-[10px] font-bold text-neutral-500 uppercase">Contact Email</label>
                       <input type="email" [(ngModel)]="settings.email" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-4 py-3 text-sm font-bold focus:border-primary outline-none">
                    </div>
                 </div>
              </div>

              <!-- Payout Settings Mobile -->
              <div class="bg-white p-5 rounded-lg border border-neutral-300 shadow-sm space-y-4">
                 <h2 class="text-xs font-bold uppercase tracking-widest text-neutral-400">Payout Settings</h2>
                 <div class="p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                    <div class="text-[10px] font-bold text-neutral-400 uppercase mb-1">Current Method</div>
                    <div class="text-sm font-bold text-neutral-800">EFT (South Africa)</div>
                    <div class="text-[10px] text-emerald-600 font-bold mt-1 uppercase">Verified Node</div>
                 </div>
                 <button class="w-full bg-neutral-100 text-neutral-600 py-3 rounded-md text-[11px] font-bold uppercase tracking-widest">Update Method</button>
              </div>
           </div>

           <button (click)="saveSettings()" [disabled]="submitting()" class="w-full bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-[0.2em] shadow-md active:scale-[0.98] transition-all">
              {{ submitting() ? 'Syncing...' : 'Save Settings' }}
           </button>
        </div>
      } @else {
        <!-- DESKTOP SETTINGS UI -->
        <div class="p-8 max-w-[1000px] mx-auto space-y-8 animate-fade-in">
          <div class="border-b border-neutral-200 pb-6">
             <h1 class="text-3xl font-header font-bold text-neutral-charcoal tracking-tight">Account Settings</h1>
             <p class="text-sm text-neutral-500 mt-1 font-medium uppercase tracking-widest">Storefront & Payout Protocol</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- Left: Nav -->
              <aside class="space-y-1">
                  <button class="w-full text-left px-4 py-2 rounded-md bg-white border border-neutral-300 font-bold text-primary text-sm shadow-sm">Store Profile</button>
                  <button class="w-full text-left px-4 py-2 rounded-md text-neutral-500 hover:bg-white hover:text-primary transition-all text-sm font-medium">Payout Information</button>
                  <button class="w-full text-left px-4 py-2 rounded-md text-neutral-500 hover:bg-white hover:text-primary transition-all text-sm font-medium">Notification Preferences</button>
                  <button class="w-full text-left px-4 py-2 rounded-md text-neutral-500 hover:bg-white hover:text-primary transition-all text-sm font-medium">User Permissions</button>
              </aside>

              <!-- Main Content -->
              <div class="md:col-span-2 space-y-8">
                  <div class="bg-white border border-neutral-300 rounded-lg p-10 shadow-sm">
                      <h2 class="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-10 pb-4 border-b border-neutral-50">Store Identity</h2>
                      
                      <div class="space-y-8">
                          <div class="grid grid-cols-12 gap-10 items-center">
                              <label class="col-span-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Display Name</label>
                              <div class="col-span-8">
                                 <input type="text" [(ngModel)]="settings.storeName" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3 font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner">
                              </div>
                          </div>

                          <div class="grid grid-cols-12 gap-10 items-center">
                              <label class="col-span-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Legal Entity Email</label>
                              <div class="col-span-8">
                                 <input type="email" [(ngModel)]="settings.email" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3 font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner">
                              </div>
                          </div>

                          <div class="grid grid-cols-12 gap-10 items-start">
                              <label class="col-span-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right pt-4">Store Description</label>
                              <div class="col-span-8">
                                 <textarea rows="4" [(ngModel)]="settings.description" class="w-full bg-neutral-50 border border-neutral-300 rounded-md px-6 py-3 font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner"></textarea>
                              </div>
                          </div>
                      </div>

                      <div class="flex justify-end pt-10 mt-10 border-t border-neutral-100">
                          <button (click)="saveSettings()" [disabled]="submitting()" class="btn-primary px-12 py-3 rounded-md font-bold uppercase tracking-widest shadow-md transition-all active:scale-95 disabled:opacity-50">
                              {{ submitting() ? 'Saving Changes...' : 'Update Protocol' }}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class VendorSettingsComponent implements OnInit {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private vendorService = inject(VendorService);

  settings = {
    storeName: 'Nexus Solutions Store',
    email: 'vendor@example.com',
    description: 'Premier supplier of high-performance marketplace assets.',
    logo: ''
  };
  
  submitting = signal(false);
  vendorId = localStorage.getItem('vendor_id') || 'vendor-1';

  ngOnInit() {
    this.vendorService.getStoreSettings(this.vendorId).subscribe({
        next: (data) => {
            if (data) this.settings = { ...this.settings, ...data };
        }
    });
  }

  saveSettings() {
    this.submitting.set(true);
    this.vendorService.updateStoreSettings(this.vendorId, this.settings).subscribe({
        next: () => {
            this.submitting.set(false);
            alert('Settings synchronized successfully.');
        },
        error: () => {
            this.submitting.set(false);
            alert('Failed to update settings.');
        }
    });
  }
}
