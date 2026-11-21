// ADMIN ke paas saare modules ka full access hai
export const ROLE_PERMISSIONS = {
  ADMIN: [
    "dashboard",
    "users",
    "store",
    "category",
    "sub-category",
    "brands",
    "product",
  ],
  STORE_MANAGER: [
    "dashboard",
    "store",
    "category",
    "sub-category",
    "brands",
    "product",
  ],
  INVENTORY_MANAGER: ["dashboard", "store", "product"],
  DELIVERY_PARTNER: ["dashboard", "orders"],
  SUPPORT_AGENT: ["dashboard", "users"],
  CUSTOMER: ["dashboard"],
};