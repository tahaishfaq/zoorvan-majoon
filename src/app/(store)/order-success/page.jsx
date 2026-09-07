import { OrderSuccess } from "@/components/store/order-pages";
export const metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <div className="container section">
      <OrderSuccess />
    </div>
  );
}
