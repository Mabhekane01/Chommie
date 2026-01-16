import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  async createPayFastPayment(data: { orderId: string; userId: string; amount: number; email: string; items: string }) {
    const transaction = this.transactionRepository.create({
      orderId: data.orderId,
      userId: data.userId,
      amount: data.amount,
      paymentMethod: 'PAYFAST',
      status: TransactionStatus.PENDING,
    });

    await this.transactionRepository.save(transaction);

    const payfastData: any = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: process.env.PAYFAST_RETURN_URL,
      cancel_url: process.env.PAYFAST_CANCEL_URL,
      notify_url: process.env.PAYFAST_NOTIFY_URL,
      name_first: 'Customer',
      email_address: data.email,
      m_payment_id: data.orderId,
      amount: data.amount.toFixed(2),
      item_name: data.items,
    };

    payfastData.signature = this.generatePayFastSignature(payfastData);
    
    return {
      url: process.env.PAYFAST_SANDBOX === 'true' ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process',
      form: payfastData
    };
  }

  async handlePayFastNotify(data: any) {
    this.logger.log(`Received PayFast ITN for order: ${data.m_payment_id}`);
    
    // Verify signature
    const signature = this.generatePayFastSignature(data, false);
    if (signature !== data.signature) {
      this.logger.error('Invalid PayFast signature');
      return { status: 'error', message: 'Invalid signature' };
    }

    if (data.payment_status === 'COMPLETE') {
      const transaction = await this.transactionRepository.findOne({ where: { orderId: data.m_payment_id } });
      if (transaction) {
        transaction.status = TransactionStatus.COMPLETED;
        transaction.externalReference = data.pf_payment_id;
        await this.transactionRepository.save(transaction);

        this.orderClient.emit('payment_completed', {
          orderId: transaction.orderId,
          userId: transaction.userId,
          status: 'PAID',
          transactionId: transaction.id
        });
      }
    }

    return { status: 'ok' };
  }

  private generatePayFastSignature(data: any, includePassphrase = true): string {
    let pfOutput = '';
    const keys = Object.keys(data).sort();
    
    keys.forEach(key => {
      if (key !== 'signature' && data[key] !== undefined && data[key] !== '') {
        pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
      }
    });

    pfOutput = pfOutput.slice(0, -1);

    if (includePassphrase && process.env.PAYFAST_PASSPHRASE) {
      pfOutput += `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE.trim()).replace(/%20/g, '+')}`;
    }

    return crypto.createHash('md5').update(pfOutput).digest('hex');
  }

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