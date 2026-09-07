import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/lora/400.css";
import "@fontsource/lora/500.css";
import "@fontsource/noto-naskh-arabic/400.css";
import "./globals.css";
import { connection } from "next/server";
import Providers from "@/components/providers";
import { auth } from "@/auth";
export const metadata = {
  title: {
    default: "Zoorvan Majoon | Apni riwayat, apna khayal",
    template: "%s | Zoorvan",
  },
  description:
    "Discover Zoorvan Majoon, a Pakistani herbal brand. Shop online with cash on delivery across Pakistan.",
};
export default async function RootLayout({ children }) {
  await connection();
  const session = await auth();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
