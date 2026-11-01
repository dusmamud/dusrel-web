// Empty-state artwork for Dusrel Mail — original line art, drawn here.
// Nothing in this file is copied, traced, or imitated from any other
// product's illustrations or icons: every shape below is a simple
// stroke drawn from scratch. The art carries no text inside it, so it
// needs no locale; any caption next to it is rendered by the caller
// through the locales helper. Colours come from currentColor, so the
// sets the tone with a text-slate-* class and the art works on both
// the white light background and the #121212 dark background.

import type { Locale } from "@dusrel/locales";

type ArtProps = {
  className?: string;
};

const svgProps = {
  viewBox: "0 0 120 96",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** Envelope with a small padlock — for Drafts / Sent / Junk empty states. */
export function LockedEnvelope({ className }: ArtProps) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="14" y="26" width="92" height="50" rx="6" />
      <path d="M14 32 L48 52" />
      <path d="M72 52 L106 32" />
      <path d="M54 52 v-6 a6 6 0 0 1 12 0 v6" />
      <rect x="51" y="52" width="18" height="16" rx="3" />
      <circle cx="60" cy="60" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Simple bin with a circular-arrow hint — for the Trash empty state. */
export function RecyclingBin({ className }: ArtProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M32 30 H88" />
      <path d="M38 30 L44 78 H76 L82 30" />
      <path d="M60 47 A11 11 0 1 1 49 58" />
      <polygon points="49,52 44.5,59.5 53.5,59.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Simple magnifier — for the search no-result state. */
export function Magnifier({ className }: ArtProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="52" cy="44" r="22" />
      <path d="M68 60 L86 78" />
    </svg>
  );
}

export type EmptyArtKind = "envelope" | "bin" | "magnifier";

export type EmptyArtProps = {
  kind: EmptyArtKind;
  className?: string;
  /**
   * Accepted for future text next to the art. The art itself renders
   * no text, so this prop is intentionally not used here.
   */
  locale?: Locale;
};

const artByKind = {
  envelope: LockedEnvelope,
  bin: RecyclingBin,
  magnifier: Magnifier,
} as const;

/** Empty-state illustration picker. Placement (which empty state shows
 *  which kind) is decided by the caller — this component only draws. */
export function EmptyArt({ kind, className }: EmptyArtProps) {
  const Art = artByKind[kind];
  return <Art className={className} />;
}
