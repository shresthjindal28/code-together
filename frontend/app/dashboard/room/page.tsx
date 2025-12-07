"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createRoom } from "@/app/actions/createRoom";

import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function RoomManager() {
  const router = useRouter();
  const { user } = useUser();

  const [createName, setCreateName] = useState("");
  const [joinValue, setJoinValue] = useState("");

  const handleCreate = async () => {
    if (!user) return;
    const id = await createRoom(createName || "room", user.id);
    router.push(`/dashboard/room/${id}`);
  };

  const handleJoin = () => {
    const value = joinValue.trim();
    if (!value) return;
    const parts = value.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    router.push(`/dashboard/room/${id}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-[80vw] bg-[#02030e] p-4">

      <Card className="w-[420px] bg-[#090b1a]/60 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_#020614] rounded-2xl transition hover:shadow-[0_0_60px_rgba(50,50,255,0.3)]">
        <CardHeader>
          <CardTitle
            className="text-3xl font-semibold tracking-wide"
            style={{ fontFamily: "var(--font-science)" }}
          >
            Manage Rooms
          </CardTitle>

          <CardDescription
            className="text-sm opacity-80 tracking-wider"
            style={{ fontFamily: "var(--font-bitcount)" }}
          >
            Create a new room or join an existing one
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* CREATE */}
          <div className="space-y-2">
            <Input
              className="bg-[#0e1128] border-white/20 focus-visible:ring-blue-500"
              placeholder="Room name…"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              style={{ fontFamily: "var(--font-stack)" }}
            />
            <Button
              onClick={handleCreate}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 shadow-lg hover:scale-[1.02] transition"
              style={{ fontFamily: "var(--font-stack)" }}
            >
              Create Room
            </Button>
          </div>

          <Separator className="bg-white/20" />

          {/* JOIN */}
          <div className="space-y-2">
            <Input
              className="bg-[#0e1128] border-white/20 focus-visible:ring-purple-500"
              placeholder="Room link or ID…"
              value={joinValue}
              onChange={(e) => setJoinValue(e.target.value)}
              style={{ fontFamily: "var(--font-stack)" }}
            />

            <Button
              variant="outline"
              onClick={handleJoin}
              className="w-full h-11 rounded-xl border-blue-500 text-blue-300 hover:bg-blue-500/10 hover:text-blue-100 shadow hover:scale-[1.02] transition"
              style={{ fontFamily: "var(--font-stack)" }}
            >
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
