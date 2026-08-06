/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */

"use client";

import { useObject } from "@ai-sdk/react";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { TopicInput } from "@/components/TopicInput";
import { TokensContainer } from "@/components/TokensContainer";
import { SentenceDetail } from "@/components/SentenceDetail";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { useTokenNavigation } from "@/hooks/useTokenNavigation";
import { useHotkeys } from "@/hooks/useHotkey";
import { useSpeech } from "@/hooks/useSpeech";
import { indexTokens, syntaxRolesFor } from "@/utils/tokens";
import { languageAnalysisSchema } from "@/app/api/generate/schema";
import { FaArrowLeft } from "react-icons/fa6";
import { GradientButton } from "@/components/GradientButton";
import { useQueryState } from "nuqs";

export default function Home() {
  const [topic, setTopic] = useQueryState("topic");
  const [showTokens, setShowTokens] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);

  const {
    submit,
    isLoading: isLoadingAnalysis,
    object,
    stop,
  } = useObject({
    api: "/api/generate",
    schema: languageAnalysisSchema,
    onError: (error) => {
      console.error("Error occurred:", error);
      toast.error(`An error occurred: ${error.message}`);
    },
  });

  const handleGenerateSentences = () => {
    if (topic) {
      submit({ prompt: topic });
      setShowTokens(true);
    }
  };

  // Indexed once here so the grid and the keyboard navigation cannot disagree
  // about which token a given index refers to.
  const { flat, groups } = useMemo(
    () => indexTokens(object?.analysis),
    [object?.analysis],
  );

  const hasTokens = flat.length > 0 && showTokens;

  const { focusedIndex, revealState, cycleView, setFocusedIndex, sticky } =
    useTokenNavigation(flat, object?.rtl);

  const { speak, speakingText } = useSpeech();

  const focused = flat[focusedIndex];
  const focusedSentence = focused
    ? groups.find((g) => g.sentenceIndex === focused.sentenceIndex)?.sentence
    : undefined;
  const roles = useMemo(
    () => (focused ? syntaxRolesFor(focusedSentence, focused.tokenIndex) : []),
    [focusedSentence, focused],
  );

  useHotkeys("N", () => setShowNotes((value) => !value), []);
  useHotkeys("A", () => speak(focused?.token.original), [focused, speak]);
  useHotkeys(
    "shift+a",
    () => speak(focusedSentence?.original_sentence),
    [focusedSentence, speak],
  );

  const handleBack = useCallback(() => {
    setTopic(null);
    stop();
    setShowTokens(false);
    setFocusedIndex(0);
    setShowNotes(false);
  }, [setTopic, stop, setFocusedIndex]);

  return (
    <>
      <div className="absolute top-10 left-10">
        {hasTokens && (
          <GradientButton
            onClick={handleBack}
            icon={
              <>
                <FaArrowLeft className="absolute z-10 text-white/90" />
                <FaArrowLeft className="absolute text-black translate-y-[-0.2px]" />
              </>
            }
          />
        )}
      </div>
      <div className="relative z-10 w-full">
        <TopicInput
          showInput={!hasTokens || !topic}
          topic={topic || ""}
          setTopic={setTopic}
          isLoading={isLoadingAnalysis}
          onSubmit={handleGenerateSentences}
        />

        {hasTokens && (
          <>
            <TokensContainer
              setFocusedIndex={setFocusedIndex}
              rtl={object?.rtl}
              cycleView={cycleView}
              groups={groups}
              revealState={revealState}
              focusedIndex={focusedIndex}
            />

            <SentenceDetail
              sentence={focusedSentence}
              focusedToken={focused?.token}
              roles={roles}
              showNotes={showNotes}
              onToggleNotes={() => setShowNotes((value) => !value)}
              onSpeak={speak}
              speakingText={speakingText}
              rtl={!!object?.rtl}
            />

            <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500 md:hidden">
              Tap a word to reveal it. Tap again to cycle.
            </p>
          </>
        )}

        <div className="hidden md:block">
          <KeyboardShortcuts sticky={sticky} />
        </div>
      </div>
    </>
  );
}
