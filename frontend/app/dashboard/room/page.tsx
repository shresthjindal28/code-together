"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export default function RoomManager() {
  const router = useRouter();
  const [createName, setCreateName] = useState("");
  const [joinValue, setJoinValue] = useState("");

  const makeId = (name: string) => {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const suffix = Math.random().toString(36).slice(2, 6);
    return (base || "room") + "-" + suffix;
  };

  const handleCreate = () => {
    const id = makeId(createName);
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
            <Input placeholder="Room name…" value={createName} onChange={(e)=>setCreateName(e.target.value)} />
            <Button className="mt-2 w-full" onClick={handleCreate}>Create</Button>
          </div>

          <Separator/>

          <div>
            <Input placeholder="Room link / id…" value={joinValue} onChange={(e)=>setJoinValue(e.target.value)} />
            <Button variant="outline" className="mt-2 w-full" onClick={handleJoin}>Join</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}