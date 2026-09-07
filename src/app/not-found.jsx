import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container section empty">
      <p className="eyebrow">404</p>
      <h1>A little off the beaten path.</h1>
      <p>We couldn’t find that page.</p>
      <Link className="button" href="/">
        Back to the shop
      </Link>
    </div>
  );
}
