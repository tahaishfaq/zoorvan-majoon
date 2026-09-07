import Link from "next/link";
import { getStore } from "@/lib/data";
export const metadata = { title: "Contact us" };
export default async function Contact() {
  const { settings } = await getStore();
  return (
    <div className="container section narrow">
      <p className="eyebrow">HERE TO HELP</p>
      <h1>Let’s talk.</h1>
      <p>
        Questions about your order or Zoorvan Majoon? Get in touch with our
        team.
      </p>
      {settings.supportEmail ? (
        <p>
          <a className="text-link" href={`mailto:${settings.supportEmail}`}>
            {settings.supportEmail}
          </a>
        </p>
      ) : (
        <div className="notice">
          Customer support details will be published before the store opens for
          orders.
        </div>
      )}
      {settings.whatsapp && (
        <a
          className="button"
          href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat on WhatsApp
        </a>
      )}
      <h2 className="mt">Already placed an order?</h2>
      <p>
        You can check its progress using your order number and mobile number.
      </p>
      <Link className="text-link" href="/track-order">
        Track your order →
      </Link>
    </div>
  );
}
