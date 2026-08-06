import { motion, AnimatePresence } from "framer-motion";
import { FaVolumeHigh, FaChevronDown } from "react-icons/fa6";
import type { PartialSentence, PartialToken } from "@/app/api/generate/schema";

interface SentenceDetailProps {
  sentence: PartialSentence | undefined;
  focusedToken: PartialToken | undefined;
  roles: string[];
  showNotes: boolean;
  onToggleNotes: () => void;
  onSpeak: (text: string | undefined | null) => void;
  speakingText: string | null;
  rtl: boolean;
}

export function SentenceDetail({
  sentence,
  focusedToken,
  roles,
  showNotes,
  onToggleNotes,
  onSpeak,
  speakingText,
  rtl,
}: SentenceDetailProps) {
  if (!sentence) return null;

  const notes = sentence.grammatical_notes?.filter(Boolean) ?? [];
  const original = sentence.original_sentence;
  const isSpeaking = !!original && speakingText === original.trim();

  // The model returns "" for languages that don't need it, so only show a
  // transliteration line when there is genuinely something to read.
  const transliteration = sentence.transliteration?.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-3xl mx-auto px-2"
    >
      <div className="rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 shadow-[0px_0px_1px_rgba(0,0,0,0.04),0px_1px_1px_rgba(0,0,0,0.04),0px_3px_3px_rgba(0,0,0,0.04),0px_6px_6px_rgba(0,0,0,0.04)]">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onSpeak(original)}
            disabled={!original}
            aria-label="Read this sentence aloud"
            className="mt-0.5 shrink-0 rounded-full p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 disabled:opacity-30 transition-colors"
          >
            <FaVolumeHigh className={isSpeaking ? "animate-pulse" : ""} />
          </button>

          <div className="min-w-0 flex-1" dir={rtl ? "rtl" : "ltr"}>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">
              {sentence.translation}
            </p>
            {transliteration && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {transliteration}
              </p>
            )}
          </div>
        </div>

        {focusedToken?.original && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {focusedToken.original}
            </span>
            {focusedToken.part_of_speech && (
              <span>· {focusedToken.part_of_speech}</span>
            )}
            {roles.map((role) => (
              <span
                key={role}
                className="rounded-md bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5"
              >
                {role}
              </span>
            ))}
            <button
              type="button"
              onClick={() => onSpeak(focusedToken.original)}
              aria-label={`Read ${focusedToken.original} aloud`}
              className="rounded-full p-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <FaVolumeHigh
                className={
                  speakingText === focusedToken.original?.trim()
                    ? "animate-pulse"
                    : ""
                }
              />
            </button>
          </div>
        )}

        {notes.length > 0 && (
          <div className="mt-3 border-t border-zinc-100 dark:border-zinc-700 pt-2">
            <button
              type="button"
              onClick={onToggleNotes}
              aria-expanded={showNotes}
              className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <FaChevronDown
                className={`transition-transform duration-200 ${
                  showNotes ? "rotate-180" : ""
                }`}
                size={10}
              />
              {notes.length} grammar {notes.length === 1 ? "note" : "notes"}
            </button>

            <AnimatePresence initial={false}>
              {showNotes && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {notes.map((note, index) => (
                    <li
                      key={index}
                      className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300"
                    >
                      {note}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
