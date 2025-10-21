import { GroupCommerceCampaign } from './types.js';

export interface GroupCommerceRepository {
  create(campaign: GroupCommerceCampaign): Promise<GroupCommerceCampaign>;
  findById(id: string): Promise<GroupCommerceCampaign | null>;
  findAll(): Promise<GroupCommerceCampaign[]>;
  update(id: string, campaign: Partial<GroupCommerceCampaign>): Promise<GroupCommerceCampaign>;
}

export class InMemoryGroupCommerceRepository implements GroupCommerceRepository {
  private campaigns: Map<string, GroupCommerceCampaign> = new Map();

  async create(campaign: GroupCommerceCampaign): Promise<GroupCommerceCampaign> {
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async findById(id: string): Promise<GroupCommerceCampaign | null> {
    return this.campaigns.get(id) ?? null;
  }

  async findAll(): Promise<GroupCommerceCampaign[]> {
    return Array.from(this.campaigns.values());
  }

  async update(id: string, campaign: Partial<GroupCommerceCampaign>): Promise<GroupCommerceCampaign> {
    const existingCampaign = await this.findById(id);
    if (!existingCampaign) {
      throw new Error('Campaign not found');
    }
    const updatedCampaign = { ...existingCampaign, ...campaign };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
}
