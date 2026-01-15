import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InboundShipmentDocument = InboundShipment & Document;

@Schema({ timestamps: true })
export class InboundShipment {
  @Prop({ required: true })
  vendorId: string;

  @Prop({ type: [{ productId: String, expectedQuantity: Number, receivedQuantity: { type: Number, default: 0 } }] })
  items: { productId: string; expectedQuantity: number; receivedQuantity: number }[];

  @Prop({ default: 'CREATED' })
  status: 'CREATED' | 'SHIPPED' | 'RECEIVING' | 'CLOSED' | 'CANCELLED';

  @Prop()
  trackingNumber?: string;

  @Prop()
  carrier?: string;
}

export const InboundShipmentSchema = SchemaFactory.createForClass(InboundShipment);
