"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { joinCall, leaveCall, endRoom } from "@/app/actions/Callactions";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

import { Lobby } from "@/components/Lobby";
import { CallArea } from "@/components/CallArea";
import { SidePanels } from "@/components/SidePanels";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  transports: ["websocket"],
});

export type Participant = {
  id: string;
  name: string;
  is_host: boolean;
};

export type Stage = "name" | "waiting" | "in-call";

export type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  self: boolean;
  time: string;
};

export default function CallRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const localVideo = useRef<HTMLVideoElement | null>(null);
  const remoteVideo = useRef<HTMLVideoElement | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const screenStream = useRef<MediaStream | null>(null);

  const isHostRef = useRef(false);
  const nameRef = useRef("");

  const [stage, setStage] = useState<Stage>("name");
  const [displayName, setDisplayName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pendingRequests, setPendingRequests] = useState<
    { name: string; requesterSocketId: string }[]
  >([]);
  const [inCall, setInCall] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const fullRoomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/connect/${roomId}`
      : "";

  const [copied, setCopied] = useState(false);

  function copyShare() {
    navigator.clipboard.writeText(fullRoomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  async function startLocalVideo() {
    if (localStream.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream.current = stream;
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }
    } catch (err) {
      console.error("getUserMedia error", err);
      alert("Cannot access camera/microphone. Check permissions.");
    }
  }

  function setupPeerConnectionAsCaller() {
    pc.current = new RTCPeerConnection();

    localStream.current?.getTracks().forEach((track) => {
      pc.current?.addTrack(track, localStream.current!);
    });

    pc.current.ontrack = (event) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
        remoteVideo.current.play().catch(() => {});
      }
    };

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };
  }

  function setupListeners() {
    socket.on("call-offer", async ({ offer }) => {
      if (!pc.current) {
        pc.current = new RTCPeerConnection();
        localStream.current
          ?.getTracks()
          .forEach((track) =>
            pc.current?.addTrack(track, localStream.current!)
          );
        pc.current.ontrack = (event) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = event.streams[0];
            remoteVideo.current.play().catch(() => {});
          }
        };
        pc.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              roomId,
              candidate: event.candidate,
            });
          }
        };
      }

      if (
        pc.current.signalingState !== "stable" &&
        pc.current.signalingState !== "have-local-offer"
      ) {
        console.warn(
          "Ignoring duplicated OFFER, state=",
          pc.current.signalingState
        );
      } else {
        await pc.current.setRemoteDescription(offer);
      }

      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("call-answer", { roomId, answer });
      setInCall(true);
    });

    socket.on("call-answer", async ({ answer }) => {
      if (
        pc.current?.signalingState !== "have-local-offer" &&
        pc.current?.signalingState !== "have-remote-offer"
      ) {
        console.warn(
          "Ignoring duplicated ANSWER, state=",
          pc.current?.signalingState
        );
      } else {
        await pc.current?.setRemoteDescription(answer);
      }

      setInCall(true);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pc.current?.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });

    socket.on("end-call", async () => {
      setInCall(false);
      pc.current?.close();
      pc.current = null;
      if (remoteVideo.current) remoteVideo.current.srcObject = null;
      router.push("/dashboard/connect");
    });

    socket.on(
      "call-join-request",
      (payload: {
        roomId: string;
        name: string;
        requesterSocketId: string;
      }) => {
        if (!isHostRef.current) return;

        const audio = new Audio("/sounds/alert.wav");
        audio.play().catch(() => {});

        setPendingRequests((prev) => [
          ...prev,
          { name: payload.name, requesterSocketId: payload.requesterSocketId },
        ]);
      }
    );

    socket.on(
      "call-join-response",
      async (payload: { approved: boolean; roomId: string }) => {
        if (payload.roomId !== roomId) return;
        if (!payload.approved) {
          setStage("name");
          alert("Host denied your request to join.");
          return;
        }

        const id = await joinCall(
          roomId,
          nameRef.current || displayName,
          false
        );
        setParticipantId(id);
        await startLocalVideo();
        socket.emit("join-room", {
          roomId,
          user: {
            id,
            name: nameRef.current || displayName,
            color: "blue",
          },
        });
        setStage("in-call");
      }
    );

    socket.on(
      "call-chat",
      (payload: { roomId: string; name: string; text: string }) => {
        if (payload.roomId !== roomId) return;
        const msg: ChatMessage = {
          id: `${Date.now()}-${Math.random()}`,
          sender: payload.name,
          text: payload.text,
          self: false,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChatMessages((prev) => [...prev, msg]);
      }
    );
  }

  function askToJoin() {
    if (!displayName.trim()) return;
    setStage("waiting");
    nameRef.current = displayName.trim();

    socket.emit("call-join-request", {
      roomId,
      name: displayName.trim(),
      requesterSocketId: socket.id,
    });

    // store session as guest
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "callSession",
        JSON.stringify({
          displayName,
          role: "guest",
          roomId,
        })
      );
    }
  }

  async function joinAsHost() {
    if (!displayName.trim()) return;
    setIsHost(true);
    isHostRef.current = true;
    nameRef.current = displayName.trim();

    const id = await joinCall(roomId, displayName.trim(), true);
    setParticipantId(id);

    await startLocalVideo();

    socket.emit("join-room", {
      roomId,
      user: {
        id,
        name: displayName.trim(),
        color: "green",
        isOwner: true,
      },
    });

    // store session as host
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "callSession",
        JSON.stringify({
          displayName,
          role: "host",
          roomId,
        })
      );
    }

    setStage("in-call");
  }

  function acceptRequest(requesterSocketId: string) {
    setPendingRequests((prev) =>
      prev.filter((r) => r.requesterSocketId !== requesterSocketId)
    );
    socket.emit("call-join-response", {
      roomId,
      requesterSocketId,
      approved: true,
    });
  }

  function denyRequest(requesterSocketId: string) {
    setPendingRequests((prev) =>
      prev.filter((r) => r.requesterSocketId !== requesterSocketId)
    );
    socket.emit("call-join-response", {
      roomId,
      requesterSocketId,
      approved: false,
    });
  }

  async function startCall() {
    if (inCall) return;
    await startLocalVideo();
    setupPeerConnectionAsCaller();
    const offer = await pc.current!.createOffer();
    await pc.current!.setLocalDescription(offer);
    socket.emit("call-offer", { roomId, offer });
    setInCall(true);
  }

  async function handleEndCall() {
    if (isEnding) return;
    setIsEnding(true);

    if (participantId) {
      await leaveCall(participantId);
    }

    if (isHostRef.current) {
      await endRoom(roomId);
      socket.emit("end-call", { roomId });
    }

    pc.current?.close();
    pc.current = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;
    if (localVideo.current) localVideo.current.srcObject = null;
    localStream.current?.getTracks().forEach((t) => t.stop());
    localStream.current = null;
    screenStream.current?.getTracks().forEach((t) => t.stop());
    screenStream.current = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("callSession");
    }

    router.push("/dashboard/connect");
  }

  function toggleMic() {
    if (!localStream.current) return;
    const next = !isMicOn;
    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setIsMicOn(next);
  }

  function toggleCamera() {
    if (!localStream.current) return;
    const next = !isCamOn;
    localStream.current.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setIsCamOn(next);
  }

  async function toggleScreenShare() {
    if (!pc.current) {
      alert("You must be in a call to share your screen.");
      return;
    }

    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStream.current = stream;
        const screenTrack = stream.getVideoTracks()[0];
        const sender = pc.current
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
        }
        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }
        setIsScreenSharing(true);
        screenTrack.onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        console.error("Screen share error", err);
      }
    } else {
      await stopScreenShare();
    }
  }

  async function stopScreenShare() {
    if (!pc.current) return;
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((t) => t.stop());
      screenStream.current = null;
    }
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      const sender = pc.current
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
      if (localVideo.current) {
        localVideo.current.srcObject = localStream.current;
      }
    }
    setIsScreenSharing(false);
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    const name = displayName || "You";
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      sender: name,
      text,
      self: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, msg]);
    socket.emit("call-chat", {
      roomId,
      name,
      text,
    });
    setChatInput("");
  }

  // --- sync refs ---
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    nameRef.current = displayName;
  }, [displayName]);

  // --- socket listeners ---
  useEffect(() => {
    setupListeners();

    return () => {
      socket.off("call-offer");
      socket.off("call-answer");
      socket.off("ice-candidate");
      socket.off("end-call");
      socket.off("call-join-request");
      socket.off("call-join-response");
      socket.off("call-chat");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // --- participants from Supabase (with dedupe) ---
  useEffect(() => {
    async function loadParticipants() {
      const { data } = await supabaseBrowser
        .from("call_participants")
        .select("id,name,is_host,in_call")
        .eq("call_id", roomId)
        .eq("in_call", true);

      const list = (data as Participant[]) ?? [];

      // dedupe by name so you don't see multiple "shresth Host"
      const uniqueByName: Record<string, Participant> = {};
      for (const p of list) {
        uniqueByName[p.name] = p;
      }

      setParticipants(Object.values(uniqueByName));
    }

    loadParticipants();

    const channel = supabaseBrowser
      .channel(`call-participants-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "call_participants",
          filter: `call_id=eq.${roomId}`,
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [roomId]);

  // --- restore video after stage change ---
  useEffect(() => {
    if (stage === "in-call" && localStream.current && localVideo.current) {
      localVideo.current.srcObject = localStream.current;
    }
  }, [stage]);

  // --- auto scroll chat ---
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const isLobby = stage === "name" || stage === "waiting";

  // --- warn on refresh / close while in call ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: BeforeUnloadEvent) => {
      if (!inCall) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [inCall]);

  // --- try to restore session on refresh ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("callSession");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {
        displayName: string;
        role: "host" | "guest";
        roomId: string;
      };

      if (parsed.roomId !== roomId) return;

      setDisplayName(parsed.displayName);
      nameRef.current = parsed.displayName;

      if (parsed.role === "host") {
        setIsHost(true);
        isHostRef.current = true;
      }

      setStage("in-call");
      startLocalVideo();

      socket.emit("join-room", {
        roomId,
        user: {
          id: participantId, 
          name: parsed.displayName,
          color: parsed.role === "host" ? "green" : "blue",
          isOwner: parsed.role === "host",
        },
      });
    } catch {
    }
  }, [roomId, participantId]);

  useEffect(() => {
    return () => {
      if (participantId && !isEnding) {
        leaveCall(participantId);
      }
    };
  }, [participantId, isEnding]);

  return (
     <div className="h-screen w-full bg-black text-white grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-2 p-3">
      
      <div className="flex flex-col rounded-xl border border-white/20 bg-white/[0.02] overflow-hidden">
        
        {!isLobby && (
          <div className="px-3 py-2 bg-white/[0.03] border-b border-white/10 text-sm flex justify-between">
            <span className="truncate opacity-70">{fullRoomUrl}</span>
            <button
              onClick={() => navigator.clipboard.writeText(fullRoomUrl)}
              className="bg-white text-black rounded px-3 py-1"
            >
              Copy
            </button>
          </div>
        )}

        {isLobby ? (
          <Lobby
            stage={stage}
            displayName={displayName}
            setDisplayName={setDisplayName}
            onJoinAsHost={joinAsHost}
            onAskToJoin={askToJoin}
          />
        ) : (
          <CallArea
            localVideo={localVideo}
            remoteVideo={remoteVideo}
            isScreenSharing={isScreenSharing}
            isMicOn={isMicOn}
            isCamOn={isCamOn}
            inCall={inCall}
            isHost={isHost}
            pendingRequests={pendingRequests}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={toggleScreenShare}
            onEndCall={handleEndCall}
            onStartCall={startCall}
            onAcceptRequest={acceptRequest}
            onDenyRequest={denyRequest}
          />
        )}
      </div>

      <SidePanels
        participants={participants}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendChat={sendChat}
        chatEndRef={chatEndRef}
      />
    </div>
  );
}
