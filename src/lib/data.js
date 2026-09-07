import { db, databaseConfigured } from "./db";
import { previewProduct, defaultSettings } from "./catalog";
export async function getStore() {
  if (!databaseConfigured)
    return {
      product: previewProduct,
      settings: defaultSettings,
      preview: true,
    };
  const [product, settings] = await Promise.all([
    db.product.findUnique({ where: { slug: "zoorvan-majoon" } }),
    db.setting.findUnique({ where: { id: "store" } }),
  ]);
  return {
    product: product || { ...previewProduct, active: false, stock: 0 },
    settings: settings || defaultSettings,
    preview: process.env.COMMERCE_ENABLED !== "true",
  };
}
