import { Order } from "../models/order.model";
import { InventoryItem } from "../models/inventory.model";

export class MemoryStore {
  private static instance: MemoryStore;
  private orders: Map<number, Order>;
  private inventory: Map<string, InventoryItem>;
  private failedImports: Set<string | number>;

  private constructor() {
    this.orders = new Map();
    this.inventory = new Map();
    this.failedImports = new Set();
  }

  static getInstance(): MemoryStore {
    if (!MemoryStore.instance) {
      MemoryStore.instance = new MemoryStore();
    }
    return MemoryStore.instance;
  }

  // Order methods
  addOrder(order: Order): void {
    this.orders.set(order.id, order);
  }

  getOrder(id: number): Order | undefined {
    return this.orders.get(id);
  }

  updateOrder(order: Order): void {
    this.orders.set(order.id, order);
  }

  // Inventory methods
  updateInventory(item: InventoryItem): void {
    this.inventory.set(item.sku, item);
  }

  getInventory(sku: string): InventoryItem | undefined {
    return this.inventory.get(sku);
  }

  // Failed imports tracking
  addFailedImport(orderId: number): void {
    this.failedImports.add(orderId);
  }

  removeFailedImport(orderId: number): void {
    this.failedImports.delete(orderId);
  }

  getFailedImports(): (string | number)[] {
    return Array.from(this.failedImports);
  }
}
