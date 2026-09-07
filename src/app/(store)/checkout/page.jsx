import CheckoutPage from "@/components/store/checkout-page";
export const metadata = { title: "Checkout" };
export default function Checkout() {
  return (
    <div className="container section">
      <div className="breadcrumb">
        Bag / <strong>Checkout</strong> / Confirmation
      </div>
      <h1>Almost at your doorstep.</h1>
      <CheckoutPage />
    </div>
  );
}
