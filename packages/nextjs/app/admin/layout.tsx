import { redirect } from "next/navigation";
import { SignIn } from "./_components/SignIn";
import { getServerSession } from "next-auth";
import { UserRole } from "~~/services/database/config/types";
import { authOptions } from "~~/utils/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <SignIn />;
  }

  if (session.user.role !== UserRole.ADMIN) {
    return redirect("/");
  }

  return <>{children}</>;
}
