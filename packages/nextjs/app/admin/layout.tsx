import { AccessDenied } from "./_components/AccessDenied";
import { getServerSession } from "next-auth";
import { UserRole } from "~~/services/database/config/types";
import { authOptions } from "~~/utils/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== UserRole.ADMIN) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
