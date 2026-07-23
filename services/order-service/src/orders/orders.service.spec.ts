import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus, PaymentMethod } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { of } from 'rxjs';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository;
  let orderItemRepository;
  let paymentClient;
  let bnplClient;
  let productClient;
  let notificationClient;

  const mockOrderRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((order) => Promise.resolve({ id: 'order-123', ...order })),
    findOne: jest.fn().mockImplementation((id) => Promise.resolve({ id })),
    update: jest.fn(),
  };

  const mockOrderItemRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockResolvedValue([]),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockClientProxy = {
    send: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: 'NOTIFICATION_SERVICE',
          useValue: mockClientProxy,
        },
        {
          provide: 'PRODUCT_SERVICE',
          useValue: mockClientProxy,
        },
        {
          provide: 'BNPL_SERVICE',
          useValue: mockClientProxy,
        },
        {
          provide: 'PAYMENT_SERVICE', // Added this
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
    paymentClient = module.get('PAYMENT_SERVICE');
    bnplClient = module.get('BNPL_SERVICE');
    productClient = module.get('PRODUCT_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createOrderDto = {
        userId: 'user-1',
        paymentMethod: 'CARD',
        items: [
            { productId: 'p1', productName: 'Product 1', quantity: 1, price: 100 }
        ],
        shippingAddress: '123 St',
        email: 'test@test.com'
    };

    it('should create a PAID order for successful CARD payment', async () => {
        // Mock Product Service (Stock Check)
        productClient.send.mockReturnValueOnce(of(true)); // Check stock
        productClient.send.mockReturnValueOnce(of(true)); // Decrement stock

        // Mock Payment Service
        paymentClient.send.mockReturnValue(of({ status: 'COMPLETED', id: 'trans-1' }));

        // Mock notification
        mockClientProxy.emit.mockReturnValue(of(true));

        const result = await service.create(createOrderDto as any);

        expect(paymentClient.send).toHaveBeenCalledWith(
            { cmd: 'process_payment' },
            expect.objectContaining({ paymentMethod: 'CARD', amount: 100 })
        );
        expect(orderRepository.save).toHaveBeenCalledWith(expect.objectContaining({
            status: OrderStatus.PAID
        }));
    });

    it('should create a PROCESSING order for BNPL payment', async () => {
        const bnplOrderDto = { ...createOrderDto, paymentMethod: 'BNPL' };
        
        // Mock Product Service
        productClient.send.mockReturnValueOnce(of(true)); 
        productClient.send.mockReturnValueOnce(of(true));

        // Mock BNPL Service
        bnplClient.send.mockReturnValue(of({ id: 'plan-1', status: 'ACTIVE' }));

        const result = await service.create(bnplOrderDto as any);

        expect(bnplClient.send).toHaveBeenCalledWith(
            { cmd: 'create_plan' },
            expect.objectContaining({ totalAmount: 100 })
        );
        
        // Since create_plan returns, status should be updated to PROCESSING
        expect(orderRepository.save).toHaveBeenCalledWith(expect.objectContaining({
            status: OrderStatus.PROCESSING
        }));
    });
  });
});
