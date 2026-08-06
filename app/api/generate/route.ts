import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { languageAnalysisSchema } from "./schema";
import { NextRequest } from "next/server";

export const maxDuration = 60;

// NOTE: rate limiting is currently OFF, and this endpoint is public.
//
// It was disabled in Dec 2024, and the Vercel KV store it pointed at has since
// been deleted (in-earwig-37776.upstash.io no longer resolves). That left an
// awaited @upstash/ratelimit call at the top of this handler retrying against a
// dead host for ~5s on every request before being discarded, which was the
// single largest contributor to time-to-first-token.
//
// To restore it: provision a new KV store, re-add the KV_REST_API_* env vars,
// and reinstate the limiter *after* parsing the body, e.g.
//
//   const ratelimit = new Ratelimit({
//     redis: kv,
//     limiter: Ratelimit.tokenBucket(100, "1 d", 100),
//   });
//   const { success } = await ratelimit.limit(req.ip ?? "127.0.0.1");
//   if (!success) return new Response("Too many requests", { status: 429 });

export async function POST(req: NextRequest) {
  const { prompt }: { prompt: string } = await req.json();

  // Generate and analyze the text in a single streamObject call
  const analysisResult = streamObject({
    model: openai("gpt-5.6-luna"),
    schema: languageAnalysisSchema,
    instructions:
      "You are a language expert. Generate a text with multiple sentences for the given prompt that is optimized for language learning. The text should use frequently used words. Then, analyze the generated text and provide detailed grammatical information for each sentence. Provide an array such that each element represents a sentence. The tokens are meaningful units of the language and may be multiple words whose joint translation may not be the sum of the translations of the individual words. Make sure the tokenization is correct and does not split words in the middle.",
    prompt,
    // This is a generation/annotation task, not a reasoning one. Leaving
    // reasoning on costs ~13s before the first chunk arrives, which is dead
    // time for a UI that streams tokens in as they land. Turning it off drops
    // time-to-first-token to ~1.3s and, if anything, returns more content.
    providerOptions: { openai: { reasoningEffort: "none" } },
  });

  return analysisResult.toTextStreamResponse();
}
