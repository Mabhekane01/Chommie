export class CreateOrderDto {
  userId: string;
  email: string; // Needed for notifications
  paymentMethod: 'CARD' | 'EFT' | 'BNPL' | 'ZAPPER' | 'SNAPSCAN';
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: string;
}