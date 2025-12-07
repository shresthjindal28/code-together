"use client"

import Image from "next/image"
import { StatCard } from "@/components/dashboard/StatCard"
import { DashboardCard } from "@/components/dashboard/DashboardCard"
import { SectionHeading } from "@/components/dashboard/SectionHeading"

export default function DashboardPageUI({
  user,
}: {
  user: {
    id: string
    name: string
    email: string | null
    imageUrl: string
  }
}) {
  return (
    <div className="min-h-screen text-white w-full lg:w-[82vw] flex justify-center flex-col px-4 sm:px-8">

      <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0b0b0b] border border-white/10">

        <Image
          src={user.imageUrl}
          width={50}
          height={50}
          alt="profile"
          className="rounded-full"
        />

        <div>
          <h2 style={{ fontFamily:"var(--font-science)" }} className="text-xl">
            {user.name}
          </h2>
          <p className="text-neutral-400 text-sm">{user.email}</p>
        </div>
      </div>



      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Seasons" value="6" />
        <StatCard label="Active Collabs" value="4" />
        <StatCard label="Members" value="140+" />
      </div>



      {/* ---------- Recent Activity ----------- */}
      <SectionHeading title="Recent Activity" />

      <DashboardCard>
        <div className="space-y-2 text-neutral-300">
          <p>• User Signup</p>
          <p>• New Collaboration Created</p>
          <p>• Team Invitation Accepted</p>
        </div>
      </DashboardCard>



      {/* ---------- Upcoming Season ----------- */}
      <SectionHeading title="Next Season" />

      <DashboardCard>
        <div className="text-neutral-300">
          Season 7 — Coming soon…
        </div>
      </DashboardCard>
    </div>
  )
}
