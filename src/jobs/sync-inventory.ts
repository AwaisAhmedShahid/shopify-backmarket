import { config } from "../config/config";
import Shopify from "shopify-api-node";
import logger from "../utils/logger";
import { BackMarketService } from "../services/backmarket.service";
import { BackMarketProduct } from "../Types";

// Initialize Shopify
export const shopify = new Shopify({
  shopName: config.shopify.shopName,
  accessToken: config.shopify.accessToken,
});

export class SyncInventory {
  public async updateProductOnHook(data: any | null): Promise<any> {
    const backMarketService = BackMarketService.getInstance();
    if (!data) {
      return {
        success: false,
        message: "No Data found from Hook.",
      };
    }
    const available = data.available;
    const item = await shopify.inventoryItem.get(data.inventory_item_id);

    if (!item) {
      return {
        success: false,
        message: "Shopify product not found.",
      };
    }

    const itemSKU = item.sku;
    const getProductsResponse: BackMarketProduct[] =
      await backMarketService.getProductsBySKU(itemSKU);

    if (getProductsResponse?.length < 1) {
      logger.warn(`No BackMarket products found.`);
      return {
        success: false,
        message: `No BackMarket products found.`,
      };
    }

    const updatedProductsResults = await Promise.all(
      getProductsResponse.map((product) =>
        backMarketService.updateProductInventoryById(
          product.id,
          product.quantity,
          available
        )
      )
    );
    return {
      success: true,
      message: "Inventory Sync Successful",
      details: updatedProductsResults,
    };
  }
}
