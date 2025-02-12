import Shopify, { IOrder } from "shopify-api-node";
import { config } from "../config/config";
import { Order } from "../models/order.model";
import logger from "../utils/logger";
import { shopifyRateLimiter } from "../utils/rate-limiter";
import { withRetry } from "../utils/retry";

export class ShopifyService {
  private static instance: ShopifyService;
  private shopify: Shopify;

  private constructor() {
    this.shopify = new Shopify({
      shopName: config.shopify.shopName,
      accessToken: config.shopify.accessToken,
    });
  }

  static getInstance(): ShopifyService {
    if (!ShopifyService.instance) {
      ShopifyService.instance = new ShopifyService();
    }
    return ShopifyService.instance;
  }

  async getProducts(): Promise<any> {
    return withRetry(async () => {
      await shopifyRateLimiter.waitForToken("shopify-api");
      return this.shopify.product.list();
    }, "Fetching Shopify products");
  }

  async getNewOrders(since: Date): Promise<Order[]> {
    return withRetry(async () => {
      await shopifyRateLimiter.waitForToken("shopify-api");
      const orders = await this.shopify.order.list({
        created_at_min: since.toISOString(),
        status: "any",
      });
      console.log('🚀 ~ ShopifyService ~ returnwithRetry ~ orders:', orders);

      return orders.map(this.mapShopifyOrder);
    }, "Fetching Shopify orders");
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    trackingNumber?: string
  ): Promise<void> {
    return withRetry(async () => {
      await shopifyRateLimiter.waitForToken("shopify-api");

      const fulfillment: any = { fulfillment_status: status };
      if (trackingNumber) {
        fulfillment.tracking_number = trackingNumber;
      }

      await this.shopify.order.update(Number(orderId), fulfillment);
    }, `Updating Shopify order ${orderId}`);
  }

  private mapShopifyOrder(shopifyOrder: IOrder): Order {
    return {
      id: shopifyOrder.id.toString(),
      platformId: shopifyOrder.id.toString(),
      platform: "shopify",
      status: this.mapOrderStatus(shopifyOrder.fulfillment_status),
      items: shopifyOrder.line_items.map((item: any) => ({
        sku: item.sku,
        quantity: item.quantity,
        price: parseFloat(item.price),
        status: this.mapOrderStatus(item.fulfillment_status),
      })),
      trackingNumber: this.extractTrackingNumber(shopifyOrder),
      customerEmail: shopifyOrder.email,
      shippingAddress: {
        name: shopifyOrder?.name || "",
        address1: shopifyOrder.shipping_address?.address1 || "",
        address2: shopifyOrder.shipping_address?.address2 || "",
        city: shopifyOrder.shipping_address?.city || "",
        country: shopifyOrder.shipping_address?.country_code || "",
        postalCode: shopifyOrder.shipping_address?.zip || "",
      },
      createdAt: new Date(shopifyOrder.created_at),
      updatedAt: new Date(shopifyOrder.updated_at),
    };
  }

  private extractTrackingNumber(shopifyOrder: any): string | undefined {
    if (shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0) {
      return shopifyOrder.fulfillments[0].tracking_number || undefined || null;
    }
    return undefined;
  }

  private mapOrderStatus(status: string | null): Order["status"] {
    switch (status) {
      case "fulfilled":
        return "shipped";
      case null:
        return "new";
      default:
        return "processing";
    }
  }
}
