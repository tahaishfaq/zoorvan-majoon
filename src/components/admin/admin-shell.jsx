"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { SquaresFour, Storefront, List, X, SignOut } from "@/components/icons";

const sections = [
  "overview",
  "orders",
  "products",
  "inventory",
  "customers",
  "coupons",
  "reviews",
  "content",
  "settings",
  "staff",
  "reports",
  "activity",
];

export default function AdminShell({ children, name }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#main">
        Skip to dashboard
      </a>
      <header className="admin-topbar">
        <Link
          className="admin-wordmark"
          href="/admin"
          aria-label="Admin dashboard"
        >
          <SquaresFour size={24} weight="duotone" />
          <span>
            ZOORVAN <small>ADMIN</small>
          </span>
        </Link>
        <Link className="admin-store-link" href="/">
          <Storefront size={18} /> View storefront
        </Link>
        <button
          type="button"
          className="admin-menu-toggle"
          aria-label={menuOpen ? "Close admin menu" : "Open admin menu"}
          aria-expanded={menuOpen}
          aria-controls="admin-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </header>
      <div className="admin-workspace">
        <aside className={`admin-sidebar${menuOpen ? " is-open" : ""}`}>
          <p className="admin-identity">
            Signed in as<strong>{name}</strong>
          </p>
          <nav id="admin-navigation" aria-label="Admin navigation">
            {sections.map((section) => {
              const href =
                section === "overview" ? "/admin" : `/admin/${section}`;
              const active = pathname === href;
              return (
                <Link
                  href={href}
                  key={section}
                  aria-current={active ? "page" : undefined}
                  className={active ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            className="admin-signout"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <SignOut size={18} /> Sign out
          </button>
        </aside>
        <main id="main" className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
