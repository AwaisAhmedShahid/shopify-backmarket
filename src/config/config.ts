import dotenv from 'dotenv';
dotenv.config();

export const config = {
    shopify: {
        shopName: process.env.SHOPIFY_SHOP_NAME || '',
        apiKey: process.env.SHOPIFY_API_KEY || '',
        secret: process.env.SHOPIFY_API_SECRET || '',
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
        pollInterval: 5 * 60 * 1000, // 5 minutes
    },
    backmarket: {
        apiKey: process.env.BACKMARKET_API_KEY || '',
        credentials: Buffer.from(`${process.env.BACKMARKET_USERNAME}:${process.env.BACKMARKET_PASSWORD}`).toString('base64'),
        password: process.env.BACKMARKET_PASSWORD || '',
        userName: process.env.BACKMARKET_USERNAME || '',
        baseUrl: process.env.BACKMARKET_API_URL || 'https://api.backmarket.com',
        pollInterval: 5 * 60 * 1000, // 5 minutes
    },
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    server: {
        port: 8000,
    }
};

export const BACKMARKET_HEADERS = {
    Authorization: `Basic ${config.backmarket.credentials}`,
    Accept: 'application/json',
    'Accept-Language': 'fr-fr',
    'Content-Type': 'application/json',
  };
