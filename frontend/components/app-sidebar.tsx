"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import {
  Calendar,
  Home,
  Presentation,
  Settings,
} from "lucide-react"

export function AppSidebar({ user }: {
  user: {
    name: string
    email: string | null
    imageUrl: string
  }
}) {

  const pathname = usePathname()


  const items = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Collab Editor", url: "/dashboard/room", icon: Calendar },
    { title: "Connect", url: "/dashboard/connect", icon: Presentation },
    { title: "Settings", url: "/settings", icon: Settings },
  ]

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-[#080808] border-r border-white/10 flex flex-col">

      {/* LOGO */}
      <div
        className="h-16 flex items-center px-6 text-xl font-bold tracking-wide"
        style={{ fontFamily: "var(--font-bitcount)" }}
      >
        Collab AI
      </div>

      {/* NAV */}
      <nav className="flex-1 px-4 space-y-1 mt-4">

        {items.map((item) => {
          const active = pathname.startsWith(item.url)

          return (
            <Link
              key={item.url}
              href={item.url}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all

              ${active
                ? "bg-white/10 text-white border border-white/20"
                : "text-neutral-400 hover:text-white hover:bg-white/5"}`
              }
              style={{ fontFamily: "var(--font-stack)" }}
            >
              <item.icon size={18} />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* FOOTER USER */}
      <div className="p-4 border-t border-white/10 flex items-center gap-3">

        <UserButton />
        
        {user && (
          <div className="text-neutral-400 text-sm leading-tight">
            <p className="text-white font-medium">{user.name}</p>
          </div>
        )}
      </div>
    </aside>
  )
}


export default AppSidebar