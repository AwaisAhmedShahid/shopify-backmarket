export interface OrderItem {
    sku: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    platformId: string;
    platform: 'shopify' | 'backmarket';
    status: 'new' | 'processing' | 'shipped' | 'cancelled';
    items: OrderItem[];
    trackingNumber?: string;
    customerEmail: string;
    shippingAddress: {
        name: string;
        address1: string;
        address2?: string;
        city: string;
        country: string;
        postalCode: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
