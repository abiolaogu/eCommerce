import { createEventBusFromEnv } from '@fusioncommerce/event-bus';
import { createDatabase } from '@fusioncommerce/database';
import { buildApp } from './app.js';
import { PostgresPaymentRepository } from './payment-repository.js';

const PORT = Number(process.env.PORT ?? 3004);
const eventBus = createEventBusFromEnv({
    kafkaBrokers: process.env.KAFKA_BROKERS,
    useInMemoryBus: process.env.USE_IN_MEMORY_BUS
});

const db = createDatabase({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/ecommerce'
});

const repository = new PostgresPaymentRepository(db);

const app = buildApp({ eventBus, repository });

app
    .listen({ port: PORT, host: '0.0.0.0' })
    .then(async () => {
        await repository.init();
        app.log.info(`Payments service listening on port ${PORT}`);
    })
    .catch(async (error) => {
        app.log.error({ err: error }, 'failed to start payments service');
        await eventBus.disconnect();
        process.exit(1);
    });

process.on('SIGINT', async () => {
    await eventBus.disconnect();
    await app.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await eventBus.disconnect();
    await app.close();
    process.exit(0);
});
