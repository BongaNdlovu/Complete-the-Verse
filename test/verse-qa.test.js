/* Logic tests — the content gate's detectors.

   These pin each rule to synthetic fixtures rather than to the shipped
   bank, so the gate can be trusted independently of the content it
   currently guards. Both directions are tested: every rule has cases it
   MUST catch and cases it MUST NOT, because the old gate's real failure
   was passing junk, and an over-eager replacement would be just as bad —
   it would force good verses to be deleted. */
const QA = require("../scripts/verse-qa");

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
const codes = v => QA.auditVerse(v).filter(f => f.severity === "error").map(f => f.code);
const has = (v, code) => codes(v).indexOf(code) >= 0;

/* A verse that passes everything, used as the base for each fixture. */
const base = () => ({
  b:"Genesis", r:"Genesis 1:1", t:1,
  p:"In the beginning God created the", a:"heaven and the earth", s:".",
  d:["earth and the heaven","firmament and the earth","world and the heaven"]
});
const withV = o => Object.assign(base(), o);

ok("the control fixture is clean", codes(base()).length === 0, codes(base()));

/* ---------- normalisation helpers ---------- */
{
  ok("norm strips punctuation and case", QA.norm("Bless Thee, and KEEP thee!") === "bless thee and keep thee");
  ok("tokens splits on words", QA.tokens("still small voice").length === 3);
  ok("containsSequence matches whole words",
     QA.containsSequence(["a","bow","in"], ["bow"]));
  ok("containsSequence does not match inside a word",
     !QA.containsSequence(["rainbow"], ["bow"]));
}

/* ---------- recycled fragments ---------- */
{
  ok("catches a distractor lifted from the verse",
     has(withV({p:"And the LORD said unto Cain, Where is Abel thy brother? And he said, I know not:",
                a:"Am I my brother's keeper?", s:"",
                d:["And he said, I know","Where is thy brother","What hast thou done"]}), "recycled"));
  ok("ignores a single word that recurs by coincidence",
     !has(withV({p:"For the eyes of the LORD run to and fro throughout the whole earth, to shew himself strong in the behalf of them whose heart is",
                 a:"perfect", s:"toward him.", d:["whole","upright","steadfast"]}), "recycled"));
  ok("a waiver downgrades the flag",
     !has(withV({p:"In the beginning was the Word, and the Word was with God, and the Word",
                 a:"was God", s:".", d:["was a God","is God","was with God"], qaOk:["recycled"]}), "recycled"));
  ok("a waiver is recorded rather than discarded",
     QA.auditVerse(withV({p:"In the beginning was the Word, and the Word was with God, and the Word",
                          a:"was God", s:".", d:["was a God","is God","was with God"], qaOk:["recycled"]}))
       .some(f => f.severity === "waived"));
}

/* ---------- mid-clause blanks ---------- */
{
  ok("catches a blank ending on a determiner",
     has(withV({p:"And, behold, I am with thee, and will keep thee in all places whither thou goest, and",
                a:"will bring thee again into this", s:"land;",
                d:["will carry thee again into this","shall bring thee back into this","will lead thee again into this"]}), "mid-clause"));
  ok("catches a blank ending on a possessive",
     has(withV({a:"was in the house of his", s:"master the Egyptian.",
                d:["was in the tent of his","dwelt in the house of his","was in the field of his"]}), "mid-clause"));
  ok("catches a blank opening inside a prepositional phrase that runs on",
     has(withV({p:"That all the people of the earth might know the hand", a:"of the LORD, that it is",
                s:"mighty:", d:["of the God, that it is","of the King, that it is","of the Host, that it is"]}), "mid-clause"));
  ok("catches an object pronoun opening the blank",
     has(withV({p:"If thou count", a:"me therefore a partner, receive him", s:"as myself.",
                d:["me therefore a brother, receive him","me therefore a fellow, receive him","me therefore a partner, accept him"]}), "mid-clause"));
  ok("catches a blank closed before its preposition",
     has(withV({p:"And no marvel; for Satan", a:"himself is transformed into an angel", s:"of light.",
                d:["himself is transformed into a spirit","himself is changed into an angel","himself is fashioned into an angel"]}), "mid-clause"));

  // Must NOT fire on good blanks.
  ok("a one-word blank is never mid-clause",
     !has(withV({p:"and with all thy", a:"might", s:".", d:["strength","mind","power"]}), "mid-clause"));
  ok("a complete prepositional phrase is fine",
     !has(withV({p:"Yea, I have loved thee", a:"with an everlasting love", s:":",
                 d:["with an eternal love","with an everlasting mercy","with a love that faileth not"]}), "mid-clause"));
  ok("a noun phrase closing before its verb is fine",
     !has(withV({p:"neither be ye sorry; for the", a:"joy of the LORD", s:"is your strength.",
                 d:["strength of the LORD","peace of the LORD","joy of our God"]}), "mid-clause"));
  ok("an all-caps declaration is exempt",
     !has(withV({p:"And God said unto Moses,", a:"I AM THAT I AM", s:":",
                 d:["I AM WHO I AM","I AM WHAT I AM","I AM HE THAT IS"]}), "mid-clause"));
  ok("a headed relative is a complete phrase",
     !has(withV({p:"For the Son of man is come to seek and to save", a:"that which was lost", s:".",
                 d:["that which was fallen","them which were lost","that which is lost"]}), "mid-clause"));
  ok("pied-piping is not a run-on",
     !has(withV({p:"Christ Jesus came into the world to save sinners;", a:"of whom I am chief", s:".",
                 d:["of whom I am the least","of whom I am first","among whom I am chief"]}), "mid-clause"));
  ok("a subject pronoun may open the blank",
     !has(withV({p:"For by grace are ye saved through faith; and that not of yourselves:",
                 a:"it is the gift of God", s:".",
                 d:["it is the work of God","it is the gift of grace","it is the promise of God"]}), "mid-clause"));
  ok("a noun ending in -ing is not a trailing verb",
     !has(withV({p:"And the peace of God,", a:"which passeth all understanding", s:",",
                 d:["which passeth all knowledge","which surpasseth all understanding","which passeth understanding"]}), "mid-clause"));
}

/* ---------- register swaps ---------- */
{
  ok("catches thee modernised to you",
     has(withV({a:"bless thee, and keep thee", s:":", p:"The LORD shall surely",
                d:["bless you, and keep you","bless thee, and hold thee","bless thee, and guard thee"]}), "register-swap"));
  ok("catches unto modernised to to",
     has(withV({p:"knock, and it shall be", a:"opened unto you", s:":",
                d:["opened to you","shewed unto you","added unto you"]}), "register-swap"));
  ok("thine against thy is precise recall, not a register swap",
     !has(withV({p:"and lean not unto", a:"thine own understanding", s:";",
                 d:["thy own understanding","thine own wisdom","thine own counsel"]}), "register-swap"));
}

/* ---------- connective swaps ---------- */
{
  ok("catches and swapped for or in a long blank",
     has(withV({p:"And he believed in", a:"the LORD; and he counted it", s:"to him for righteousness.",
                d:["the LORD; or he counted it","the God; and he counted it","the LORD; and she counted it"]}), "function-swap"));
  ok("a short blank may turn on its preposition",
     !has(withV({p:"Thou shalt have no other gods", a:"before me", s:".",
                 d:["besides me","but me","before mine eyes"]}), "function-swap"));
  ok("a meaningful determiner change is a real question",
     !has(withV({p:"For the love of money is the", a:"root of all evil", s:":",
                 d:["root of every evil","root of all sin","fount of all evil"]}), "function-swap"));
  ok("whose Father is a real question",
     !has(withV({p:"that they may see your good works, and", a:"glorify your Father which is in heaven", s:".",
                 d:["glorify our Father which is in heaven","glorify your Father which is in glory","glorify your God which is in heaven"]}), "function-swap"));
}

/* ---------- containment ---------- */
{
  ok("catches the answer plus the rest of the verse",
     has(withV({p:"and ye shall have tribulation ten days:", a:"be thou faithful unto death",
                s:", and I will give thee a crown of life.",
                d:["be thou faithful unto death, and I will give thee a crown of life","be thou steadfast unto death","be thou faithful unto the end"]}), "containment"));
  ok("a trailing word or two is a precision test",
     !has(withV({p:"but thou shalt love thy neighbour as thyself:", a:"I am the LORD", s:".",
                 d:["I am the LORD thy God","saith the LORD","I am the LORD your God"]}), "containment"));
  ok("a shorter distractor is not containment",
     !has(withV({p:"the LORD gave, and the LORD hath taken away; blessed be the", a:"name of the LORD", s:".",
                 d:["LORD","word of the LORD","hand of the LORD"]}), "containment"));
}

/* ---------- shape ---------- */
{
  ok("catches a duplicated distractor",
     has(withV({d:["earth and the heaven","earth and the heaven","world and the heaven"]}), "duplicate-option"));
  ok("catches a distractor equal to the answer",
     has(withV({d:["heaven and the earth!","firmament and the earth","world and the heaven"]}), "non-distinct"));
  ok("catches the wrong number of options",
     has(withV({d:["earth and the heaven","world and the heaven"]}), "option-count"));
  ok("catches an over-long answer",
     has(withV({a:"a b c d e f g h i", d:["x y","z w","q r"]}), "answer-too-long"));
  ok("thin context is a warning, not an error",
     !has(withV({p:"The LORD", a:"bless thee, and keep thee", s:"",
                 d:["bless thee, and hold thee","bless thee, and guard thee","bless thee, and love thee"]}), "thin-context"));
  ok("thin context is still reported",
     QA.auditVerse(withV({p:"The LORD", a:"bless thee, and keep thee", s:"",
                          d:["bless thee, and hold thee","bless thee, and guard thee","bless thee, and love thee"]}))
       .some(f => f.code === "thin-context" && f.severity === "warn"));
}

/* ---------- bank-level ---------- */
{
  const dup = [base(), base()];
  ok("catches the same blank entered twice", QA.auditBank(dup).bank.some(f => f.code === "duplicate-entry"));
  ok("the same verse with a different blank is allowed",
     !QA.auditBank([base(), withV({a:"heaven", d:["earth","firmament","sky"], p:"In the beginning God created the", s:"and the earth."})])
       .bank.some(f => f.code === "duplicate-entry"));
  const clean = QA.auditBank([base()]);
  ok("a clean bank reports ok", clean.ok === true && clean.clean === 1);
  ok("a dirty bank does not report ok",
     QA.auditBank([withV({d:["heaven and the earth","x y","z w"]})]).ok === false);
}

console.log((fail ? "FAIL" : "PASS") + " — verse-qa · " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
