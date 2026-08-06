import { useState, useCallback } from "react";
import { useHotkeys } from "@/hooks/useHotkey";
import type { FlatToken } from "@/utils/tokens";

export type RevealState =
  | "original"
  | "transliteration"
  | "part_of_speech"
  | "translation";

const STATES: RevealState[] = [
  "original",
  "transliteration",
  "part_of_speech",
  "translation",
];

export function useTokenNavigation(
  flatTokens: FlatToken[],
  rtl: boolean | undefined,
) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [revealState, setRevealState] = useState<RevealState>("original");
  // When sticky, moving between words keeps whatever you were revealing.
  // Without it you have to re-press the key on every single word, which makes
  // reading a whole passage with translations on unusable.
  const [sticky, setSticky] = useState<boolean>(false);

  const totalTokens = flatTokens.length;

  const navigate = useCallback(
    (direction: 1 | -1) => {
      setFocusedIndex((prev) => {
        const newIndex = prev + (rtl ? -direction : direction);
        return newIndex >= 0 && newIndex < totalTokens ? newIndex : prev;
      });

      if (!sticky) setRevealState("original");
    },
    [rtl, totalTokens, sticky],
  );

  const toggleState = useCallback(
    (state: RevealState) => {
      const currentToken = flatTokens[focusedIndex]?.token;
      if (currentToken && currentToken[state]) {
        setRevealState((prev) => (prev === state ? "original" : state));
      }
    },
    [flatTokens, focusedIndex],
  );

  const cycleView = useCallback(
    (direction: 1 | -1, reset = false) => {
      const currentToken = flatTokens[focusedIndex]?.token;

      setRevealState((prev) => {
        let currentIndex = reset ? 0 : STATES.indexOf(prev);

        for (let i = 0; i < STATES.length; i++) {
          const newIndex =
            (currentIndex + direction + STATES.length) % STATES.length;
          const newState = STATES[newIndex];

          // Skip states this token has nothing to show for - either the
          // language has no transliteration, or it hasn't streamed in yet.
          if (newState === "original" || currentToken?.[newState]) {
            return newState;
          }

          currentIndex = newIndex;
        }

        return prev;
      });
    },
    [flatTokens, focusedIndex],
  );

  useHotkeys("ArrowLeft", () => navigate(-1), [navigate]);
  useHotkeys("ArrowRight", () => navigate(1), [navigate]);
  useHotkeys("ArrowDown", () => cycleView(1), [cycleView]);
  useHotkeys("ArrowUp", () => cycleView(-1), [cycleView]);
  useHotkeys("T", () => toggleState("transliteration"), [toggleState]);
  useHotkeys("R", () => toggleState("translation"), [toggleState]);
  useHotkeys("P", () => toggleState("part_of_speech"), [toggleState]);
  useHotkeys("S", () => setSticky((value) => !value), []);

  return {
    focusedIndex,
    setFocusedIndex,
    revealState,
    setRevealState,
    cycleView,
    sticky,
    setSticky,
  };
}
