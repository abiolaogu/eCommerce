export const ORDER_CREATED_TOPIC = 'order.created';
export const INVENTORY_RESERVED_TOPIC = 'inventory.reserved';
export const INVENTORY_FAILED_TOPIC = 'inventory.insufficient';

export const GROUP_COMMERCE_CAMPAIGN_CREATED_TOPIC = 'group-commerce.campaign.created';
export const GROUP_COMMERCE_CAMPAIGN_JOINED_TOPIC = 'group-commerce.campaign.joined';
export const GROUP_COMMERCE_CAMPAIGN_SUCCESSFUL_TOPIC = 'group-commerce.campaign.successful';

export const PAYMENT_CREATED_TOPIC = 'payment.created';
export const PAYMENT_SUCCEEDED_TOPIC = 'payment.succeeded';
export const PAYMENT_FAILED_TOPIC = 'payment.failed';

export const SHIPPING_LABEL_CREATED_TOPIC = 'shipping.label.created';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface OrderCreatedEvent {
  orderId: string;
  customerId: string;
  total: number;
  items: Array<{ sku: string; quantity: number; price: number }>;
}

export interface InventoryStatusEvent {
  orderId: string;
  status: 'reserved' | 'insufficient';
  sku?: string;
  quantity?: number;
}

export interface GroupCommerceCampaign {
  id: string;
  productId: string;
  minParticipants: number;
  maxParticipants: number;
  actualParticipants: number;
  price: number;
  originalPrice: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'successful' | 'failed' | 'expired';
}

export interface GroupCommerceCampaignCreatedEvent extends GroupCommerceCampaign { }

export interface GroupCommerceCampaignJoinedEvent {
  campaign: GroupCommerceCampaign;
  userId: string;
}

export interface GroupCommerceCampaignSuccessfulEvent extends GroupCommerceCampaign { }

export interface PaymentCreatedEvent {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'succeeded' | 'failed';
}

export interface PaymentSucceededEvent {
  paymentId: string;
  orderId: string;
}

export interface PaymentFailedEvent {
  paymentId: string;
  orderId: string;
  reason: string;
}

export interface ShippingLabelCreatedEvent {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  labelUrl: string;
}