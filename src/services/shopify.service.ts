import Shopify from "shopify-api-node";
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

  async getNewOrders(since: Date): Promise<Order[]> {
    return withRetry(async () => {
      await shopifyRateLimiter.waitForToken("shopify-api");
      const orders = await this.shopify.order.list({
        created_at_min: since.toISOString(),
        status: "any",
      });

      return orders.map(this.mapShopifyOrder);
    }, "Fetching Shopify orders");
  }

  async updateOrderStatus(
    orderId: number,
    status: string,
    trackingNumber?: string
  ): Promise<void> {
    return withRetry(async () => {
      await shopifyRateLimiter.waitForToken("shopify-api");

      const fulfillment: any = { fulfillment_status: status };
      if (trackingNumber) {
        fulfillment.tracking_number = trackingNumber;
      }

      await this.shopify.order.update(orderId, fulfillment);
    }, `Updating Shopify order ${orderId}`);
  }

  async updateInventory(sku: string, quantity: number): Promise<void> {
    return withRetry(async () => {
      await shopifyRateLimiter.waitForToken("shopify-api");
      const inventoryItem = await this.getInventoryItemBySku(sku);
      if (inventoryItem) {
        await this.shopify.inventoryLevel.set({
          inventory_item_id: inventoryItem.id,
          available: quantity,
        });
      }
    }, `Updating Shopify inventory for SKU ${sku}`);
  }

  private async getInventoryItemBySku(sku: string): Promise<any> {
    await shopifyRateLimiter.waitForToken("shopify-api");
    const variants = await this.shopify.inventoryItem.list({ sku });

    if (!variants.length) {
      logger.warn(`No inventory found for SKU: ${sku}`);
      return null;
    }

    const inventoryItemId = variants[0].id;
    if (!inventoryItemId) {
      logger.warn(`No inventory item ID found for SKU: ${sku}`);
      return null;
    }

    return await this.shopify.inventoryItem.get(inventoryItemId);
  }

  private mapShopifyOrder(shopifyOrder: any): Order {
    return {
      id: shopifyOrder.id.toString(),
      platformId: shopifyOrder.order_number.toString(),
      platform: "shopify",
      status: this.mapOrderStatus(shopifyOrder.fulfillment_status),
      items: shopifyOrder.line_items.map((item: any) => ({
        sku: item.sku,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
      trackingNumber: this.extractTrackingNumber(shopifyOrder),
      customerEmail: shopifyOrder.email,
      shippingAddress: {
        name: shopifyOrder.shipping_address?.name || "",
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
