export interface IProduct {
  id?: string;
  _id?: any;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  lowStockThreshold?: number;
  images: string[];
  ratings: number;
  numReviews: number;
  bnplEligible: boolean;
  trustScoreDiscount: number;
  discountPrice?: number;
  dealEndsAt?: Date;
  vendorId: string;
  isLightningDeal?: boolean;
  lightningDealStock?: number;
  lightningDealSold?: number;
  variants?: IProductVariant[];
  badges?: string[]; // e.g., ["AMAZON_CHOICE", "BEST_SELLER"]
  specifications?: Record<string, string>; // e.g., {"Brand": "Sony", "Color": "Black"}
  bulkPricing?: IBulkPricing[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBulkPricing {
  minQuantity: number;
  discountPercentage: number;
}

export interface IProductVariant {
  name: string; // e.g., "Color", "Size"
  options: IVariantOption[];
}

export interface IVariantOption {
  value: string; // e.g., "Red", "XL"
  priceModifier?: number; // e.g., +R50
  stock?: number;
  image?: string;
}

export class CreateProductDto {
  name!: string;
  description!: string;
  price!: number;
  category!: string;
  stock!: number;
  lowStockThreshold?: number;
  images?: string[];
  bnplEligible?: boolean;
  discountPrice?: number;
  dealEndsAt?: Date;
  isLightningDeal?: boolean;
  lightningDealStock?: number;
  variants?: IProductVariant[];
  specifications?: Record<string, string>;
  bulkPricing?: IBulkPricing[];
  vendorId!: string;
}

export class UpdateProductDto implements Partial<CreateProductDto> {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  images?: string[];
  bnplEligible?: boolean;
  discountPrice?: number;
  dealEndsAt?: Date;
  isLightningDeal?: boolean;
  lightningDealStock?: number;
  variants?: IProductVariant[];
  specifications?: Record<string, string>;
  bulkPricing?: IBulkPricing[];
  vendorId?: string;
}
