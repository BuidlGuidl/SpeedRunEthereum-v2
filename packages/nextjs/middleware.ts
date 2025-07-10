import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle /builders/[addressOrEns] routes
  if (pathname.startsWith("/builders/")) {
    const segments = pathname.split("/");
    if (segments.length >= 3) {
      const addressOrEns = segments[2] as string;

      // Skip if it's already a valid address
      if (isAddress(addressOrEns)) {
        return NextResponse.next();
      }

      // Check if it's an ENS name
      if (addressOrEns && (addressOrEns as string).endsWith(".eth")) {
        try {
          // Construct the full URL for the API call
          const apiUrl = new URL(`/api/users/by-ens/${addressOrEns}`, request.url);
          const response = await fetch(apiUrl.toString());

          if (response.ok) {
            const data = await response.json();
            console.log("user BY ENS", data);

            if (data.user && data.user.userAddress) {
              const canonicalUrl = new URL(`/builders/${data.user.userAddress}`, request.url);
              return NextResponse.redirect(canonicalUrl, 301); // Permanent redirect
            }
          } else {
            console.log(`API returned ${response.status} for ENS: ${addressOrEns}`);
          }
        } catch (error) {
          console.error("ENS resolution error in middleware:", error);
          // Don't redirect on error, let the page handle it
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/builders/:path*",
};
