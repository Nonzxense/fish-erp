import { REF_FISH_PURCHASE_INVOICE, REF_FISH_SALE_INVOICE, REF_TRUCK_INVOICE } from "./constants";

const invoiceTypeMap = {
  sale: REF_FISH_SALE_INVOICE,
  purchase: REF_FISH_PURCHASE_INVOICE,
  shipping: REF_TRUCK_INVOICE
} as const