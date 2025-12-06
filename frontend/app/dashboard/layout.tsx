import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const safeUser = {
    id: user.id,
    name: user.fullName || user.username || "User",
    email: user.primaryEmailAddress?.emailAddress ?? null,
    imageUrl: user.imageUrl,
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar user={safeUser} />
        <main className="pl-68 pt-8 flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
