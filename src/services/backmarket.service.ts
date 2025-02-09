import axios from "axios";
import { BACKMARKET_HEADERS, config } from "../config/config";
import { Order } from "../models/order.model";
import logger from "../utils/logger";
import { backMarketRateLimiter } from "../utils/rate-limiter";
import { withRetry } from "../utils/retry";

export class BackMarketService {
  private static instance: BackMarketService;
  private baseUrl: string;
  private headers: any;

  private constructor() {
    this.baseUrl = config.backmarket.baseUrl;
    this.headers = BACKMARKET_HEADERS;
  }

  static getInstance(): BackMarketService {
    if (!BackMarketService.instance) {
      BackMarketService.instance = new BackMarketService();
    }
    return BackMarketService.instance;
  }

  async getNewOrders(since: Date): Promise<Order[]> {
    return withRetry(async () => {
      await backMarketRateLimiter.waitForToken("backmarket-api");
      const response = await axios.get(
        `${this.baseUrl}/orders?created_after=${since.toISOString()}`,
        { headers: this.headers }
      );
      if(response.statusText !== "OK") {
          logger.error(`Error fetching BackMarket orders: ${response.statusText}`);
          throw new Error(`Error fetching BackMarket orders: ${response.statusText}`);
      }
      return response.data.results.map(this.mapBackMarketOrder);
    }, "Fetching BackMarket orders");
  }

  async updateOrderStatus(
    orderId: number,
    status: string,
    trackingNumber?: string
  ): Promise<void> {
    return withRetry(async () => {
      await backMarketRateLimiter.waitForToken("backmarket-api");
      await axios.put(
        `${this.baseUrl}/orders/${orderId}`,
        {
          status,
          tracking_number: trackingNumber,
        },
        { headers: this.headers }
      );
    }, `Updating BackMarket order ${orderId}`);
  }

  async updateInventory(sku: string, quantity: number): Promise<void> {
    return withRetry(async () => {
      await backMarketRateLimiter.waitForToken("backmarket-api");
      await axios.put(
        `${this.baseUrl}/inventory`,
        {
          sku,
          quantity,
        },
        { headers: this.headers }
      );
    }, `Updating BackMarket inventory for SKU ${sku}`);
  }

  private mapBackMarketOrder(backMarketOrder: any): Order {
    return {
      id: backMarketOrder.id,
      platformId: backMarketOrder.order_id,
      platform: "backmarket",
      status: this.mapOrderStatus(backMarketOrder.status),
      items: backMarketOrder.items.map((item: any) => ({
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
      })),
      trackingNumber: backMarketOrder.tracking_number,
      customerEmail: backMarketOrder.customer_email,
      shippingAddress: {
        name: backMarketOrder.shipping_address.name,
        address1: backMarketOrder.shipping_address.address1,
        address2: backMarketOrder.shipping_address.address2,
        city: backMarketOrder.shipping_address.city,
        country: backMarketOrder.shipping_address.country,
        postalCode: backMarketOrder.shipping_address.postal_code,
      },
      createdAt: new Date(backMarketOrder.created_at),
      updatedAt: new Date(backMarketOrder.updated_at),
    };
  }

  private mapOrderStatus(status: string): Order["status"] {
    switch (status) {
      case "SHIPPED":
        return "shipped";
      case "NEW":
        return "new";
      case "CANCELLED":
        return "cancelled";
      default:
        return "processing";
    }
  }
}
