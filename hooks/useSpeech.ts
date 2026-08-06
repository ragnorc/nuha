import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Speaks a word or sentence via /api/speech.
 *
 * Synthesis is slow relative to a keypress and learners replay the same word
 * repeatedly, so finished audio is cached per text for the life of the page.
 * Only one clip plays at a time - arrowing quickly through words should cut the
 * previous one off rather than pile them up.
 */
export function useSpeech() {
  const cache = useRef(new Map<string, string>());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestId = useRef(0);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  useEffect(() => {
    const urls = cache.current;
    return () => {
      audioRef.current?.pause();
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const speak = useCallback(async (text: string | undefined | null) => {
    const trimmed = text?.trim();
    if (!trimmed) return;

    const id = ++requestId.current;

    audioRef.current?.pause();
    setSpeakingText(trimmed);

    try {
      let url = cache.current.get(trimmed);

      if (!url) {
        const response = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        });

        if (!response.ok) throw new Error(await response.text());

        url = URL.createObjectURL(await response.blob());
        cache.current.set(trimmed, url);
      }

      // A newer request started while this one was in flight - drop this one
      // so the audio matches whatever is focused now.
      if (id !== requestId.current) return;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () =>
        setSpeakingText((current) => (current === trimmed ? null : current));
      await audio.play();
    } catch (error) {
      console.error("Speech failed:", error);
      toast.error("Could not play audio.");
      if (id === requestId.current) setSpeakingText(null);
    }
  }, []);

  return { speak, speakingText };
}
