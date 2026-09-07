"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useStore } from "@/components/providers";
import { useMounted } from "./header";
import { Quantity } from "./purchase";
import { money, calculateTotals } from "@/lib/catalog";
import { Bag, Trash, ArrowRight, ShieldCheck } from "@/components/icons";
export function Totals({ totals }) {
  return (
    <div className="totals">
      <div>
        <span>Subtotal</span>
        <span>{money(totals.subtotal)}</span>
      </div>
      {totals.discount > 0 && (
        <div>
          <span>Discount</span>
          <span>−{money(totals.discount)}</span>
        </div>
      )}
      <div>
        <span>Delivery</span>
        <span>{totals.shipping === 0 ? "Free" : money(totals.shipping)}</span>
      </div>
      <div className="grand-total">
        <strong>Total</strong>
        <strong>{money(totals.total)}</strong>
      </div>
      <small>All prices in Pakistani rupees (PKR).</small>
    </div>
  );
}
export default function CartPage() {
  const { product, settings } = useStore();
  const { quantity, setQuantity, clear } = useCart();
  const mounted = useMounted();
  if (!mounted) return <div className="skeleton" style={{ height: 250 }} />;
  if (!quantity)
    return (
      <div className="empty">
        <Bag size={54} weight="light" />
        <h2>Your bag is waiting.</h2>
        <p>A little traditional care is a good place to start.</p>
        <Link className="button" href="/shop">
          Explore Zoorvan <ArrowRight size={18} />
        </Link>
      </div>
    );
  const totals = calculateTotals(product.price, quantity, settings);
  return (
    <div className="checkout-grid">
      <div>
        <div className="cart-item">
          <Image
            src={product.image}
            width={155}
            height={145}
            alt={product.name}
          />
          <div>
            <h3>{product.name}</h3>
            <p>{product.weight} · Herbal blend</p>
            <Quantity value={quantity} onChange={setQuantity} />
          </div>
          <div className="cart-item-end">
            <strong>{money(product.price * quantity)}</strong>
            <button className="text-link" onClick={clear}>
              <Trash size={16} /> Remove
            </button>
          </div>
        </div>
        <Link className="text-link" href="/shop">
          ← Continue shopping
        </Link>
      </div>
      <aside className="summary-panel">
        <h3>Order summary</h3>
        <Totals totals={totals} />
        <Link className="button full" href="/checkout">
          Continue to checkout <ArrowRight size={18} />
        </Link>
        <p className="secure-note">
          <ShieldCheck size={17} /> Cash on delivery. Simple and secure.
        </p>
      </aside>
    </div>
  );
}
