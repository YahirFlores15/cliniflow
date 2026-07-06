import { getCurrentSession, getHomePathForRole } from "@/server/auth/session";
import { redirect } from "next/navigation";


export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  redirect(getHomePathForRole(session.user.role));
}