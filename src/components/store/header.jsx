"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  Bag,
  UserCircle,
  List,
  X,
  Truck,
  Leaf,
  ArrowUpRight,
} from "@/components/icons";
import { useCart } from "@/store/cart";
import { useStore } from "@/components/providers";
const subscribe = () => () => {};
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Zoorvan home">
      <Leaf size={33} weight="duotone" />
      <span>
        ZOORVAN<small>روایت سے، آپ کے لیے</small>
      </span>
    </Link>
  );
}
export default function Header() {
  const { settings, preview } = useStore();
  const quantity = useCart((s) => s.quantity);
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <>
      <div className="announcement">
        <span>
          <Truck size={16} />
          {settings.announcement}
        </span>
        <span className="announcement-urdu" lang="ur" dir="rtl">
          اپنا خیال، اپنی روایت
        </span>
        <Link href="/track-order">
          Track your order <ArrowUpRight size={14} />
        </Link>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Brand />
          <nav
            className={open ? "nav is-open" : "nav"}
            aria-label="Main navigation"
          >
            {[
              ["/", "Home"],
              ["/shop", "Shop Majoon"],
              ["/#our-story", "Our story"],
              ["/#faqs", "FAQs"],
            ].map(([href, label]) => (
              <Link
                onClick={() => setOpen(false)}
                key={href}
                className={path === href ? "active" : ""}
                href={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link href="/account" aria-label="My account">
              <UserCircle size={25} />
            </Link>
            <Link
              className="cart-link"
              href="/cart"
              aria-label={`Shopping bag, ${mounted ? quantity : 0} items`}
            >
              <Bag size={24} />
              <span className="bag-label">Bag</span>
              <b>{mounted ? quantity : 0}</b>
            </Link>
            <button
              className="menu-button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
      </header>
      {preview && path !== "/" && (
        <div className="preview-strip">
          Store preview · Sample prices and packaging · No live payments or
          orders
        </div>
      )}
    </>
  );
}
