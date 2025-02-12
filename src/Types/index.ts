import { IOrderLineItem } from "shopify-api-node";

// *************************** BackMarket *****************************

export interface BackMarketProduct {
  id: number;
  bmId: number;
  productId: string;
  title: string;
  thumbnail: any;
  markets: any[];
  categoryId: number;
  isPublicationStateComputing: boolean;
  quantity: number;
  sku: string;
}

interface BackMarketOrdersAddress {
  company: string;
  first_name: string;
  first_name_pronunciation: string | null;
  last_name: string;
  last_name_pronunciation: string | null;
  street: string;
  street2: string;
  postal_code: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  customer_id_number: string;
}

interface BackMarketOrderLine {
  id: number;
  date_creation: string;
  state: number;
  price: string;
  shipping_price: string;
  shipping_delay: number;
  shipper: string;
  currency: string;
  return_reason: number;
  return_message: string;
  listing: string;
  product: string;
  quantity: number;
  brand: string;
  product_id: number;
  backcare: boolean;
  backcare_price: number;
  listing_id: number;
  sales_taxes: string;
  imei: string;
  serial_number: string;
  condition: number;
  orderline_fee: string;
}

export interface BackmarketOrder {
  order_id: string;
  shipping_address: BackMarketOrdersAddress;
  billing_address: BackMarketOrdersAddress;
  delivery_note: string | null;
  tracking_number: string;
  tracking_url: string;
  shipper: string;
  shipper_display: string;
  date_creation: string;
  date_modification: string;
  date_shipping: string | null;
  date_payment: string;
  date_bill_provided: string | null;
  state: number;
  orderlines: BackMarketOrderLine[];
  price: string;
  shipping_price: string;
  currency: string;
  country_code: string;
  paypal_reference: string | null;
  psp_reference: string;
  installment_payment: boolean;
  payment_method: string;
  sales_taxes: string;
  expected_dispatch_date: string;
  is_backship: boolean;
}

// *************************** Shopify *****************************

interface ShopifyMoney {
  amount: string;
  currency_code: string;
}

interface ShopifyPriceSet {
  shop_money: ShopifyMoney;
  presentment_money: ShopifyMoney;
}

interface ShopifyDiscountAllocation {
  amount: string;
  amount_set: ShopifyPriceSet;
  discount_application_index: number;
}

interface ShopifyLineItem {
  id: number;
  admin_graphql_api_id: string;
  current_quantity: number;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: null | string;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set: ShopifyPriceSet;
  product_exists: boolean;
  product_id: number;
  properties: Array<{
    name: string;
    value: string;
  }>;
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: ShopifyPriceSet;
  variant_id: number;
  variant_inventory_management: string;
  variant_title: string;
  vendor: null | string;
  tax_lines: any[];
  duties: any[]; // Replace `any` with a specific type if duties structure is known
  discount_allocations: ShopifyDiscountAllocation[];
}

export interface ShopifyOrder {
  id: number;
  name: string;
  total_price: string;
  line_items: IOrderLineItem[];
  fulfillment_status: string | null;
  email: string;
  shipping_address: {
    name: string;
    address1: string;
    address2: string;
    city: string;
    country: string;
    zip: string;
    phone: string;
    province: string;
    country_code: string;
    province_code: string;
  };
  created_at: string;
  updated_at: string;
  order_number: string;
  billing_address: {
    name: string;
    address1: string;
    address2: string;
    city: string;
    country: string;
    zip: string;
    phone: string;
    province: string;
    country_code: string;
    province_code: string;
  };
}
