import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Speaks a word or sentence via /api/speech.
 *
 * Synthesis takes a second or more, so "generating" and "playing" are tracked
 * separately - without that the UI cannot tell you it is working, and a slow
 * clip looks like a dead button.
 *
 * Finished audio is cached per text for the life of the page, since learners
 * replay the same word repeatedly. Only one clip plays at a time: arrowing
 * quickly through words should cut the previous one off rather than pile up.
 */
export function useSpeech() {
  const cache = useRef(new Map<string, string>());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestId = useRef(0);
  const [loadingText, setLoadingText] = useState<string | null>(null);
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
    setSpeakingText(null);

    const cached = cache.current.get(trimmed);
    // Only announce work when there is work to do - replaying a cached clip
    // should start instantly rather than flashing a spinner.
    if (!cached) setLoadingText(trimmed);

    try {
      let url = cached;

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

      // A newer request started while this one was in flight. Leave its
      // loading state alone and drop this clip.
      if (id !== requestId.current) return;

      setLoadingText(null);

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () =>
        setSpeakingText((current) => (current === trimmed ? null : current));

      setSpeakingText(trimmed);
      await audio.play();
    } catch (error) {
      console.error("Speech failed:", error);
      toast.error("Could not play audio.");
      if (id === requestId.current) {
        setLoadingText(null);
        setSpeakingText(null);
      }
    }
  }, []);

  return { speak, speakingText, loadingText };
}
