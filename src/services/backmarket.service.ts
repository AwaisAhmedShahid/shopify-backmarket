import axios from "axios";
import { BACKMARKET_HEADERS, config } from "../config/config";
import { Order } from "../models/order.model";
import logger from "../utils/logger";
import { backMarketRateLimiter } from "../utils/rate-limiter";
import { withRetry } from "../utils/retry";
import { getSimplifiedOrderlineStatus, getSimplifiedOrderStatus } from "../utils/order-mappers";
import { BackmarketOrder } from "../Types";

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
        `${this.baseUrl}/ws/orders?created_after=${since.toISOString()}`,
        { headers: this.headers }
      );
      if (response.statusText !== "OK") {
        logger.error(
          `Error fetching BackMarket orders: ${response.statusText}`
        );
        throw new Error(
          `Error fetching BackMarket orders: ${response.statusText}`
        );
      }
      return response.data.results.map(this.mapBackMarketOrder);
    }, "Fetching BackMarket orders");
  }

  async updateOrderStatus(
    orderId: string,
    status: number,
    trackingNumber?: string
  ): Promise<void> {
    return withRetry(async () => {
      await backMarketRateLimiter.waitForToken("backmarket-api");
      await axios.put(
        `${this.baseUrl}/ws/orders/${orderId}`,
        {
          state: status,
          tracking_number: trackingNumber,
        },
        { headers: this.headers }
      );
    }, `Updating BackMarket order ${orderId}`);
  }

  private mapBackMarketOrder(backMarketOrder: BackmarketOrder): Order {
    return {
      id: backMarketOrder.order_id,
      platformId: backMarketOrder.order_id,
      platform: "backmarket",
      status: getSimplifiedOrderStatus(backMarketOrder.state),
      items: backMarketOrder.orderlines.map((item) => ({
        sku: item.listing.toString(),
        quantity: item.quantity,
        price: Number(item.price),
        status: getSimplifiedOrderlineStatus(item.state),
      })),
      trackingNumber: backMarketOrder.tracking_number,
      customerEmail: backMarketOrder.billing_address.email,
      shippingAddress: {
        name: backMarketOrder.shipping_address.first_name,
        address1: backMarketOrder.shipping_address.street,
        address2: backMarketOrder.shipping_address.street2,
        city: backMarketOrder.shipping_address.city,
        country: backMarketOrder.shipping_address.country,
        postalCode: backMarketOrder.shipping_address.postal_code,
      },
      createdAt: new Date(backMarketOrder.date_creation),
      updatedAt: new Date(backMarketOrder.date_modification),
    };
  }
}
