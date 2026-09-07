"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useStore } from "@/components/providers";
import {
  Plus,
  Minus,
  Bag,
  ArrowRight,
  Check,
  Truck,
  ShieldCheck,
} from "@/components/icons";
import { money } from "@/lib/catalog";
export function Quantity({ value, onChange, max = 20 }) {
  return (
    <div className="quantity">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={15} />
      </button>
      <span>{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
export default function Purchase({ compact = false }) {
  const { product, preview, settings } = useStore();
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  return (
    <div className="purchase">
      <div className="product-price">
        {money(product.price)} <span>/ {product.weight} jar</span>
      </div>
      {!compact && (
        <p className="muted">
          Delivery calculated at checkout. Cash on delivery available.
        </p>
      )}
      <div className="purchase-row">
        <Quantity
          value={quantity}
          max={Math.min(20, product.stock || 20)}
          onChange={setQuantity}
        />
        <button
          disabled={!preview && (!product.active || product.stock === 0)}
          className="button"
          onClick={() => {
            add(quantity);
            setAdded(true);
          }}
        >
          {added ? <Check size={19} /> : <Bag size={19} />}{" "}
          {added ? "Added to your bag" : "Add to bag"} <ArrowRight size={17} />
        </button>
      </div>
      {added && (
        <p role="status" className="success-text">
          Your jar is in the bag. <Link href="/cart">View bag →</Link>
        </p>
      )}
      {!compact && (
        <>
          <button
            disabled={!preview && (!product.active || product.stock === 0)}
            className="button outline full"
            onClick={() => {
              add(quantity);
              router.push("/checkout");
            }}
          >
            Order now · Cash on delivery
          </button>
          <div className="small-assurances">
            <span>
              <Truck size={18} /> Free delivery over{" "}
              {money(settings.freeShippingThreshold)}
            </span>
            <span>
              <ShieldCheck size={18} /> Discreet outer packaging
            </span>
          </div>
        </>
      )}
      {preview && (
        <p className="sample-note">
          Preview price & packaging. Final product details coming soon.
        </p>
      )}
    </div>
  );
}
