import { currentUser } from "@clerk/nextjs/server"
import DashboardPageUI from "./ui/dashboard-client"
import { AppSidebar } from "@/components/app-sidebar"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) return <div>Please sign in</div>

  const safeUser = {
    id: user.id,
    name: user.fullName || user.username || "User",
    email: user.primaryEmailAddress?.emailAddress || null,
    imageUrl: user.imageUrl,
  }

  return (
<div className="flex">
   <AppSidebar user={safeUser} />

   <div className="flex-1 pl-64">
      <DashboardPageUI user={safeUser} />
   </div>
</div>
  )
}
