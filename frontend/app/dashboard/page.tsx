import { currentUser } from "@clerk/nextjs/server"
import DashboardPageUI from "./ui/dashboard-client"

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
    <DashboardPageUI user={safeUser} />
  )
}
