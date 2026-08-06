import React from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";

export function KeyboardShortcuts({ sticky = false }: { sticky?: boolean }) {
  return (
    <div className="fixed bottom-8 right-10 flex flex-col gap-2">
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
        <span className="ml-2 text-xs text-gray-600 dark:text-gray-200">
          Speak Sentence
        </span>
      </div>
      <div className="flex items-center">
        <ShortcutKey icon={<FaArrowLeft />} />
        <ShortcutKey icon={<FaArrowRight />} className="ml-1" />
        <span className="ml-2 text-xs text-gray-600 dark:text-gray-200">
          Navigate Words
        </span>
      </div>
      <div className="flex items-center">
        <ShortcutKey icon={<FaArrowUp />} />
        <ShortcutKey icon={<FaArrowDown />} className="ml-1" />
        <span className="ml-2 text-xs text-gray-600 dark:text-gray-200">
          Cycle Through Views
        </span>
      </div>
    </div>
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
          <span
            className="relative"
            style={{ textShadow: "0 0.4px 0 #FFFFFF" }}
          >
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
      {description && (
        <span className="ml-2 text-xs text-gray-600 dark:text-gray-200">
          {description}
        </span>
      )}
    </div>
  );
}
