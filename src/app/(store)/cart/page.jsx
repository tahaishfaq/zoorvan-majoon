import CartPage from "@/components/store/cart-page";
export const metadata = { title: "Your bag" };
export default function Cart() {
  return (
    <div className="container section">
      <p className="eyebrow">YOUR EVERYDAY CARE</p>
      <h1>Your shopping bag</h1>
      <CartPage />
    </div>
  );
}
