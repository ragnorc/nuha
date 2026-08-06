import { motion, AnimatePresence } from "framer-motion";
import { PartialToken } from "@/app/api/generate/schema";
import type { RevealState } from "@/hooks/useTokenNavigation";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const BADGES: Record<Exclude<RevealState, "original">, string> = {
  transliteration: "TL",
  part_of_speech: "POS",
  translation: "TR",
};

interface TokenViewProps {
  token: PartialToken;
  revealState: RevealState;
  isFocused: boolean;
  /** Identity of the token, so moving between words remounts the text. */
  tokenKey: number;
}

export function TokenView({
  token,
  revealState,
  isFocused,
  tokenKey,
}: TokenViewProps) {
  const isOriginal = revealState === "original";
  const revealed = isOriginal ? token.original : token[revealState];

  // In sticky mode the reveal carries across words, so we land on tokens that
  // have nothing for the current view - Latin-script words have no
  // transliteration, and mid-stream a field may simply not have arrived yet.
  // Fall back to the original word rather than rendering an empty chip.
  const isUnavailable = !isOriginal && !revealed;
  const content = isUnavailable ? token.original : revealed;
  const badge = isOriginal || isUnavailable ? undefined : BADGES[revealState];
  const isLoading = isUnavailable;
  return (
    <motion.div
      layout
      className={`relative flex items-center px-2.5 h-[1.7rem] rounded-lg text-center overflow-hidden ${
        isFocused
          ? "bg-white text-black shadow-[0px_0px_1px_rgba(0,0,0,0.04),0px_1px_1px_rgba(0,0,0,0.04),0px_3px_3px_rgba(0,0,0,0.04),0px_6px_6px_rgba(0,0,0,0.04),0px_12px_12px_rgba(0,0,0,0.04),0px_24px_24px_rgba(0,0,0,0.04)]"
          : "bg-zinc-200 text-zinc-500"
      } ${isLoading ? "opacity-50" : ""}`}
      initial={false}
      animate={{ width: "auto" }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <AnimatePresence mode="wait">
        {/*
          Keyed on the token as well as the view. In sticky mode the view stays
          put while you move between words, so keying on `revealState` alone
          left React reconciling the character spans instead of remounting:
          letters at shared indices froze in place while only the extra ones
          staggered in. Including the token forces a clean exit/enter per word.
        */}
        <AnimatedText
          key={`${tokenKey}:${revealState}`}
          text={content ?? ""}
          className="inline-block whitespace-nowrap"
          isOriginal={isOriginal}
          badge={badge}
        />
      </AnimatePresence>
    </motion.div>
  );
}

interface AnimatedTextProps {
  text: string;
  className?: string;
  isOriginal: boolean;
  badge?: string;
}

function AnimatedText({
  text,
  className,
  isOriginal,
  badge,
}: AnimatedTextProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.1 }}
      className={`${className} ${inter.className} text-sm`}
    >
      {badge && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="mr-2 -ml-1.5 px-2 py-[0.18rem] text-xs bg-black text-white rounded-md inline-block"
        >
          {badge}
        </motion.span>
      )}
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Capped: at a flat 0.05s per character a longer translation took
          // most of a second to finish appearing, which reads as lag when
          // you are arrowing through words rather than waiting on a stream.
          transition={{ delay: Math.min(index * 0.03, 0.35) }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
