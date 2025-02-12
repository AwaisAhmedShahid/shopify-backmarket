import { BackmarketOrder, ShopifyOrder } from "../Types";

type SimplifiedOrderStatus = "new" | "processing" | "shipped" | "cancelled";

export function getSimplifiedOrderStatus(state: number): SimplifiedOrderStatus {
  switch (state) {
    case 0:
    case 10:
      return "new";
    case 1:
    case 3:
      return "processing";
    case 8:
      return "cancelled";
    case 9:
      return "shipped";
    default:
      return "new";
  }
}

export function getSimplifiedOrderlineStatus(
  state: number
): SimplifiedOrderStatus {
  switch (state) {
    case 0:
    case 8:
      return "new";
    case 1:
    case 2:
    case 9:
      return "processing";
    case 3:
      return "shipped";
    case 4:
    case 5:
    case 6:
    case 7:
      return "cancelled";
    default:
      return "new";
  }
}

export function mapShopifyFulfillmentStatusToSimplified(
  shopifyStatus: string
): SimplifiedOrderStatus {
  switch (shopifyStatus) {
    case "FULFILLED":
      return "shipped";
    case "IN_PROGRESS":
    case "ON_HOLD":
    case "PARTIALLY_FULFILLED":
    case "PENDING_FULFILLMENT":
    case "SCHEDULED":
      return "processing";
    case "OPEN":
    case "RESTOCKED":
    case "UNFULFILLED":
      return "new";
    default:
      return "new";
  }
}

export function mapShopifyToBackmarket(shopifyOrder: ShopifyOrder) {
  return {
    order_id: shopifyOrder.id,
    price: shopifyOrder.total_price,
    currency: "USD", // Assuming USD as default currency for Shopify
    orderlines: shopifyOrder.line_items.map((item) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      product: item.title,
      listing: item.sku,
      brand: "Unknown", // Shopify doesn't provide brand info directly
      condition: 11, // Default condition for Backmarket
    })),
  };
}

export function mapBackmarketToShopify(backmarketOrder: BackmarketOrder) {
  return {
    id: backmarketOrder.order_id,
    name: `#${backmarketOrder.order_id}`, // Generate a name from the order ID
    total_price: backmarketOrder.price,
    line_items: backmarketOrder.orderlines.map((item) => ({
      id: item.id,
      name: item.product,
      price: item.price,
      quantity: item.quantity,
      sku: item.listing,
      taxable: true, // Default to taxable for Shopify
      title: item.product,
      variant_id: item.id, // Use the same ID as variant ID
      variant_title: item.product, // Use product name as variant title
    })),
  };
}
