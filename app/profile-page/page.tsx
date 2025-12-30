import ProfileHeader from "./components/profile-header";
import ProfileContent from "./components/profile-content";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutIcon } from "@/components/theme-icon";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  // Build a Request using current headers so `getUserFromRequest` can read cookies
  const rawHeaders = await headers();
  const headerObj = Object.fromEntries(Array.from(rawHeaders.entries()));

  // Derive a safe origin from Host header or env var
  const host = headerObj["host"] ?? process.env.NEXT_PUBLIC_APP_URL ?? "localhost:3000";
  const origin = host.startsWith("http") ? host : `https://${host}`;
  const req = new Request(origin, { headers: headerObj });

  let user = null;
  try {
    const userId = await getUserFromRequest(req);
    user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        created: true,
      },
    });
  } catch (e) {
    // Not authenticated — redirect to login
    redirect("/login");
  }

  return (
    <div className="container mx-auto relative space-y-6 px-4 py-10">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <ThemeToggle />
        <LogoutIcon />
      </div>
      <ProfileHeader user={user} />
      <ProfileContent user={user} />
    </div>
  );
}
