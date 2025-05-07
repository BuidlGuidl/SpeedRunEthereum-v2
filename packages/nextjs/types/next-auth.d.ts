import "next-auth";
import { DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  export interface Session {
    user: {
      userAddress?: string | null;
      role?: string | null;
    };
    expires: ISODateString;
  }

  export interface User extends DefaultUser {
    role?: string | null;
    userAddress?: string | null;
  }

  export interface JWT extends DefaultJWT {
    role?: string | null;
    userAddress?: string | null;
  }
}
