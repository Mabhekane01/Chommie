import { Test, TestingModule } from '@nestjs/testing';
import { TrustScoreService } from './trust-score.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TrustProfile, TrustTier } from './entities/trust-profile.entity';

describe('TrustScoreService', () => {
  let service: TrustScoreService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((profile) => Promise.resolve(profile)),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrustScoreService,
        {
          provide: getRepositoryToken(TrustProfile),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TrustScoreService>(TrustScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate score correctly', async () => {
    const userId = 'user-1';
    const profile = new TrustProfile();
    profile.userId = userId;
    profile.totalPayments = 10;
    profile.onTimePayments = 10; // 100% -> 400 pts
    profile.totalOrders = 5; // 5 * 20 = 100 pts
    // 10 months old
    profile.createdAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 10); 
    // Age score: min(10 * 5, 150) = 50 pts
    
    profile.averagePaymentDelayDays = 0; 
    // Speed score: max(0, (1 - 0/30)*150) = 150 pts
    
    profile.disputeCount = 0; 
    // Dispute score: max(0, (1 - 0/5)*100) = 100 pts
    
    // Total expected: 400 + 100 + 50 + 150 + 100 = 800

    mockRepo.findOne.mockResolvedValue(profile);

    const result = await service.calculateScore(userId);

    // Allow some tolerance for date calculation if needed, but 800 should be exact here
    expect(result.currentScore).toBe(800);
    expect(result.tier).toBe(TrustTier.PLATINUM);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
