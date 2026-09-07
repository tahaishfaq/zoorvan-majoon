"use client";
import { SessionProvider } from "next-auth/react";
import { createContext, useContext } from "react";
const StoreContext = createContext(null);
export function useStore() {
  return useContext(StoreContext);
}
export function StoreProvider({ children, store }) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}
export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}
