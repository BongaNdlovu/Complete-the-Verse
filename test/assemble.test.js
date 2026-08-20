/* Logic tests — assembling a phrase from a word bank. */
const Assemble = require("../js/assemble");
const Recall = require("../js/recall");

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

console.log((fail ? "FAIL" : "PASS") + " — assemble · " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
