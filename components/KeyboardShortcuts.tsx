import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";
import { FaKeyboard, FaXmark } from "react-icons/fa6";
import { useHotkeys } from "@/hooks/useHotkey";

/**
 * Collapsed to a button by default.
 *
 * As a permanently pinned card this sat in the same corner the sentence detail
 * grows into, so expanding the grammar notes ran the two into each other on
 * anything narrower than a very wide window. Making it opt-in means the reading
 * column can use the full width at any size.
 */
export function KeyboardShortcuts({ sticky = false }: { sticky?: boolean }) {
  const [open, setOpen] = useState(false);

  useHotkeys("?", () => setOpen((value) => !value), []);

  return (
    <div className="fixed bottom-8 right-10 z-20 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="max-h-[70vh] overflow-y-auto rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur px-4 py-3 shadow-[0px_0px_1px_rgba(0,0,0,0.06),0px_2px_4px_rgba(0,0,0,0.06),0px_8px_16px_rgba(0,0,0,0.06)]"
          >
            <div className="flex flex-col gap-2">
              <ShortcutKey label="T" description="Toggle Transliteration" />
              <ShortcutKey label="R" description="Toggle Translation" />
              <ShortcutKey label="P" description="Toggle Part of Speech" />
              <ShortcutKey
                label="S"
                description={sticky ? "Keep Reveal: on" : "Keep Reveal: off"}
                highlighted={sticky}
              />
              <ShortcutKey label="N" description="Toggle Grammar Notes" />
              <ShortcutKey label="A" description="Speak Word" />
              <div className="flex items-center">
                <ShortcutKey label="⇧" />
                <ShortcutKey label="A" className="ml-1" />
                <Description>Speak Sentence</Description>
              </div>
              <div className="flex items-center">
                <ShortcutKey icon={<FaArrowLeft />} />
                <ShortcutKey icon={<FaArrowRight />} className="ml-1" />
                <Description>Navigate Words</Description>
              </div>
              <div className="flex items-center">
                <ShortcutKey icon={<FaArrowUp />} />
                <ShortcutKey icon={<FaArrowDown />} className="ml-1" />
                <Description>Cycle Through Views</Description>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Hide keyboard shortcuts" : "Show keyboard shortcuts"}
        className="flex items-center gap-2 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur px-3 py-2 text-xs text-zinc-500 dark:text-zinc-300 shadow-[0px_0px_1px_rgba(0,0,0,0.06),0px_2px_4px_rgba(0,0,0,0.06)] hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        {open ? <FaXmark /> : <FaKeyboard />}
        <span>{open ? "Close" : "Shortcuts"}</span>
        {!open && sticky && (
          <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Keep Reveal
          </span>
        )}
      </button>
    </div>
  );
}

function Description({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 text-xs text-gray-600 dark:text-gray-200">
      {children}
    </span>
  );
}

function ShortcutKey({
  label,
  icon,
  description,
  className = "",
  highlighted = false,
}: {
  label?: string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`flex items-center ${className}`}>
      <kbd
        className={`flex items-center justify-center w-7 h-7 text-xs font-bold text-white rounded-lg shadow-[inset_0_-3px_0_#2D3444,inset_0_-4px_0_#5A6374,0_5px_8px_rgba(0,0,0,0.25),0_0_1px_#131720] border border-b-0 ${
          highlighted
            ? "bg-gradient-to-b from-emerald-500 to-emerald-700 border-emerald-400"
            : "bg-gradient-to-b from-[#72829A] to-[#444E62] border-[#69778E]"
        }`}
      >
        {label ? (
          <span className="relative" style={{ textShadow: "0 0.4px 0 #FFFFFF" }}>
            {label}
          </span>
        ) : (
          icon &&
          React.cloneElement(icon as React.ReactElement, {
            className: "relative",
            style: { filter: "drop-shadow(0 0.4px 0 #FFFFFF)" },
          })
        )}
      </kbd>
      {description && <Description>{description}</Description>}
    </div>
  );
}
