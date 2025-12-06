"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createRoom } from "@/app/actions/createRoom";

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
    <div className="flex justify-center items-center min-h-screen p-4 w-[80vw]">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Room Manager</CardTitle>
          <CardDescription>Create a room or join existing.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <Input
              placeholder="Room name…"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
            <Button onClick={handleCreate} className="mt-2 w-full">
              Create
            </Button>
          </div>

          <Separator />

          <div>
            <Input
              placeholder="Room link / id…"
              value={joinValue}
              onChange={(e) => setJoinValue(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={handleJoin}
              className="mt-2 w-full"
            >
              Join
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
