// A lowercase Latin a and a superscript 1 are the canonical pitch symbol.
// Preserve historical titles that merely contain "432 Hz" without an explicit pitch symbol.
// Do not modify URLs, slugs, emails, or original WordPress evidence snapshots.
export const canonicalPitch = (input) => String(input).replace(
  /(?<![\p{L}\p{N}])(?:ла|[aа])[\s\u00a0]*[1¹₁]?[\s\u00a0]*=[\s\u00a0]*(432|440)(?:[\s\u00a0]*Hz)?(?=$|[^\p{L}\p{N}])/giu,
  (_, frequency) => `a¹ = ${frequency} Hz`
);
