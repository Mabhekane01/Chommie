export interface IProduct {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  ratings: number;
  numReviews: number;
  bnplEligible: boolean;
  trustScoreDiscount: number;
  vendorId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreateProductDto {
  name!: string;
  description!: string;
  price!: number;
  category!: string;
  stock!: number;
  images?: string[];
  bnplEligible?: boolean;
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
  vendorId?: string;
}
