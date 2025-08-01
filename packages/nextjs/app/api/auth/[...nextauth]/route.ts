import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authOptions, providers } from "~~/utils/auth";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
async function auth(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  const { searchParams } = new URL(req.url as string);
  const isDefaultSigninPage = searchParams.get("nextauth")?.includes("signin");

  if (isDefaultSigninPage) {
    providers.pop();
  }

  return await NextAuth(req, context, authOptions);
}

export { auth as GET, auth as POST };
