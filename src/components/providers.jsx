"use client";
import { SessionProvider } from "next-auth/react";
import { createContext, useContext } from "react";
const StoreContext = createContext(null);
export function useStore() {
  return useContext(StoreContext);
}
export default function Providers({ children, store, session }) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    </SessionProvider>
  );
}
