import Image from "next/image";
import Link from "next/link";
import Purchase from "@/components/store/purchase";
import { db, databaseConfigured } from "@/lib/db";
import { getStore } from "@/lib/data";
export const metadata = { title: "Shop Majoon" };
export default async function Shop() {
  const { product } = await getStore();
  const reviews = databaseConfigured
    ? await db.review.findMany({
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 12,
      })
    : [];
  return (
    <div className="container section">
      <div className="breadcrumb">
        <Link href="/">Home</Link> / Shop / Zoorvan Majoon
      </div>
      <div className="shop-grid">
        <div className="shop-image">
          <Image
            src={product.image}
            fill
            priority
            alt="Zoorvan Majoon provisional product packaging"
            sizes="(max-width:760px) 100vw, 50vw"
          />
        </div>
        <div className="shop-copy">
          <p className="eyebrow">TRADITIONAL CARE, EVERY DAY</p>
          <h1>{product.name}</h1>
          <p className="urdu-product" lang="ur">
            زوروان معجون
          </p>
          <p>{product.description}</p>
          <span className="weight-tag">
            {product.weight} · Men’s herbal blend
          </span>
          <Purchase />
          {[
            [
              "Product details",
              "A traditional majoon format. Final ingredients, nutritional information, suitability and storage instructions will be added before the product is available to order.",
            ],
            [
              "Directions & suitability",
              "Use only as directed on the final label. This preview does not provide dosage or medical guidance.",
            ],
            [
              "Delivery & returns",
              "Cash on delivery within Pakistan. Final dispatch estimates, service areas and return terms will be confirmed before launch.",
            ],
          ].map(([title, body]) => (
            <details className="product-detail" key={title}>
              <summary>
                {title}
                <span>+</span>
              </summary>
              <p>{body}</p>
            </details>
          ))}
        </div>
      </div>
      {reviews.length > 0 && (
        <section className="customer-reviews section">
          <h2>From our customers</h2>
          <div>
            {reviews.map((review) => (
              <article key={review.id}>
                <strong>{review.name}</strong>
                <span>{review.rating} / 5</span>
                <p>{review.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
