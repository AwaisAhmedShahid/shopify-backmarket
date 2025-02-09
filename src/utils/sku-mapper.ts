export class SkuMapper {
    static shopifyToBackMarket(shopifySku: string): string[] {
        // Remove any suffix after underscore (e.g., _AESTHETIC)
        const baseSku = shopifySku.split('_')[0];
        
        // Generate possible BackMarket SKU variants
        const variants = [
            `${baseSku}/FR`,
            `${baseSku}/DE`,
            `${baseSku}/NL`,
            `${baseSku}/NEW/FR`,
            `${baseSku}/NEW/DE`,
            `${baseSku}/NEW/NL`
        ];
        
        return variants;
    }

    static backMarketToShopify(backMarketSku: string): string {
        // Extract base SKU before the first slash
        return backMarketSku.split('/')[0];
    }
}
