import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { TokenView } from "@/components/TokenView";
import type { RevealState } from "@/hooks/useTokenNavigation";
import type { TokenGroup } from "@/utils/tokens";

interface TokensContainerProps {
  groups: TokenGroup[];
  revealState: RevealState;
  focusedIndex: number;
  rtl: boolean | undefined;
  cycleView: (direction: 1 | -1, reset?: boolean) => void;
  setFocusedIndex: (index: number) => void;
}

export function TokensContainer({
  groups,
  revealState,
  focusedIndex,
  cycleView,
  rtl = false,
  setFocusedIndex,
}: TokensContainerProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const focusedElement = scrollRef.current?.querySelector(
      `[data-index="${focusedIndex}"]`,
    );

    focusedElement?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [focusedIndex, groups]);

  const handleTokenClick = (globalIndex: number) => {
    if (globalIndex === focusedIndex) {
      // Tapping the focused word again advances it to the next view. This is
      // the only way to reveal anything without a keyboard.
      cycleView(1);
    } else {
      cycleView(1, true);
      setFocusedIndex(globalIndex);
    }
  };

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div ref={scrollRef} className="w-full max-h-[45vh] py-4 px-2 overflow-y-auto">
        <div className={`flex flex-col ${rtl ? "items-end" : "items-start"}`}>
          {groups.map(({ sentenceIndex, tokens }) => (
            <div
              key={sentenceIndex}
              className={`flex flex-wrap ${
                rtl ? "flex-row-reverse" : "flex-row"
              } gap-x-1.5 w-full`}
            >
              {tokens.map(({ token, globalIndex }) => (
                <button
                  key={globalIndex}
                  type="button"
                  className="mb-2 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  data-index={globalIndex}
                  aria-label={
                    token.translation
                      ? `${token.original}, meaning ${token.translation}`
                      : token.original
                  }
                  aria-pressed={globalIndex === focusedIndex}
                  onClick={() => handleTokenClick(globalIndex)}
                >
                  <TokenView
                    token={token}
                    tokenKey={globalIndex}
                    revealState={
                      globalIndex === focusedIndex ? revealState : "original"
                    }
                    isFocused={globalIndex === focusedIndex}
                  />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
