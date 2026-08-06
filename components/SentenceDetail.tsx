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
  loadingText: string | null;
  rtl: boolean;
}

/**
 * Speaker control with three states: idle, generating, playing.
 *
 * Synthesis can take a few seconds, so generating gets a spinner rather than
 * the same pulse as playback - otherwise there is no way to tell a slow clip
 * from a broken button.
 */
function SpeakButton({
  text,
  label,
  speakingText,
  loadingText,
  onSpeak,
  className = "",
}: {
  text: string | undefined | null;
  label: string;
  speakingText: string | null;
  loadingText: string | null;
  onSpeak: (text: string | undefined | null) => void;
  className?: string;
}) {
  const trimmed = text?.trim();
  const isLoading = !!trimmed && loadingText === trimmed;
  const isSpeaking = !!trimmed && speakingText === trimmed;

  return (
    <button
      type="button"
      onClick={() => onSpeak(text)}
      disabled={!trimmed || isLoading}
      aria-label={
        isLoading ? `Generating audio for ${label}` : `Read ${label} aloud`
      }
      aria-busy={isLoading}
      className={`shrink-0 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 disabled:hover:bg-transparent disabled:opacity-60 transition-colors ${className}`}
    >
      {isLoading ? (
        <span className="block h-[1em] w-[1em] animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <FaVolumeHigh className={isSpeaking ? "animate-pulse" : ""} />
      )}
    </button>
  );
}

export function SentenceDetail({
  sentence,
  focusedToken,
  roles,
  showNotes,
  onToggleNotes,
  onSpeak,
  speakingText,
  loadingText,
  rtl,
}: SentenceDetailProps) {
  if (!sentence) return null;

  const notes = sentence.grammatical_notes?.filter(Boolean) ?? [];
  const original = sentence.original_sentence;

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
          <SpeakButton
            text={original}
            label="this sentence"
            speakingText={speakingText}
            loadingText={loadingText}
            onSpeak={onSpeak}
            className="mt-0.5 p-2"
          />

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
            <SpeakButton
              text={focusedToken.original}
              label={focusedToken.original ?? "this word"}
              speakingText={speakingText}
              loadingText={loadingText}
              onSpeak={onSpeak}
              className="p-1"
            />
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
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {/* Capped so a talkative sentence cannot grow the card past
                      the viewport and push the reading column off screen. */}
                  <ul className="max-h-40 overflow-y-auto pr-1">
                    {notes.map((note, index) => (
                      <li
                        key={index}
                        className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
