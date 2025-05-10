import { Space_Grotesk } from "next/font/google";
import AdminSiwe from "./_components/AdminSiwe";
import "@rainbow-me/rainbowkit/styles.css";
import { getServerSession } from "next-auth";
import PlausibleProvider from "next-plausible";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { authOptions } from "~~/utils/auth";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = getMetadata({
  title: "Speed Run Ethereum",
  description: "Learn how to build on Ethereum; the superpowers and the gotchas.",
});

const ScaffoldEthApp = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);
  return (
    <html suppressHydrationWarning className={spaceGrotesk.className}>
      <head>
        <PlausibleProvider domain="speedrunethereum.com" />
      </head>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>
            <AdminSiwe session={session}>{children}</AdminSiwe>
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
