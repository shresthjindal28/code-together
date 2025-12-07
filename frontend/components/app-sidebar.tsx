"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import {
  Calendar,
  Home,
  Presentation,
  Settings,
  X,
} from "lucide-react"

import { useSidebar } from "@/components/ui/sidebar"


export function AppSidebar({ user }: {
  user: {
    name: string
    email: string | null
    imageUrl: string
  }
}) {

  const pathname = usePathname()
  const { isMobile, open, setOpen, openMobile, setOpenMobile } = useSidebar()
  const isOpen = isMobile ? openMobile : open
  const closeSidebar = () => (isMobile ? setOpenMobile(false) : setOpen(false))


  const items = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Collab Editor", url: "/dashboard/room", icon: Calendar },
    { title: "Connect", url: "/dashboard/connect", icon: Presentation },
    { title: "Settings", url: "/dashboard/setting", icon: Settings },
  ]

  return (
    <>
      {isOpen && (
        <div 
          onClick={closeSidebar}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        />
      )}

      <aside 
        className={`
          w-64 h-screen fixed top-0 bg-[#080808] border-r border-white/10 flex flex-col z-50 transition-transform duration-300
          
          lg:translate-x-0 lg:static lg:border-none

          ${isOpen ? "translate-x-0 left-0" : "-translate-x-full left-0"}
        `}
      >

        <div
          className="h-16 flex items-center justify-between px-6 text-xl font-bold tracking-wide"
          style={{ fontFamily: "var(--font-bitcount)" }}
        >
          Collab AI
          <button 
            onClick={closeSidebar}
            className="lg:hidden p-1 text-white hover:bg-white/10 rounded-full transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">

          {items.map((item) => {
            const active = pathname.startsWith(item.url)

            return (
              <Link
                key={item.url}
                href={item.url}
                onClick={closeSidebar} 
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

        <div className="p-4 border-t border-white/10 flex items-center gap-3">

          <UserButton afterSignOutUrl="/sign-in" />
          
          {user && (
            <div className="text-neutral-400 text-sm leading-tight">
              <p className="text-white font-medium">{user.name}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}


export default AppSidebar