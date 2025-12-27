import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    console.log('Testing MP Token:', token ? `Present (${token.substring(0, 10)}...)` : 'Missing');

    if (!token) {
        console.error('No ID found');
        return;
    }

    const client = new MercadoPagoConfig({ accessToken: token });

    // Try to search for payments (read-only usually allowed)
    const payment = new Payment(client);

    try {
        // Just try to get something simple or even just initialize
        console.log('Attempting to search payments...');
        const result = await payment.search({ options: { limit: 1 } });
        console.log('Success! Connection verified.');
        console.log('Found payments:', result.results?.length ?? 0);
    } catch (error: any) {
        console.error('Connection Failed:', error.message);
        if (error.status) console.error('Status:', error.status);
        if (error.cause) console.error('Cause:', JSON.stringify(error.cause, null, 2));
    }
}

testConnection();
