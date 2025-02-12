import cron from "node-cron";
import { ShopifyService } from "../services/shopify.service";
import { BackMarketService } from "../services/backmarket.service";
import { MemoryStore } from "../storage/memory-store";
import { SkuMapper } from "../utils/sku-mapper";
import logger from "../utils/logger";
import { Order } from "../models/order.model";

export class SyncManager {
  private shopifyService: ShopifyService;
  private backMarketService: BackMarketService;
  private store: MemoryStore;
  private lastSyncTime: Date;

  constructor() {
    this.shopifyService = ShopifyService.getInstance();
    this.backMarketService = BackMarketService.getInstance();
    this.store = MemoryStore.getInstance();
    this.lastSyncTime = new Date();
  }
  startSync(): void {
    this.syncOrders();
    cron.schedule("*/15 * * * *", () => {
      logger.info("Executing order sync...");
      this.syncOrders();
    });
  }

  getLastSyncTime(): Date {
    return this.lastSyncTime;
  }

  private async syncOrders(): Promise<void> {
    logger.info("Starting orders sync");
    try {
      const [backMarketOrders = []] = await Promise.all([
        this.backMarketService.getNewOrders(this.lastSyncTime),
      ]);
      const [shopifyOrders = []] = await Promise.all([
        this.shopifyService.getNewOrders(this.lastSyncTime),
      ]);

      for (const order of shopifyOrders) {
        await this.processShopifyOrder(order);
      }

      for (const order of backMarketOrders) {
        await this.processBackMarketOrder(order);
      }

      this.lastSyncTime = new Date();
      logger.info("Order sync completed successfully", {
        shopifyOrderCount: shopifyOrders.length,
        backMarketOrderCount: backMarketOrders.length,
      });
    } catch (error) {
      logger.error("Error in order sync:", error);
    }
  }

  private async processShopifyOrder(order: Order): Promise<void> {
    try {
      const mappedItems = order.items.map((item) => ({
        ...item,
        backmarketSkus: SkuMapper.shopifyToBackMarket(item.sku),
      }));

      if (order.status === "shipped" && order.trackingNumber) {
        for (const item of mappedItems) {
          for (const backmarketSku of item.backmarketSkus) {
            await this.backMarketService.updateOrderStatus(
              order.id,
              4,
              order.trackingNumber
            );
          }
        }
      }
      if (order.status === "processing" && order.trackingNumber) {
        for (const item of mappedItems) {
          for (const backmarketSku of item.backmarketSkus) {
            await this.backMarketService.updateOrderStatus(
              order.id,
              3,
              order.trackingNumber
            );
          }
        }
      }
      if (order.status === "cancelled" && order.trackingNumber) {
        for (const item of mappedItems) {
          for (const backmarketSku of item.backmarketSkus) {
            await this.backMarketService.updateOrderStatus(
              order.id,
              7,
              order.trackingNumber
            );
          }
        }
      }

      this.store.addOrder(order);
      logger.info(`Successfully processed Shopify order ${order.id}`);
    } catch (error) {
      logger.error(`Error processing Shopify order ${order.id}:`, error);
      this.store.addFailedImport(order.id);
    }
  }

  private async processBackMarketOrder(order: Order): Promise<void> {
    try {
      const mappedItems = order.items.map((item) => ({
        ...item,
        sku: SkuMapper.backMarketToShopifySKU(item.sku),
      }));

      if (order.status === "shipped" && order.trackingNumber) {
        await this.shopifyService.updateOrderStatus(
          order.id,
          "shipped",
          order.trackingNumber
        );
      }

      if (order.status === "processing") {
        await this.shopifyService.updateOrderStatus(order.id, "processing");
      }

      if (order.status === "new") {
        await this.shopifyService.updateOrderStatus(order.id, "new");
      }

      if (order.status === "shipped") {
        await this.shopifyService.updateOrderStatus(order.id, "shipped");
      }

      if (order.status === "cancelled") {
        await this.shopifyService.updateOrderStatus(order.id, "cancelled");
      }

      this.store.addOrder(order);
      logger.info(`Successfully processed BackMarket order ${order.id}`);
    } catch (error) {
      logger.error(`Error processing BackMarket order ${order.id}:`, error);
      this.store.addFailedImport(order.id);
    }
  }
}
