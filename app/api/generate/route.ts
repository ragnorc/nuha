import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { languageAnalysisSchema } from "./schema";
import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest } from "next/server";

export const maxDuration = 60;

// Create Rate limit
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.tokenBucket(100, "1 d", 100),
});

export async function POST(req: NextRequest) {
  // Call ratelimit with request ip
  const ip = req.ip ?? "127.0.0.1";

  const { success } = await ratelimit.limit(ip);

  // Block the request if unsuccessful
  // if (!success) {
  //   return new Response(
  //     "You have reached the maximum number of requests. Please try again in an hour.",
  //     { status: 429 },
  //   );
  // }

  const { prompt }: { prompt: string } = await req.json();

  // Generate and analyze the text in a single streamObject call
  const analysisResult = streamObject({
    model: openai("gpt-5.6-luna"),
    schema: languageAnalysisSchema,
    instructions:
      "You are a language expert. Generate a text with multiple sentences for the given prompt that is optimized for language learning. The text should use frequently used words. Then, analyze the generated text and provide detailed grammatical information for each sentence. Provide an array such that each element represents a sentence. The tokens are meaningful units of the language and may be multiple words whose joint translation may not be the sum of the translations of the individual words. Make sure the tokenization is correct and does not split words in the middle.",
    prompt,
  });

  return analysisResult.toTextStreamResponse();
}
