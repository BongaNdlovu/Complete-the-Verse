/* ==================================================================
   BANK — merges the verse sources and gives every item a STABLE id.

   Verse ids used to be the array index (`VERSES.forEach((v,i)=>v.id=i)`).
   That meant every saved mastery record silently re-pointed at a
   different verse the moment a verse was added, moved or cut — and this
   release cuts 296 of them. Ids are now derived from the reference and
   the blank, so they survive any reordering of the bank.

   LEGACY_IDS maps the old index-based ids onto the new ones for the
   entries that survived, so existing players keep the progress they
   earned. Entries that were quarantined have no new id and are dropped.
   ================================================================== */

/* Reference + blank, slugged. Two blanks on the same verse stay distinct. */
function verseId(v){
  const slug = s => String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug(v.r) + "~" + slug(v.a).split("-").slice(0, 4).join("-");
}

VERSES.push(...VERSES_EXTRA);

const BY_TIER = {1:[],2:[],3:[],4:[],5:[]};
const BY_ID = {};
VERSES.forEach(v => {
  v.id = verseId(v);
  if(BY_ID[v.id]) console.warn("duplicate verse id", v.id, v.r);
  BY_ID[v.id] = v;
  BY_TIER[v.t].push(v);
});

PASSAGES.forEach((p, i) => {
  p.id = "P~" + String(p.r).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  p.blanks = p.parts.filter(x => typeof x !== "string");
});

/* Old-index -> new-id. Built by scripts/build-legacy-map.js from
   content/legacy-order.json, the snapshot of the v2 bank order. A null
   means that slot held a verse this release cut. */
const LEGACY_IDS = (typeof LEGACY_ID_TABLE !== "undefined") ? LEGACY_ID_TABLE : null;

if(typeof module !== "undefined" && module.exports){
  module.exports = { VERSES, VERSES_EXTRA, PASSAGES, BY_TIER, BY_ID, BOOKS_ORDER, verseId, LEGACY_IDS };
}
