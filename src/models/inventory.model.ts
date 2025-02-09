export interface InventoryItem {
    sku: string;
    quantity: number;
    platform: 'shopify' | 'backmarket';
    lastUpdated: Date;
}

export interface SkuMapping {
    shopifySku: string;
    backmarketSkus: string[];
}
