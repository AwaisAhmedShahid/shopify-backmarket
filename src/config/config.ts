export const config = {
    shopify: {
        apiKey: process.env.SHOPIFY_API_KEY || '',
        password: process.env.SHOPIFY_PASSWORD || '',
        shopName: process.env.SHOPIFY_SHOP_NAME || '',
        apiVersion: '2023-07',
        pollInterval: 5 * 60 * 1000, // 5 minutes
    },
    backmarket: {
        apiKey: process.env.BACKMARKET_API_KEY || '',
        apiSecret: process.env.BACKMARKET_API_SECRET || '',
        baseUrl: process.env.BACKMARKET_API_URL || 'https://api.backmarket.com',
        pollInterval: 5 * 60 * 1000, // 5 minutes
    },
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    server: {
        port: 8000,
    }
};
