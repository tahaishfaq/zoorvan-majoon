import { notFound } from "next/navigation";
import { db, databaseConfigured } from "@/lib/db";
const policies = {
  "terms-and-conditions": {
    title: "Terms & conditions",
    sections: [
      [
        "About this store",
        "Zoorvan is a Pakistani herbal product store. This website is currently a preview. Sample prices, packaging and specifications may change before launch.",
      ],
      [
        "Orders and payment",
        "Live orders are not accepted during the preview. Once enabled, checkout will display prices in Pakistani rupees and the delivery charge before an order is submitted. Cash on delivery is the planned payment method.",
      ],
      [
        "Product information",
        "Final ingredients, directions, suitability and storage information must be confirmed on the published product listing and label. Preview text or artwork should not be used as product guidance.",
      ],
      [
        "Delivery, cancellations and returns",
        "Service areas, dispatch estimates, cancellation cutoffs and return eligibility are awaiting merchant confirmation. These terms will be published before live ordering opens.",
      ],
    ],
  },
  "privacy-policy": {
    title: "Privacy policy",
    sections: [
      [
        "Information collected",
        "Account registration collects your name, email address and password. Live checkout collects contact and delivery details needed to fulfil your order. Passwords are stored as hashes.",
      ],
      [
        "How information is used",
        "Account and order information is used to manage your account, process orders and provide support. Delivery details may be shared with the courier fulfilling your order.",
      ],
      [
        "Browser storage",
        "The shopping bag is stored in your browser’s local storage. Authentication uses session cookies. Preview checkout stores its order reference and mobile number in session storage on your device; it does not submit the preview order to the store.",
      ],
      [
        "Before launch",
        "The merchant must add its legal identity, support contact, retention periods and data-rights process before publishing this policy as final.",
      ],
    ],
  },
};
export async function generateMetadata({ params }) {
  const { policy } = await params;
  return { title: policies[policy]?.title || "Page" };
}
export default async function Policy({ params }) {
  const { policy } = await params;
  const fallback = policies[policy];
  if (!fallback) notFound();
  const content = databaseConfigured
    ? await db.content.findUnique({ where: { slug: policy } })
    : null;
  return (
    <article className="container section narrow legal">
      <h1>{content?.published ? content.title : fallback.title}</h1>
      {content?.published ? (
        <div className="preserve-lines">{content.body}</div>
      ) : (
        <>
          <div className="notice">
            Draft for merchant review. Final terms will be published before live
            orders open.
          </div>
          {fallback.sections.map(([title, body]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </section>
          ))}
        </>
      )}
    </article>
  );
}
