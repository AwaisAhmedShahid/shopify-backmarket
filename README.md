# Shopify ↔ BackMarket Integration

A Node.js/TypeScript application to synchronize orders, inventory, and order statuses between Shopify and BackMarket. Built for low-cost hosting and reliability.

---

## Features

- **Automated Order Import**: New Shopify orders are sent to BackMarket in real-time.
- **Order Status Sync with Inventory**: Orders marked as "sent" in Shopify update BackMarket with tracking numbers.
- **SKU Mapping**: Flexible SKU linking (e.g., `00123B` → `00123B/FR`, `00123B/DE`).
- **Error Logging**: Track failed order imports and syncs.
- **Cancellation Sync**: BackMarket cancellations reflect in Shopify.

---

## Prerequisites

- Node.js v18+
- npm v9+
- Shopify Partner Account & Development Store
- BackMarket Seller Account (Pre-Production)
- Environment Variables

---

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/AwaisAhmedShahid/shopify-backmarket.git
   cd shopify-backmarket

   npm install

   ```

   ## Configuration

   ### 1. Environment Variables

   Create a `.env` file in the root directory:


   ```

   # Shopify Configuration
   SHOPIFY_SHOP_NAME=
   SHOPIFY_API_SECRET=
   SHOPIFY_ACCESS_TOKEN=

   # Back Market Configuration
   BACKMARKET_API_KEY=
   BACKMARKET_PASSWORD=
   BACKMARKET_USERNAME=
   BACKMARKET_API_URL=https://preprod.backmarket.fr/ws/

   # Node Environment
   NODE_ENV=development
   ```

   ---

   ## Running Locally

   1. **Start the Server** :
      bash

      Copy

   ```
      npx ts-node src/index.ts
   ```

   ## Deployment

   ### Hosting Options

   * **Render** : [Deploy Node.js App Guide](https://render.com/docs/deploy-nodejs-app)

   ### Steps

   1. Push your code to GitHub.
   2. Set environment variables in your hosting provider’s dashboard.
   3. Deploy the application.

   ## Contributing

   1. Fork the repository.
   2. Create a feature branch: `git checkout -b feature/your-feature`.
   3. Commit changes: `git commit -m 'Add some feature'`.
   4. Push to the branch: `git push origin feature/your-feature`.
   5. Open a pull request.

---
