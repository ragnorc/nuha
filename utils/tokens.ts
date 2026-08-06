import type {
  PartialLanguageAnalysis,
  PartialSentence,
  PartialToken,
} from "@/app/api/generate/schema";

export interface FlatToken {
  token: PartialToken;
  /** Position across the whole text. This is what focus and navigation use. */
  globalIndex: number;
  /** Which sentence this token belongs to. */
  sentenceIndex: number;
  /** Position within its own sentence. `syntax` entries index into this. */
  tokenIndex: number;
}

export interface TokenGroup {
  sentenceIndex: number;
  sentence: PartialSentence;
  tokens: FlatToken[];
}

export interface IndexedTokens {
  flat: FlatToken[];
  groups: TokenGroup[];
}

/**
 * Mid-stream a token may exist as an empty shell before its fields arrive, so
 * only treat it as renderable once it has an `original` to show.
 */
function isRenderable(token: PartialToken | undefined): token is PartialToken {
  return !!token && "original" in token;
}

/**
 * Walks the sentences once and hands every token a stable global index.
 *
 * Both the grid and the keyboard navigation need to agree on what "token 7"
 * means. They used to derive that separately, each doing a `findIndex` by
 * object identity inside a render loop — O(n^2) on every streamed chunk, and
 * dependent on partial objects keeping their identity across updates. Indexing
 * once here makes it O(n) and gives the two consumers a single source of truth.
 */
export function indexTokens(
  sentences: PartialLanguageAnalysis | undefined,
): IndexedTokens {
  const flat: FlatToken[] = [];
  const groups: TokenGroup[] = [];

  sentences?.forEach((sentence, sentenceIndex) => {
    if (!sentence) return;

    const tokens: FlatToken[] = [];
    sentence.tokens?.forEach((token) => {
      if (!isRenderable(token)) return;
      const entry: FlatToken = {
        token,
        globalIndex: flat.length,
        sentenceIndex,
        tokenIndex: tokens.length,
      };
      flat.push(entry);
      tokens.push(entry);
    });

    groups.push({ sentenceIndex, sentence, tokens });
  });

  return { flat, groups };
}

/**
 * The syntactic roles the model assigned to one token, e.g. "topic marker".
 * Entries are either a single `index` or a list of `indices`, both relative to
 * the sentence rather than the whole text.
 */
export function syntaxRolesFor(
  sentence: PartialSentence | undefined,
  tokenIndex: number,
): string[] {
  const roles: string[] = [];

  sentence?.syntax?.forEach((rawEntry) => {
    // The schema models this as a union of {index} | {indices}, but DeepPartial
    // makes both members' fields optional, so `"indices" in entry` no longer
    // narrows. Read both shapes off one widened view instead.
    const entry = rawEntry as
      | {
          type?: string;
          index?: number;
          indices?: Array<number | undefined>;
        }
      | undefined;

    if (!entry || typeof entry.type !== "string") return;

    const matches = entry.indices
      ? entry.indices.some((i) => i === tokenIndex)
      : entry.index === tokenIndex;

    if (matches && !roles.includes(entry.type)) roles.push(entry.type);
  });

  return roles;
}
