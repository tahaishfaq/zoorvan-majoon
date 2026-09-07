export const previewProduct = {
  id: "preview",
  slug: "zoorvan-majoon",
  name: "Zoorvan Majoon",
  description:
    "A traditional herbal majoon for men, rooted in the familiar care of our heritage.",
  price: 2490,
  weight: "250 g",
  stock: 25,
  active: true,
  image: "/images/zoorvan-product.png",
};
export const defaultSettings = {
  shipping: 200,
  freeShippingThreshold: 5000,
  supportEmail: "",
  whatsapp: "",
  announcement: "Cash on delivery across Pakistan",
};
export const money = (value) => `Rs. ${Number(value).toLocaleString("en-PK")}`;
export const statuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
export function calculateTotals(
  price,
  quantity,
  settings = defaultSettings,
  percent = 0,
) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
    throw new Error("Choose between 1 and 20 jars.");
  if (!Number.isInteger(price) || price < 0 || percent < 0 || percent > 100)
    throw new Error("Invalid price.");
  const subtotal = price * quantity;
  const discount = Math.floor((subtotal * percent) / 100);
  const shipping =
    subtotal - discount >= settings.freeShippingThreshold
      ? 0
      : settings.shipping;
  return {
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
  };
}
