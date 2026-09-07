import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Truck,
  ShieldCheck,
  Bag,
  Package,
  MapPin,
} from "@/components/icons";
import Purchase from "@/components/store/purchase";
const faqs = [
  [
    "What is Zoorvan Majoon?",
    "Zoorvan is a Pakistani men’s herbal majoon brand. The final ingredient list, product specifications and usage directions will be published before live orders open.",
  ],
  [
    "Can I pay cash on delivery?",
    "Yes. The store is being built around cash on delivery, so you can pay the courier when your parcel arrives.",
  ],
  [
    "Will the packaging be discreet?",
    "Orders are planned to ship in plain outer packaging. The product name will not appear on the outer parcel.",
  ],
  [
    "How do I use the product?",
    "Follow the directions on the final product label. Ingredients and usage instructions are awaiting confirmation; please do not use the preview packaging as guidance.",
  ],
  [
    "How can I track my order?",
    "Use the order number and mobile number from your checkout on our Track your order page.",
  ],
];
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> APNI RIWAYAT. APNA KHAYAL.
          </div>
          <h1>
            Rooted in tradition.
            <br />
            <span>Made for you.</span>
          </h1>
          <p className="urdu-hero" lang="ur" dir="rtl">
            روایت کی طاقت، آپ کے نام
          </p>
          <p className="hero-description">
            Meet Zoorvan Majoon. A traditional herbal blend for men, bringing
            familiar care to your everyday.
          </p>
          <Link className="button" href="/shop">
            Discover Zoorvan Majoon <ArrowRight size={19} />
          </Link>
          <div className="hero-note">
            <Leaf size={17} /> Pakistani roots. Thoughtfully made.
          </div>
        </div>
        <div className="hero-visual">
          <Image
            src="/images/zoorvan-product.png"
            alt="Provisional Zoorvan Majoon jar packaging on a sandstone table"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 55vw"
          />
        </div>
      </section>
      <div className="assurance-band">
        <div className="container assurance-grid">
          {[
            [Truck, "Delivered across Pakistan", "From our doorstep to yours"],
            [Bag, "Cash on delivery", "Pay when your order arrives"],
            [
              ShieldCheck,
              "Your privacy matters",
              "Plain, discreet outer packaging",
            ],
            [Leaf, "Rooted in tradition", "A familiar approach to care"],
          ].map(([Icon, title, sub]) => (
            <div key={title}>
              <Icon size={29} weight="light" />
              <span>
                <strong>{title}</strong>
                <small>{sub}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
      <section className="container section featured">
        <div className="featured-image">
          <Image
            src="/images/zoorvan-product.png"
            alt="Zoorvan Majoon herbal blend packaging concept"
            fill
            sizes="(max-width: 760px) 100vw, 45vw"
          />
          <span className="photo-caption">
            THE ZOORVAN COLLECTION · ONE SIMPLE START
          </span>
        </div>
        <div className="featured-copy">
          <p className="eyebrow">MEET YOUR EVERYDAY MAJOON</p>
          <h2>
            One jar.
            <br />A familiar tradition.
          </h2>
          <p>
            Some things don’t need reinventing. Inspired by the majoon
            tradition, Zoorvan brings a little of that familiarity into the
            everyday.
          </p>
          <div className="product-line">
            <h3>Zoorvan Majoon</h3>
            <span>Men’s herbal blend</span>
          </div>
          <Purchase compact />
          <Link className="text-link" href="/shop">
            Get to know your jar <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section id="our-story" className="story-section">
        <div className="container story-grid">
          <div className="story-mark">
            <Leaf size={62} weight="thin" />
            <span lang="ur" dir="rtl">
              اپنی مٹی،
              <br />
              اپنی روایت۔
            </span>
            <small>OUR ROOTS RUN CLOSE TO HOME</small>
          </div>
          <div>
            <h2>
              Familiar care.
              <br />
              Pakistani at heart.
            </h2>
            <p>
              For many of us, majoon is a familiar word. It belongs to
              conversations at home, to the neighbourhood herbal shop, and to
              traditions passed from one generation to another.
            </p>
            <p>
              Zoorvan starts with that connection. A Pakistani brand with a
              simple idea: make shopping for a traditional herbal product clear,
              comfortable, and convenient.
            </p>
            <Link className="text-link" href="/shop">
              Meet Zoorvan <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container section how-section">
        <h2>A simple way to order.</h2>
        <p className="section-intro">
          No complicated steps. Just the essentials.
        </p>
        <div className="how-grid">
          {[
            [
              Bag,
              "Choose your jar",
              "Add Zoorvan Majoon to your bag and select your quantity.",
            ],
            [
              MapPin,
              "Tell us where",
              "Enter your name, mobile number and delivery address.",
            ],
            [
              Package,
              "Pay on arrival",
              "We prepare your parcel. You pay when it reaches you.",
            ],
          ].map(([Icon, title, body], index) => (
            <div key={title}>
              <span className="step-number">0{index + 1}</span>
              <Icon size={29} />
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container faq-section section" id="faqs">
        <div>
          <p className="eyebrow">A FEW THINGS TO KNOW</p>
          <h2>
            Questions?
            <br />
            Let’s keep it simple.
          </h2>
          <p>Good decisions start with clear information.</p>
          <Link href="/contact" className="text-link">
            Get in touch <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="container closing">
        <Leaf size={38} weight="light" />
        <div>
          <h2>A little care goes a long way.</h2>
          <p>Start with something familiar.</p>
        </div>
        <Link href="/shop" className="button">
          Shop Zoorvan <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
