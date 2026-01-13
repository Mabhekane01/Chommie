import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BnplService, TrustProfile, TrustTier } from '../../services/bnpl.service';

@Component({
  selector: 'app-trust-score-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trust-score-widget.html',
  styleUrl: './trust-score-widget.css'
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
        // Handle error - maybe user profile doesn't exist yet
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
      case TrustTier.PLATINUM: return '#1B4332'; // Dark Green
      case TrustTier.GOLD: return '#2D6A4F'; // Green
      case TrustTier.SILVER: return '#40916C'; // Light Green
      case TrustTier.BRONZE: return '#8B7355'; // Light Brown
      default: return '#F8F9FA';
    }
  }

  getScorePercentage(): number {
    return this.profile ? (this.profile.currentScore / 1000) * 100 : 0;
  }
}
