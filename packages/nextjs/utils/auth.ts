import { cookies } from "next/headers";
import { AuthOptions, JWT, Session, User, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { type SiweMessage, parseSiweMessage, validateSiweMessage } from "viem/siwe";
import { UserRole } from "~~/services/database/config/types";
import { getUserByAddress } from "~~/services/database/repositories/users";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const providers = [
  CredentialsProvider({
    name: "Ethereum",
    credentials: {
      message: {
        label: "Message",
        type: "text",
        placeholder: "0x0",
      },
      signature: {
        label: "Signature",
        type: "text",
        placeholder: "0x0",
      },
    },
    async authorize(credentials) {
      try {
        if (!credentials?.message || !credentials?.signature) {
          return null;
        }

        const siweMessage = parseSiweMessage(credentials.message) as SiweMessage;

        const isMessageValid = validateSiweMessage({
          address: siweMessage?.address,
          message: siweMessage,
        });

        if (!isMessageValid) {
          return null;
        }

        const nextAuthUrl =
          new URL(process.env.NEXTAUTH_URL as string) ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

        if (!nextAuthUrl || siweMessage.domain !== nextAuthUrl.host) {
          return null;
        }

        const cookieStore = await cookies();
        const csrfToken = await getCsrfToken({
          req: {
            headers: {
              cookie: cookieStore.toString(),
            },
          },
        });

        if (siweMessage.nonce !== csrfToken) {
          return null;
        }

        const isSignatureValid = await publicClient.verifyMessage({
          address: siweMessage.address,
          message: credentials.message,
          signature: credentials.signature as `0x${string}`,
        });

        if (!isSignatureValid) {
          return null;
        }

        const user = await getUserByAddress(siweMessage.address);

        if (!user) {
          return null;
        }

        return { id: user.userAddress, role: user.role };
      } catch (error) {
        console.error("Authorization error:", error);
        return null;
      }
    },
  }),
];

export const authOptions: AuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.userAddress = token.sub;
      session.user.role = token.role;
      return session;
    },
  },
} as const;

export const isAdminSession = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return false;
    }

    return session.user.role === UserRole.ADMIN;
  } catch (error) {
    console.error("Error checking if user is admin:", error);
    return false;
  }
};
