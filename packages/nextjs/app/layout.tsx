import { Space_Grotesk } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import PlausibleProvider from "next-plausible";
import AcquisitionTracker from "~~/components/AcquisitionTracker";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { SidebarProvider } from "~~/contexts/SidebarContext";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = getMetadata({
  title: "Speedrun Ethereum",
  description: "Learn Solidity development to build dapps on Ethereum with hands-on blockchain challenges.",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={spaceGrotesk.className}>
      <head>
        <PlausibleProvider domain="speedrunethereum.com" />
      </head>
      <body>
        <ThemeProvider enableSystem>
          <SidebarProvider>
            <AcquisitionTracker />
            <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
