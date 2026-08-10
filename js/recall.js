/* ==================================================================
   RECALL — grading a typed answer.

   Picking the right line out of four is recognition. Producing it from
   nothing is recall, and recall is the thing this game claims to train.
   Everything the Recall mode needs that isn't the DOM lives here, so the
   grading rules can be tested directly.

   The grader has one job beyond comparing strings: distinguish "you do
   not know this verse" from "you know this verse and your thumb slipped".
   Punishing typos on a phone would make the mode unplayable, and
   accepting anything close would make it worthless.
   ================================================================== */

var Recall = (function(){

  /* Case, punctuation and spacing are not what is being tested. Curly
     quotes are folded because phone keyboards insert them unbidden. */
  function normalize(s){
    return String(s == null ? "" : s)
      .replace(/[‘’ʼ]/g, "'")
      .replace(/[“”]/g, '"')
      .toLowerCase()
      .replace(/[^a-z0-9' ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function words(s){ var n = normalize(s); return n ? n.split(" ") : []; }

  /* Levenshtein with a rolling row. Inputs here are a few dozen
     characters, so the O(n*m) is irrelevant. */
  function levenshtein(a, b){
    a = String(a); b = String(b);
    if(a === b) return 0;
    if(!a.length) return b.length;
    if(!b.length) return a.length;
    var prev = new Array(b.length + 1), cur = new Array(b.length + 1), i, j;
    for(j = 0; j <= b.length; j++) prev[j] = j;
    for(i = 1; i <= a.length; i++){
      cur[0] = i;
      for(j = 1; j <= b.length; j++){
        var cost = a.charCodeAt(i-1) === b.charCodeAt(j-1) ? 0 : 1;
        cur[j] = Math.min(cur[j-1] + 1, prev[j] + 1, prev[j-1] + cost);
      }
      for(j = 0; j <= b.length; j++) prev[j] = cur[j];
    }
    return prev[b.length];
  }

  /* Typo budget, scaled to the length of the phrase. One slip in a short
     answer, a few in a long one — but never enough to turn one word of
     Scripture into a different one. */
  function tolerance(answer){
    var n = normalize(answer).length;
    if(n <= 8) return 1;
    if(n <= 16) return 2;
    if(n <= 28) return 3;
    return 4;
  }

  /* An answer that is right except for archaic spelling is still not the
     verse — this game is about the words as they stand. But telling
     someone WHY they were marked wrong is the difference between a drill
     and a wall, so the grader reports this case separately. */
  var MODERNISED = {
    "you":["thee","thou","ye"], "your":["thy","thine"], "yours":["thine"],
    "has":["hath"], "does":["doth"], "says":["saith"], "have":["hast"],
    "are":["art"], "will":["wilt","shalt"], "shall":["shalt"], "do":["dost"],
    "to":["unto"], "where":["whither"], "why":["wherefore"],
    "savior":["saviour"], "honor":["honour"], "labor":["labour"], "valor":["valour"]
  };
  function isModernisationOf(typed, expected){
    var alts = MODERNISED[typed];
    if(alts) for(var i = 0; i < alts.length; i++) if(alts[i] === expected) return true;
    return false;
  }

  /* Character distance cannot tell a slip from a different word:
     "heavens" is one edit from "heaven" and so is any fat-fingered typo.
     But "the heaven and the earth" and "the heavens and the earth" are
     different texts, and accepting the wrong one is the exact failure
     this mode exists to prevent.

     An inflection is a whole-word change wearing a typo's clothes, so it
     is never forgiven — however small the edit distance. */
  // "d" and "n" cover stems that already end in e: love/loved, know/known.
  var INFLECTIONS = ["s","es","d","n","eth","ed","est","en","th","ing"];
  function isInflectionOf(a, b){
    if(a === b) return false;
    var short = a.length <= b.length ? a : b;
    var long  = a.length <= b.length ? b : a;
    if(!short.length || long.indexOf(short) !== 0) return false;
    var suffix = long.slice(short.length);
    for(var i = 0; i < INFLECTIONS.length; i++) if(INFLECTIONS[i] === suffix) return true;
    return false;
  }

  /* Grade one typed attempt.

     Returns { verdict, distance, expected, typed, hint }
       "exact"      the words are right
       "close"      within the typo budget — counted right, exact form shown
       "modernised" right words in modern English — counted wrong, said so
       "wrong"      not the verse
  */
  function grade(typed, answer, distractors){
    var t = normalize(typed), a = normalize(answer);
    var out = { typed: t, expected: a, distance: 0, verdict: "wrong", hint: "" };
    if(!t){ out.distance = a.length; out.hint = "Nothing entered."; return out; }
    if(t === a){ out.verdict = "exact"; return out; }

    var tw = words(t), aw = words(a), i;
    if(tw.length === aw.length){
      var modernised = 0, inflected = null, other = 0;
      for(i = 0; i < tw.length; i++){
        if(tw[i] === aw[i]) continue;
        if(isModernisationOf(tw[i], aw[i])) modernised++;
        else if(isInflectionOf(tw[i], aw[i])){ inflected = [tw[i], aw[i]]; other++; }
        else other++;
      }
      if(modernised && !other){
        out.verdict = "modernised";
        out.distance = levenshtein(t, a);
        out.hint = "The sense is right, but the verse keeps the older wording.";
        return out;
      }
      // A changed word form is a changed text, whatever the edit distance.
      if(inflected){
        out.distance = levenshtein(t, a);
        out.hint = 'The verse reads "' + inflected[1] + '", not "' + inflected[0] + '".';
        return out;
      }
    }

    // If the typed line is at least as close to one of the verse's own
    // wrong answers as it is to the right one, it is not a slip — the
    // distractors are the near-misses a reader actually reaches for.
    var d = levenshtein(t, a);
    out.distance = d;
    if(distractors && distractors.length){
      for(i = 0; i < distractors.length; i++){
        var dn = normalize(distractors[i]);
        if(!dn) continue;
        if(dn === t || levenshtein(t, dn) < d){
          out.hint = "That is one of the readings this verse is not.";
          return out;
        }
      }
    }

    if(d <= tolerance(a)){
      out.verdict = "close";
      out.hint = "Counted — mind the exact wording.";
      return out;
    }
    return out;
  }

  var isCorrect = v => v === "exact" || v === "close";

  /* Progressive help, in place of burning two wrong options — there are
     no options to burn when you are typing.
       1  how many words, and their lengths
       2  first letter of each word
       3  first word in full, initials for the rest */
  function hint(answer, level){
    var w = String(answer).trim().split(/\s+/).filter(Boolean);
    if(level <= 1) return w.map(x => "•".repeat(x.replace(/[^A-Za-z0-9']/g, "").length)).join("  ");
    if(level === 2) return w.map(x => x.charAt(0) + "…").join(" ");
    return w.map((x, i) => i === 0 ? x : x.charAt(0) + "…").join(" ");
  }

  return {
    normalize: normalize, words: words, levenshtein: levenshtein,
    tolerance: tolerance, grade: grade, isCorrect: isCorrect, hint: hint,
    isModernisationOf: isModernisationOf, isInflectionOf: isInflectionOf
  };
})();

if(typeof module !== "undefined" && module.exports) module.exports = Recall;
