import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BnplService, TrustProfile, TrustTier } from '../../services/bnpl.service';

@Component({
  selector: 'app-trust-score-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden shadow-2xl animate-fade-in" *ngIf="profile">
      <!-- Background Energy Glow -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col items-center">
        <!-- Header Matrix -->
        <div class="w-full flex justify-between items-center mb-10">
           <h3 class="font-header font-black text-white text-lg uppercase tracking-tighter">Credit <span class="text-cyber-teal">Profile</span></h3>
           <div class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10" [style.color]="getTierColor(profile.tier)" [style.borderColor]="getTierColor(profile.tier) + '40'">
              {{ profile.tier }} NODE
           </div>
        </div>

        <!-- Central Aura Score -->
        <div class="relative mb-10 group">
           <!-- Glow Ring -->
           <div class="absolute inset-[-15px] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" [style.background]="getTierColor(profile.tier)"></div>
           
           <!-- Progress Ring -->
           <div class="w-48 h-48 rounded-full flex items-center justify-center relative bg-deep-ocean border-4 border-white/5 shadow-inner" 
                [style.background]="'conic-gradient(' + getTierColor(profile.tier) + ' ' + (getScorePercentage() * 3.6) + 'deg, rgba(255,255,255,0.05) 0deg)'">
              
              <!-- Inner Glass Core -->
              <div class="w-[calc(100%-12px)] h-[calc(100%-12px)] rounded-full bg-deep-ocean/90 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl border border-white/10">
                 <span class="text-[10px] font-black text-neutral-silver/40 uppercase tracking-widest mb-1">Score Matrix</span>
                 <span class="text-5xl font-header font-black text-white tracking-tighter">{{ profile.currentScore }}</span>
                 <span class="text-[10px] font-bold text-white/20 mt-1 uppercase">MAX 1000</span>
              </div>
           </div>
        </div>

        <!-- Credit Limit Module -->
        <div class="w-full bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 text-center relative group overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
           <span class="block text-[9px] font-black text-neutral-silver/40 uppercase tracking-[0.3em] mb-2">Available Expenditure</span>
           <span class="text-3xl font-header font-black text-white tracking-tight">R{{ profile.creditLimit | number:'1.0-0' }}</span>
        </div>

        <!-- Binary Stats Grid -->
        <div class="w-full grid grid-cols-2 gap-4 mb-10">
           <div class="glass-panel rounded-2xl p-4 border-white/5 bg-white/5 flex flex-col items-center">
              <span class="text-[8px] font-black text-neutral-silver/30 uppercase tracking-widest mb-1">Successful Comms</span>
              <span class="text-sm font-bold text-cyber-teal uppercase tracking-tighter">{{ profile.onTimePayments }} / {{ profile.totalPayments }}</span>
           </div>
           <div class="glass-panel rounded-2xl p-4 border-white/5 bg-white/5 flex flex-col items-center">
              <span class="text-[8px] font-black text-neutral-silver/30 uppercase tracking-widest mb-1">System Conflicts</span>
              <span class="text-sm font-bold text-accent uppercase tracking-tighter">{{ profile.disputeCount }} ACTIVE</span>
           </div>
        </div>

        <!-- Interaction Terminal -->
        <button (click)="recalculate()" [disabled]="loading" class="w-full btn-primary py-4 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase shadow-[0_15px_30px_rgba(107,45,158,0.3)] group relative overflow-hidden">
           <span class="relative z-10">{{ loading ? 'CALIBRATING...' : 'SYNC SCORE MATRIX' }}</span>
           <div class="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
        
        <p class="mt-6 text-[8px] font-black text-neutral-silver/20 uppercase tracking-[0.2em]">Matrix Last Scanned: {{ profile.lastCalculatedAt | date:'HH:mm:ss dd.MM.yy' }}</p>
      </div>
    </div>

    <!-- Initialization State -->
    <div class="glass-panel rounded-[2.5rem] p-12 border-white/5 flex flex-col items-center justify-center gap-8" *ngIf="!profile && loading">
       <div class="w-24 h-24 border-4 border-white/5 border-t-cyber-teal rounded-full animate-spin shadow-[0_0_20px_rgba(0,217,255,0.2)]"></div>
       <div class="space-y-2 text-center">
          <span class="block text-xs font-black text-white uppercase tracking-widest animate-pulse">Initializing Identity</span>
          <span class="block text-[9px] font-black text-neutral-silver/20 uppercase tracking-[0.2em]">Querying Distributed Ledger</span>
       </div>
    </div>
  `
})
export class TrustScoreWidgetComponent implements OnInit, OnDestroy {
  @Input() userId: string = ''; 
  profile: TrustProfile | null = null;
  loading: boolean = false;
  private refreshSub: Subscription | null = null;

  constructor(private bnplService: BnplService) {}

  ngOnInit() {
    this.loadProfile();
    this.refreshSub = this.bnplService.refreshProfile$.subscribe(() => {
      this.loadProfile();
    });
  }

  ngOnDestroy() {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }

  loadProfile() {
    this.loading = true;
    this.bnplService.getProfile(this.userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loading = false;
        if (!profile) {
          this.createProfile();
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createProfile() {
    this.bnplService.createProfile(this.userId).subscribe(p => this.profile = p);
  }

  recalculate() {
    this.loading = true;
    this.bnplService.calculateScore(this.userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getTierColor(tier: TrustTier | undefined): string {
    switch (tier) {
      case TrustTier.PLATINUM: return '#00D9FF'; // Cyber Teal
      case TrustTier.GOLD: return '#CCFF00'; // Cyber Lime
      case TrustTier.SILVER: return '#E91E8C'; // Neon Magenta
      case TrustTier.BRONZE: return '#6B2D9E'; // Electric Purple
      default: return '#FFFFFF';
    }
  }

  getScorePercentage(): number {
    return this.profile ? (this.profile.currentScore / 1000) * 100 : 0;
  }
}