export const ORDER_CREATED_TOPIC = 'order.created';
export const INVENTORY_RESERVED_TOPIC = 'inventory.reserved';
export const INVENTORY_FAILED_TOPIC = 'inventory.insufficient';

export const GROUP_COMMERCE_CAMPAIGN_CREATED_TOPIC = 'group-commerce.campaign.created';
export const GROUP_COMMERCE_CAMPAIGN_JOINED_TOPIC = 'group-commerce.campaign.joined';
export const GROUP_COMMERCE_CAMPAIGN_SUCCESSFUL_TOPIC = 'group-commerce.campaign.successful';

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

export interface GroupCommerceCampaignCreatedEvent extends GroupCommerceCampaign {}

export interface GroupCommerceCampaignJoinedEvent {
  campaign: GroupCommerceCampaign;
  userId: string;
}

export interface GroupCommerceCampaignSuccessfulEvent extends GroupCommerceCampaign {}