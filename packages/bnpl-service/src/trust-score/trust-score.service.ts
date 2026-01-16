import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrustProfile, TrustTier } from './entities/trust-profile.entity';

@Injectable()
export class TrustScoreService {
  constructor(
    @InjectRepository(TrustProfile)
    private trustProfileRepository: Repository<TrustProfile>,
  ) {}

  async createProfile(userId: string): Promise<TrustProfile> {
    const profile = this.trustProfileRepository.create({ 
      userId,
      creditLimit: 500 // Initial limit
    });
    return this.trustProfileRepository.save(profile);
  }

  async getProfile(userId: string): Promise<TrustProfile | null> {
    return this.trustProfileRepository.findOne({ where: { userId } });
  }

  async calculateScore(userId: string): Promise<TrustProfile> {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error('Profile not found');

    const paymentHistory = profile.totalPayments > 0 
      ? (profile.onTimePayments / profile.totalPayments) 
      : 0;

    const paymentScore = paymentHistory * 400;
    
    const purchaseFrequency = profile.totalOrders; 
    const frequencyScore = Math.min(purchaseFrequency * 20, 200);
    
    const accountAgeMonths = (Date.now() - profile.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const ageScore = Math.min(accountAgeMonths * 5, 150);
    
    const speedScore = Math.max(0, (1 - profile.averagePaymentDelayDays / 30) * 150);
    
    const disputeRatio = profile.totalOrders > 0 
      ? profile.disputeCount / profile.totalOrders 
      : 0;
    const disputeScore = Math.max(0, (1 - disputeRatio) * 100);
    
    let totalScore = paymentScore + frequencyScore + ageScore + speedScore + disputeScore;
    totalScore = Math.max(0, Math.min(1000, totalScore));
    
    profile.currentScore = Math.round(totalScore);
    profile.tier = this.calculateTier(profile.currentScore);
    profile.creditLimit = this.calculateCreditLimit(profile.tier);
    profile.lastCalculatedAt = new Date();
    
    return this.trustProfileRepository.save(profile);
  }

  async checkEligibility(userId: string, amount: number): Promise<{ eligible: boolean; reason?: string; limit: number }> {
    const profile = await this.getProfile(userId);
    if (!profile) return { eligible: false, reason: 'No trust profile found', limit: 0 };

    if (amount > profile.creditLimit) {
      return { 
        eligible: false, 
        reason: `Amount exceeds credit limit of R${profile.creditLimit}`, 
        limit: profile.creditLimit 
      };
    }

    return { eligible: true, limit: profile.creditLimit };
  }

  async handlePaymentSuccess(userId: string) {
    const profile = await this.getProfile(userId);
    if (!profile) return;

    profile.totalPayments += 1;
    profile.onTimePayments += 1; 
    
    // Reward Logic: 10 coins per successful payment
    profile.coinsBalance = Number(profile.coinsBalance || 0) + 10;
    
    await this.trustProfileRepository.save(profile);
    
    await this.calculateScore(userId);
  }

  async useCoins(userId: string, amount: number): Promise<boolean> {
    const profile = await this.getProfile(userId);
    if (!profile || Number(profile.coinsBalance) < Number(amount)) return false;

    profile.coinsBalance = Number(profile.coinsBalance) - Number(amount);
    await this.trustProfileRepository.save(profile);
    return true;
  }

  async awardCoins(userId: string, amount: number): Promise<void> {
    const profile = await this.getProfile(userId);
    if (profile) {
      profile.coinsBalance = Number(profile.coinsBalance || 0) + Number(amount);
      await this.trustProfileRepository.save(profile);
    }
  }

  private calculateTier(score: number): TrustTier {
    if (score >= 800) return TrustTier.PLATINUM;
    if (score >= 600) return TrustTier.GOLD;
    if (score >= 300) return TrustTier.SILVER;
    return TrustTier.BRONZE;
  }

  private calculateCreditLimit(tier: TrustTier): number {
    switch (tier) {
      case TrustTier.PLATINUM: return 2000;
      case TrustTier.GOLD: return 1500;
      case TrustTier.SILVER: return 1000;
      case TrustTier.BRONZE: default: return 500;
    }
  }
}
