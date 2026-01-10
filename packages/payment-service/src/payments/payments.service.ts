import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Transaction, TransactionStatus } from './entities/transaction.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  async processPayment(data: { orderId: string; userId: string; amount: number; paymentMethod: string }): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      ...data,
      status: TransactionStatus.PENDING,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    this.logger.log(`Processing payment for Order ${data.orderId} via ${data.paymentMethod}...`);
    
    // Simulate external payment gateway delay
    return new Promise((resolve) => {
      setTimeout(async () => {
        savedTransaction.status = TransactionStatus.COMPLETED;
        savedTransaction.externalReference = 'MOCK_REF_' + Math.random().toString(36).substring(7).toUpperCase();
        const finalTransaction = await this.transactionRepository.save(savedTransaction);
        
        this.logger.log(`Payment successful for Order ${data.orderId}`);
        
        // Notify Order Service and BNPL Service
        this.orderClient.emit('payment_completed', {
            orderId: data.orderId,
            userId: data.userId, // Added userId
            status: 'PAID',
            transactionId: finalTransaction.id
        });

        resolve(finalTransaction);
      }, 1000);
    });
  }

  async getTransactionByOrder(orderId: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({ where: { orderId } });
  }
}