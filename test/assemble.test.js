/* Logic tests — assembling a phrase from a word bank. */
const Assemble = require("../js/assemble");
const Recall = require("../js/recall");
const Polish = require("../js/polish");

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }

const rng = (function(){ let i = 0; return function(){ i = (i * 9301 + 49297) % 233280; return i / 233280; }; })();

{
  const st = Assemble.build("still small voice", ["mighty rushing wind","great and strong wind","earthquake and fire"], rng);
  eq("target keeps every word", st.target.join(" "), "still small voice");
  eq("three slots", st.placed.length, 3);
  ok("bank has the three target words", st.target.every(w => st.bank.some(t => t.word === w)));
  eq("two or three fakes", st.bank.length - st.target.length, Assemble.fakeCount(3));
  ok("fakes are not target words", st.bank.filter(t => t.dest < 0).every(t => st.target.indexOf(t.word) < 0));
}

{
  const st = Assemble.build("the world", ["the earth","all flesh","the nations"], rng);
  eq("short phrase still gets two fakes", Assemble.fakeCount(2), 2);
  eq("short bank size", st.bank.length, 4);
}

{
  const st = Assemble.build("heaven and the earth", ["heavens and the earth","earth and the heaven","the world and the earth"], rng);
  const heaven = st.bank.find(t => t.word === "heaven");
  Assemble.place(st, heaven.id, 0);
  eq("first slot filled", Assemble.join(st.placed), "heaven");
  ok("not filled yet", !Assemble.isFilled(st));
  st.target.forEach(function(w, i){
    const tile = st.bank.find(t => t.word === w && t.dest === i);
    Assemble.place(st, tile.id, i);
  });
  eq("correct order joins the answer", Assemble.join(st.placed), "heaven and the earth");
  ok("filled when every slot has a tile", Assemble.isFilled(st));
  const graded = Recall.grade(Assemble.join(st.placed), "heaven and the earth", []);
  eq("assembled exact grades exact", graded.verdict, "exact");
}

{
  const st = Assemble.build("heaven and the earth", ["heavens and the earth"], rng);
  const heavens = st.bank.find(t => t.word === "heavens");
  const and = st.bank.find(t => t.word === "and");
  const the = st.bank.find(t => t.word === "the");
  const earth = st.bank.find(t => t.word === "earth");
  if(heavens) Assemble.place(st, heavens.id, 0);
  Assemble.place(st, and.id, 1);
  Assemble.place(st, the.id, 2);
  Assemble.place(st, earth.id, 3);
  const graded = Recall.grade(Assemble.join(st.placed), "heaven and the earth", ["heavens and the earth"]);
  eq("a fake word in the phrase is wrong", graded.verdict, "wrong");
}

{
  const st = Assemble.build("keep thee", ["bless thee","hold thee","save thee"], rng);
  const first = st.bank[0];
  Assemble.place(st, first.id, 0);
  Assemble.unplace(st, 0);
  eq("unplace clears the slot", st.placed[0], null);
  ok("tile returns to the bank", Assemble.remaining(st).some(t => t.id === first.id));
}

{
  const a = Assemble.build("still small voice", ["mighty rushing wind"], () => 0.1);
  const b = Assemble.build("still small voice", ["mighty rushing wind"], () => 0.1);
  eq("same rng same bank order", a.bank.map(t => t.id).join(","), b.bank.map(t => t.id).join(","));
}

{
  const st = Assemble.buildExact("And the earth was without form and void.", () => 0.1);
  eq("exact assembly preserves the complete passage", st.target.join(" "), "And the earth was without form and void.");
  eq("exact assembly has no false words", st.bank.length, st.target.length);
  ok("exact assembly still shuffles the word bank", st.bank.map(t => t.word).join(" ") !== st.target.join(" "));
}

/* ---------- Lift & commit (tap + keyboard parity) ---------- */
{
  const st = Assemble.build("still small voice", ["mighty rushing wind"], rng);
  const still = st.bank.find(t => t.word === "still");
  const small = st.bank.find(t => t.word === "small");

  // Tap a bank card with an empty slot: it places immediately.
  let r = Assemble.resolveTap(st, { tileId: still.id });
  eq("tap on a bank card places into the first empty slot", r.kind, "place");
  eq("placed at slot 0", st.placed[0] && st.placed[0].word, "still");

  // Tap the placed card: it lifts, not removes.
  r = Assemble.resolveTap(st, { slot: 0 });
  eq("tapping a placed card lifts it", r.kind, "lift" );
  ok("lifted tile is tracked", Assemble.liftedTile(st) && Assemble.liftedTile(st).id === still.id);

  // Tap another occupied slot while lifted: swap, not replace.
  const fake = st.bank.find(t => t.dest < 0);
  Assemble.place(st, fake.id, 2);
  r = Assemble.resolveTap(st, { slot: 2 });
  eq("lifted card committed to an occupied slot swaps", r.kind, "swap");
  eq("swapped into slot 2", st.placed[2].word, "still");
  eq("displaced card took the lifted card's old slot", st.placed[0].word, fake.word);
  ok("commit clears the lift", !Assemble.liftedTile(st));

  // Lift again and commit onto its own slot: cancel.
  Assemble.resolveTap(st, { slot: 2 });
  r = Assemble.resolveTap(st, { slot: 2 });
  eq("re-tapping the lifted card cancels the lift", r.kind, "cancel");
  ok("cancel keeps the board unchanged", st.placed[2].word === "still");

  // Bank card lifted onto an occupied slot with no empty slots: REPLACE.
  const st2 = Assemble.buildExact("And God saw the light", () => 0.5); // full-verse: no fakes
  st2.target.forEach(function(w, i){
    const tile = st2.bank.find(t => t.word === w && t.dest === i);
    Assemble.place(st2, tile.id, i);
  });
  const wrong = st2.placed[3]; // "light" sits in slot 3
  const good = st2.bank.find(t => !st2.placed.some(p => p && p.id === t.id));
  eq("fixture starts fully seated except the unplaced word", good || null, null);
  // Force the replace scenario: return one word to the bank, then commit
  // it from the bank onto an occupied slot.
  Assemble.unplace(st2, 3);
  const bankTile = Assemble.remaining(st2)[0];
  Assemble.lift(st2, bankTile.id);
  const occupant = st2.placed[1];
  const res = Assemble.resolveTap(st2, { slot: 1 });
  eq("bank card committed onto an occupied slot replaces it", res.kind, "replace");
  eq("the evicted word is reported", res.evicted && res.evicted.id, occupant.id);
  eq("replacement seated in the targeted slot", st2.placed[1].id, bankTile.id);
  ok("evicted word returned to the bank", Assemble.remaining(st2).some(t => t.id === res.evicted.id));
  ok("replace clears the lift", !Assemble.liftedTile(st2));
}

{
  // Keyboard path shares resolveTap: lift via Enter, move, drop via Enter.
  const st = Assemble.build("heaven and earth", [], rng);
  const heaven = st.bank.find(t => t.word === "heaven");
  const and = st.bank.find(t => t.word === "and");
  Assemble.resolveTap(st, { tileId: heaven.id });
  Assemble.resolveTap(st, { tileId: and.id });
  Assemble.resolveTap(st, { slot: 1 });           // lift "and"
  Assemble.resolveTap(st, { slot: 0 });           // swap with "heaven"
  eq("keyboard-style swap reorders the verse", Assemble.join(st.placed), "and heaven");
}

/* ---------- Fade phrase chunking ---------- */
{
  const chunks = Polish.verseChunks("I can do all things through Christ which strengtheneth me.");
  const flat = [].concat(...chunks);
  eq("chunk indices cover every word in order", flat.join(","), [0,1,2,3,4,5,6,7,8,9].join(","));
  eq("a verse with no internal punctuation stays one chunk", chunks.length, 1);
  const two = Polish.verseChunks("The LORD is my shepherd; I shall not want.");
  eq("clause punctuation starts a new chunk", two.length, 2);
  ok("first clause ends at the semicolon", two[0].length === 5 && two[1].length === 4);
  ok("final period does not strand a one-word tail",
    Polish.verseChunks("God is love.").every(c => c.length >= 2));
  eq("short verse stays one chunk", Polish.verseChunks("Jesus wept.").length, 1);
  eq("trailing semicolon does not create a phantom second chunk",
    Polish.verseChunks("Behold I come quickly;").length, 1);
}

console.log((fail ? "FAIL" : "PASS") + " — assemble · " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
