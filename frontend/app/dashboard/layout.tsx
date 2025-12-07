import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const safeUser = {
    id: user.id,
    name: user.fullName || user.username || "User",
    email: user.primaryEmailAddress?.emailAddress ?? null,
    imageUrl: user.imageUrl,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <div className="lg:w-68 flex-shrink-0">
          <AppSidebar user={safeUser} />
        </div>
        <main className="flex-1 lg:pl-0 pt-4 w-full">
          <div className="px-4 pb-4 lg:hidden">
            <SidebarTrigger className="border border-white/10" />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
