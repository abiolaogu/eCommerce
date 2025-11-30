import { Knex } from '@fusioncommerce/database';
import { ShippingLabel } from './types.js';

export interface ShippingRepository {
    save(label: ShippingLabel): Promise<ShippingLabel>;
    findById(id: string): Promise<ShippingLabel | null>;
    findByOrderId(orderId: string): Promise<ShippingLabel[]>;
    init(): Promise<void>;
}

export class PostgresShippingRepository implements ShippingRepository {
    constructor(private readonly knex: Knex) { }

    async init(): Promise<void> {
        const exists = await this.knex.schema.hasTable('shipping_labels');
        if (!exists) {
            await this.knex.schema.createTable('shipping_labels', (table: Knex.CreateTableBuilder) => {
                table.string('id').primary();
                table.string('order_id').notNullable();
                table.string('tracking_number').notNullable();
                table.string('carrier').notNullable();
                table.string('label_url').notNullable();
                table.timestamp('created_at').notNullable();
            });
        }
    }

    async save(label: ShippingLabel): Promise<ShippingLabel> {
        await this.knex('shipping_labels')
            .insert({
                id: label.id,
                order_id: label.orderId,
                tracking_number: label.trackingNumber,
                carrier: label.carrier,
                label_url: label.labelUrl,
                created_at: new Date(label.createdAt)
            })
            .onConflict('id')
            .merge();
        return label;
    }

    async findById(id: string): Promise<ShippingLabel | null> {
        const row = await this.knex('shipping_labels').where({ id }).first();
        if (!row) return null;
        return this.mapRowToLabel(row);
    }

    async findByOrderId(orderId: string): Promise<ShippingLabel[]> {
        const rows = await this.knex('shipping_labels').where({ order_id: orderId });
        return rows.map((row: any) => this.mapRowToLabel(row));
    }

    private mapRowToLabel(row: { id: string; order_id: string; tracking_number: string; carrier: string; label_url: string; created_at: Date }): ShippingLabel {
        return {
            id: row.id,
            orderId: row.order_id,
            trackingNumber: row.tracking_number,
            carrier: row.carrier,
            labelUrl: row.label_url,
            createdAt: row.created_at.toISOString()
        };
    }
}
