import Link from "next/link";
import { Brand } from "./header";
import { ArrowUpRight } from "@/components/icons";
export default function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <Brand />
          <p>
            A little tradition.
            <br />A little care. Every day.
          </p>
          <span className="muted">A Pakistani brand, for Pakistan.</span>
        </div>
        <div>
          <h4>Explore Zoorvan</h4>
          <Link href="/shop">
            Shop Majoon <ArrowUpRight size={13} />
          </Link>
          <Link href="/#our-story">Our story</Link>
          <Link href="/#faqs">Common questions</Link>
        </div>
        <div>
          <h4>Here to help</h4>
          <Link href="/track-order">Track your order</Link>
          <Link href="/account/orders">Your orders</Link>
          <Link href="/contact">Contact us</Link>
        </div>
        <div>
          <h4>Shop with confidence</h4>
          <p>
            Cash on delivery
            <br />
            Pakistan-wide delivery
            <br />
            Discreet outer packaging
          </p>
          <div className="payment-tag">
            COD <span>Pay when it arrives</span>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Zoorvan. All rights reserved.</span>
        <div>
          <Link href="/terms-and-conditions">Terms & conditions</Link>
          <Link href="/privacy-policy">Privacy policy</Link>
        </div>
        <span>Made for our everyday.</span>
      </div>
    </footer>
  );
}
