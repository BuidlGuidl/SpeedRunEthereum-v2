"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { GetSiweMessageOptions, RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider, useAccount } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useUser } from "~~/hooks/useUser";
import { UserRole } from "~~/services/database/config/types";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className={`flex flex-col min-h-screen `}>
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to SpeedRunEthereum",
});

const RainbowKitSiweProvider = ({ children }: { children: React.ReactNode }) => {
  const { address: connectedAddress } = useAccount();
  const { data: user } = useUser(connectedAddress);
  const isRoleAdmin = user?.role === UserRole.ADMIN;

  return (
    <RainbowKitSiweNextAuthProvider enabled={isRoleAdmin} getSiweMessageOptions={getSiweMessageOptions}>
      {children}
    </RainbowKitSiweNextAuthProvider>
  );
};

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ProgressBar height="3px" color="#2299dd" />
          <RainbowKitSiweProvider>
            <RainbowKitProvider
              avatar={BlockieAvatar}
              theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
            >
              <ScaffoldEthApp>{children}</ScaffoldEthApp>
            </RainbowKitProvider>
          </RainbowKitSiweProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
};
