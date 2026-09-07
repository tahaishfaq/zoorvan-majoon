import { TrackOrder } from "@/components/store/order-pages";
export const metadata = { title: "Track your order" };
export default function Page() {
  return (
    <div className="container section">
      <TrackOrder />
    </div>
  );
}
