import Header from "@/components/store/header";
import Footer from "@/components/store/footer";
import { StoreProvider } from "@/components/providers";
import { getStore } from "@/lib/data";

export default async function CustomerLayout({ children }) {
  const store = await getStore();
  return (
    <StoreProvider store={store}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </StoreProvider>
  );
}
