import { Knex } from '@fusioncommerce/database';
import { Payment } from './types.js';

export interface PaymentRepository {
    save(payment: Payment): Promise<Payment>;
    findById(id: string): Promise<Payment | null>;
    findByOrderId(orderId: string): Promise<Payment[]>;
    init(): Promise<void>;
}

export class PostgresPaymentRepository implements PaymentRepository {
    constructor(private readonly knex: Knex) { }

    async init(): Promise<void> {
        const exists = await this.knex.schema.hasTable('payments');
        if (!exists) {
            await this.knex.schema.createTable('payments', (table: Knex.CreateTableBuilder) => {
                table.string('id').primary();
                table.string('order_id').notNullable();
                table.decimal('amount', 10, 2).notNullable();
                table.string('currency').notNullable();
                table.string('status').notNullable();
                table.timestamp('created_at').notNullable();
            });
        }
    }

    async save(payment: Payment): Promise<Payment> {
        await this.knex('payments')
            .insert({
                id: payment.id,
                order_id: payment.orderId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                created_at: new Date(payment.createdAt)
            })
            .onConflict('id')
            .merge();
        return payment;
    }

    async findById(id: string): Promise<Payment | null> {
        const row = await this.knex('payments').where({ id }).first();
        if (!row) return null;
        return this.mapRowToPayment(row);
    }

    async findByOrderId(orderId: string): Promise<Payment[]> {
        const rows = await this.knex('payments').where({ order_id: orderId });
        return rows.map((row: any) => this.mapRowToPayment(row));
    }

    private mapRowToPayment(row: { id: string; order_id: string; amount: string; currency: string; status: any; created_at: Date }): Payment {
        return {
            id: row.id,
            orderId: row.order_id,
            amount: Number(row.amount),
            currency: row.currency,
            status: row.status,
            createdAt: row.created_at.toISOString()
        };
    }
}
