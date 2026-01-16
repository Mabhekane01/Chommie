import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BnplService, TrustProfile } from '../../services/bnpl.service';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-loyalty-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#131921] text-white pb-32 pt-10">
      <div class="max-w-[1200px] mx-auto px-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
           <div class="space-y-2">
              <h1 class="text-4xl font-bold tracking-tight">
                 Rewards <span class="text-primary underline decoration-4 underline-offset-8">Center</span>
              </h1>
              <p class="text-neutral-400 font-medium">Earn points and unlock exclusive shopping benefits.</p>
           </div>
           
           <div class="bg-white/5 border border-white/10 rounded-sm p-8 flex items-center gap-8 shadow-2xl">
              <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-xl">
                 <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                 <div class="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Your Total Points</div>
                 <div class="text-4xl font-black text-primary tracking-tighter">{{ coinsBalance() | number }} <span class="text-sm font-bold text-white/40">Points</span></div>
              </div>
           </div>
        </div>

        <!-- Main Interaction Area -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           <!-- Points Collector -->
           <div class="lg:col-span-8 bg-white/5 rounded-sm p-12 border border-white/10 shadow-inner relative overflow-hidden group">
              <div class="relative z-10 space-y-10">
                 <div class="flex justify-between items-center border-b border-white/5 pb-4">
                    <h2 class="text-xl font-bold uppercase tracking-widest">Daily Points Collector</h2>
                    <span class="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-sm border border-emerald-400/20 uppercase">System Ready</span>
                 </div>

                 <!-- Collection Visualization -->
                 <div class="h-64 flex items-center justify-center relative">
                    <div class="w-48 h-48 rounded-sm border-4 border-dashed border-primary/30 flex items-center justify-center">
                       <div class="w-32 h-32 rounded-sm border-4 border-primary shadow-[0_0_50px_rgba(255,109,31,0.2)] flex items-center justify-center bg-[#131921]">
                          <span class="text-4xl font-black text-primary">{{ miningProgress() }}%</span>
                       </div>
                    </div>
                 </div>

                 <div class="flex flex-col items-center gap-6">
                    <button (click)="startMining()" 
                            [disabled]="isMining()"
                            class="w-full max-w-sm bg-primary hover:bg-[#E67A00] text-white py-5 rounded-sm font-black uppercase text-sm tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50">
                       {{ isMining() ? 'Collecting Points...' : 'Collect Daily Points' }}
                    </button>
                    <p class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Estimated reward: 50 - 200 points</p>
                 </div>
              </div>
           </div>

           <!-- Bonus Cards -->
           <div class="lg:col-span-4 space-y-6">
              <div class="bg-white/5 border border-white/10 rounded-sm p-8 space-y-6">
                 <h3 class="text-sm font-black uppercase tracking-widest text-primary border-b border-white/5 pb-2">Active Multipliers</h3>
                 
                 <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/5">
                       <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-sm bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">2X</div>
                          <span class="text-xs font-bold uppercase">Chommie Plus</span>
                       </div>
                       <span class="text-[10px] font-bold text-neutral-500 uppercase">Inactive</span>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/5">
                       <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-sm bg-amber-500/20 flex items-center justify-center text-amber-400 font-black">1.5X</div>
                          <span class="text-xs font-bold uppercase">Gold Tier</span>
                       </div>
                       <span class="text-[10px] font-bold text-emerald-400 uppercase">Active</span>
                    </div>
                 </div>

                 <button routerLink="/plus" class="w-full py-3 bg-white border border-white rounded-sm text-[#131921] text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all">Max out Bonuses</button>
              </div>

              <!-- Points History -->
              <div class="bg-white/5 border border-white/10 rounded-sm p-8 space-y-6">
                 <h3 class="text-sm font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Recent Points</h3>
                 <div class="space-y-4">
                    <div *ngFor="let entry of logs" class="flex justify-between items-center text-[10px] font-bold">
                       <span class="text-neutral-400">{{ entry.date | date:'shortTime' }}</span>
                       <span class="uppercase">{{ entry.activity }}</span>
                       <span class="text-primary font-black">+{{ entry.amount }}</span>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoyaltyDashboardComponent implements OnInit, OnDestroy {
  private bnplService = inject(BnplService);
  private deviceService = inject(DeviceService);

  coinsBalance = signal(0);
  miningProgress = signal(0);
  isMining = signal(false);
  logs: any[] = [
    { date: new Date(), activity: 'Points Added', amount: 42 },
    { date: new Date(Date.now() - 3600000), activity: 'Shopping Reward', amount: 150 }
  ];

  private interval: any;

  ngOnInit() {
    const userId = localStorage.getItem('user_id');
    if (userId) {
        this.bnplService.getProfile(userId).subscribe(profile => {
            this.coinsBalance.set(profile.coinsBalance);
        });
    }
  }

  ngOnDestroy() {
      if (this.interval) clearInterval(this.interval);
  }

  startMining() {
    this.isMining.set(true);
    this.miningProgress.set(0);

    this.interval = setInterval(() => {
        this.miningProgress.update(p => {
            if (p >= 100) {
                clearInterval(this.interval);
                this.finalizeMining();
                return 100;
            }
            return p + 2;
        });
    }, 50);
  }

  finalizeMining() {
    const yieldAmount = Math.floor(Math.random() * 150) + 50;
    this.coinsBalance.update(b => b + yieldAmount);
    this.logs.unshift({ date: new Date(), activity: 'Daily Collection', amount: yieldAmount });
    this.isMining.set(false);
    alert(`Success! You have collected ${yieldAmount} points.`);
  }
}