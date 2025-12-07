"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { user } = useUser();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);

  if (!user) return <div>Loading...</div>;

  const saveChanges = async () => {
    setLoading(true);
    await user.update({
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ").slice(1).join(" "),
      username: username,
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full lg:w-[80vw] px-4 sm:px-6 lg:px-10 bg-gradient-to-br from-[#020316] via-[#05030f] to-[#020204] text-white">
      <div className="max-w-3xl mx-auto space-y-12">

        <div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-science)" }}>
            Settings
          </h1>
          <p className="text-neutral-400 mt-2">
            Manage your account and preferences.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-6">

          <div className="flex items-center gap-4">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-20 h-20", } }} />

            <div className="text-sm text-neutral-400 leading-relaxed">
              Click the avatar to edit.
            </div>
          </div>

          <Separator />

          <div className="space-y-4">

            <div>
              <label className="text-sm text-neutral-400">Full Name</label>
              <Input
                className="mt-1 bg-neutral-900 text-white border-white/10"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400">Username</label>
              <Input
                className="mt-1 bg-neutral-900 text-white border-white/10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <Button
              onClick={saveChanges}
              className="mt-2"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>


        <div className="p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-stack)" }}>
              Appearance
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <span>Dark mode</span>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <span>System theme</span>
            <Switch />
          </div>
        </div>


        <div className="p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-6">
          <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-stack)" }}>
            Account
          </h2>

          <Button variant="destructive">Logout</Button>

          <Button variant="outline" className="border-red-500 text-red-500">
            Delete Account
          </Button>
        </div>

      </div>
    </div>
  );
}
