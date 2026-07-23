import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  brand?: string;

  /** Internal stock-keeping unit / barcode. */
  @Prop()
  sku?: string;

  /** Pack size for price-per-unit display, e.g. { unitValue: 10, unitMeasure: 'kg' }. */
  @Prop()
  unitValue?: number;

  @Prop()
  unitMeasure?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: 10 })
  lowStockThreshold: number;

  @Prop({ default: 'PENDING_REVIEW' })
  approvalStatus: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

  @Prop({ default: 'FBC' })
  fulfillmentType: 'FBC' | 'FBM'; // FBC = Fulfilled by Chommie (Warehouse), FBM = Merchant

  @Prop([String])
  images: string[];

  @Prop({ default: 0 })
  ratings: number;

  @Prop({ default: 0 })
  numReviews: number;

  @Prop({ default: true })
  bnplEligible: boolean;

  @Prop({ default: 0 })
  trustScoreDiscount: number;

  @Prop()
  discountPrice?: number;

  @Prop()
  dealEndsAt?: Date;

  @Prop({ default: false })
  isLightningDeal: boolean;

  @Prop({ default: 0 })
  lightningDealStock: number;

  @Prop({ default: 0 })
  lightningDealSold: number;

  @Prop({ type: [{ name: String, options: [{ value: String, priceModifier: Number, stock: Number, image: String }] }] })
  variants?: any[];

  @Prop([String])
  badges?: string[];

  @Prop({ type: [{ minQuantity: Number, discountPercentage: Number }] })
  bulkPricing?: { minQuantity: number, discountPercentage: number }[];


  // --- Chommie staples/discovery blueprint fields (do.md §3.1, §3.5) ---

  /** Core staple (eggs, maize meal, rice, oil…). Staples core is never pay-to-rank. */
  @Prop({ default: false })
  isStaple: boolean;

  /** Reference retail price, used to prove savings-vs-retail (do.md §6 price transparency). */
  @Prop()
  retailPrice?: number;

  /** Landed cost (supplier + logistics + minimal handling) — for the auditable margin ceiling. */
  @Prop()
  landedCost?: number;

  /** Producer/supplier attributes powering the structural local & Black-owned visibility weighting. */
  @Prop({ default: false })
  blackOwned: boolean;

  @Prop({ default: false })
  localProducer: boolean;

  @Prop()
  producerName?: string;

  /** The producer/supplier Chommie sources this from (do.md §5) — links to supply-service. */
  @Prop({ required: true })
  supplierId: string;

  /** Regions/townships this producer delivers to (e.g. ["Khayelitsha","Gauteng"]). Empty = national. */
  @Prop([String])
  deliveryRegions?: string[];

  /** Supplier reliability 0..1 (on-time / in-stock history). Seeded, then learned. */
  @Prop({ default: 0.7 })
  reliabilityScore: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Catalogue query performance: text search + the hot filter paths.
ProductSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });
ProductSchema.index({ category: 1, approvalStatus: 1 });
ProductSchema.index({ isStaple: 1, approvalStatus: 1 });
ProductSchema.index({ supplierId: 1 });
