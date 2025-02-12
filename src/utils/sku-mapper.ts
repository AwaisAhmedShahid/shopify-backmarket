export class SkuMapper {
  static shopifyToBackMarket(shopifySku: string): string[] {
    // Remove any suffix after underscore (e.g., _AESTHETIC)
    const baseSku = shopifySku.split("_")[0];

    // Generate possible BackMarket SKU variants
    const variants = [
      `${baseSku}/FR`,
      `${baseSku}/DE`,
      `${baseSku}/NL`,
      `${baseSku}/AT`,
      `${baseSku}/OF`,
      `${baseSku}/ES`,
      `${baseSku}/NEW/FR`,
      `${baseSku}/NEW/DE`,
      `${baseSku}/NEW/NL`,
    ];

    return variants;
  }

  static backMarketToShopifySKU(backMarketSku: string): string {
  console.log('🚀 ~ SkuMapper ~ backMarketToShopify ~ backMarketSku:', backMarketSku);

    // Extract base SKU before the first slash
    if (!backMarketSku?.includes("/")) {
    return backMarketSku.split("/")[0];
    }
    return ""
  }
}
