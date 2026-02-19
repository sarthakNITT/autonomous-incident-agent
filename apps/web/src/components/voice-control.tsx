"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function VoiceControl() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const router = useRouter();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.message("Listening...", {
        description: "Release to send command",
        id: "voice-status",
        duration: Infinity,
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      toast.loading("Processing audio...", { id: "voice-status" });
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      const res = await fetch("/api/voice/command", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.transcript) {
        toast.success(`Heard: "${data.transcript}"`, { id: "voice-status" });

        // Small delay to let user read transcript before action
        setTimeout(() => {
          const action = data.command_result?.action;
          if (action === "list_incidents") {
            router.push("/incidents");
            toast.success("Navigating to incidents", { id: "voice-status" });
          } else if (action === "critical_incidents") {
            router.push("/incidents?filter=critical");
            toast.success("Showing critical incidents", { id: "voice-status" });
          } else if (action === "latest_incident") {
            const id = data.command_result.incident?.id;
            if (id) {
              router.push(`/incidents#${id}`);
              toast.success("Opening latest incident", { id: "voice-status" });
            } else {
              toast.info("No incidents found", { id: "voice-status" });
            }
          } else if (action === "status_summary") {
            const { total, resolved, open } = data.command_result;
            toast.info(
              `Status: ${total} Total, ${resolved} Resolved, ${open} Open`,
              {
                duration: 5000,
                icon: "📊",
                id: "voice-status",
              },
            );
          } else if (data.command_result?.message) {
            toast.info(data.command_result.message, { id: "voice-status" });
          }
        }, 800);
      } else {
        toast.error("Could not understand audio", { id: "voice-status" });
      }
    } catch (error) {
      console.error("Voice command failed", error);
      toast.error("Voice command failed", { id: "voice-status" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      className={`rounded-full transition-all duration-300 ${isRecording ? "animate-pulse" : ""}`}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      title="Hold to Speak"
      disabled={isProcessing}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mic className={`h-4 w-4 ${isRecording ? "scale-110" : ""}`} />
      )}
    </Button>
  );
}
