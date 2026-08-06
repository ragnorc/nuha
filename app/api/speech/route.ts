import { openai } from "@ai-sdk/openai";
import { generateSpeech } from "ai";

export const maxDuration = 30;

const MAX_TEXT_LENGTH = 600;

export async function POST(req: Request) {
  const { text }: { text?: string } = await req.json();

  const trimmed = text?.trim();
  if (!trimmed) {
    return new Response("Missing text", { status: 400 });
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return new Response("Text too long", { status: 413 });
  }

  try {
    const { audio } = await generateSpeech({
      model: openai.speech("gpt-4o-mini-tts"),
      text: trimmed,
      voice: "alloy",
      // The model infers the language from the text itself. We deliberately
      // don't pass `language`: the schema gives us a name like "spanish"
      // rather than the ISO 639-1 code this option expects, and guessing the
      // mapping is worse than letting the model detect it.
      instructions:
        "Read this clearly and a little slowly, as a pronunciation model for someone learning the language. Use natural native pronunciation.",
    });

    return new Response(new Uint8Array(audio.uint8Array), {
      headers: {
        "Content-Type": audio.mediaType,
        // Same text always yields the same audio, so let the browser and the
        // CDN keep it rather than re-synthesising on every replay.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Speech generation failed:", error);
    return new Response("Speech generation failed", { status: 502 });
  }
}
