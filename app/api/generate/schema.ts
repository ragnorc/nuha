import { DeepPartial } from "ai";
import { z } from "zod";

// Define a new schema for language analysis
export const languageAnalysisSchema = z.object({
  rtl: z.boolean().describe("Whether the language uses right-to-left characters."),
  language: z.string().toLowerCase(),
  analysis: z.array(z.object({
    original_sentence: z.string(),
    transliteration: z.string().describe("The transliteration if the language uses non-latin characters."),
    translation: z.string(),
    tokens: z.array(z.object({
      original: z.string(),
      // Strict structured outputs require every property to be listed in
      // `required`, so "may be absent" has to be nullable rather than optional.
      transliteration: z.string().nullable(),
      translation: z.string(),
      part_of_speech: z.string(),
      // ... (other token properties)
    })),
    syntax: z.array(z.union([
      z.object({ type: z.string(), index: z.number() }),
      z.object({ type: z.string(), indices: z.array(z.number()) })
    ])),
    grammatical_notes: z.array(z.string()),
    // ... (other properties)
  })),
});

// Define a type for the partial analysis
export type PartialLanguageAnalysis = DeepPartial<typeof languageAnalysisSchema>["analysis"];

export type LanguageAnalysis = z.infer<typeof languageAnalysisSchema>["analysis"];

// A single sentence as it looks mid-stream, before every field has arrived.
export type PartialSentence = NonNullable<
  NonNullable<PartialLanguageAnalysis>[number]
>;

// Define a type for partial token
export type PartialToken = DeepPartial<LanguageAnalysis[number]['tokens'][number]>;
