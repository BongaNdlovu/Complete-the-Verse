const Tablets = (function(){
  const BLANK_MS = 6500;
  const LEVEL_MS = [9000, 6500, 4000];
  const LEVEL_NAME = ["I", "II", "III"];
  const HOLDS_TO_OPEN = 3;
  const chapters = [
    {
      id:"psalm23", name:"Psalm 23", r:"Psalm 23:1-6", subtitle:"The LORD is my shepherd", pace:1,
      blanks:[
        { r:"Psalm 23:1", prefix:"The LORD is my shepherd; I shall not", a:"want", suffix:".", d:["fear","fall","fail"] },
        { r:"Psalm 23:2", prefix:"He maketh me to lie down in green", a:"pastures", suffix:":", d:["meadows","valleys","fields"] },
        { r:"Psalm 23:2", prefix:"he leadeth me beside the still", a:"waters", suffix:".", d:["rivers","streams","fountains"] },
        { r:"Psalm 23:3", prefix:"He restoreth my", a:"soul", suffix:":", d:["heart","spirit","strength"] },
        { r:"Psalm 23:3", prefix:"he leadeth me in the paths of", a:"righteousness", suffix:"for his name's sake.", d:["holiness","peace","truth"] },
        { r:"Psalm 23:4", prefix:"Yea, though I walk through the valley of the shadow of death, I will fear no", a:"evil", suffix:":", d:["death","darkness","trouble"] },
        { r:"Psalm 23:4", prefix:"for thou art with me; thy rod and thy", a:"staff", suffix:"they comfort me.", d:["shield","sword","hand"] },
        { r:"Psalm 23:5", prefix:"Thou preparest a table before me in the presence of mine", a:"enemies", suffix:":", d:["foes","brethren","rulers"] },
        { r:"Psalm 23:5", prefix:"thou anointest my head with", a:"oil", suffix:"; my cup runneth over.", d:["wine","grace","water"] },
        { r:"Psalm 23:6", prefix:"Surely goodness and", a:"mercy", suffix:"shall follow me all the days of my life:", d:["truth","peace","glory"] },
        { r:"Psalm 23:6", prefix:"and I will dwell in the house of the LORD for", a:"ever", suffix:".", d:["ages","safety","eternity"] }
      ]
    },
    {
      id:"psalm91", name:"Psalm 91", r:"Psalm 91", subtitle:"The secret place of the most High", pace:1,
      blanks:[
        { r:"Psalm 91:1", prefix:"He that dwelleth in the secret place of the most High shall abide under the shadow of the", a:"Almighty", suffix:".", d:["Father","Rock","King"] },
        { r:"Psalm 91:2", prefix:"I will say of the LORD, He is my refuge and my", a:"fortress", suffix:": my God; in him will I trust.", d:["strength","shield","tower"] },
        { r:"Psalm 91:3", prefix:"Surely he shall deliver thee from the snare of the", a:"fowler", suffix:", and from the noisome pestilence.", d:["hunter","wicked","lion"] },
        { r:"Psalm 91:4", prefix:"He shall cover thee with his", a:"feathers", suffix:", and under his wings shalt thou trust:", d:["hands","mantle","shadow"] },
        { r:"Psalm 91:4", prefix:"his truth shall be thy shield and", a:"buckler", suffix:".", d:["helmet","sword","rock"] },
        { r:"Psalm 91:5", prefix:"Thou shalt not be afraid for the terror by", a:"night", suffix:"; nor for the arrow that flieth by day;", d:["storm","death","fire"] },
        { r:"Psalm 91:6", prefix:"Nor for the pestilence that walketh in darkness; nor for the destruction that wasteth at", a:"noonday", suffix:".", d:["midnight","daybreak","evening"] },
        { r:"Psalm 91:7", prefix:"A thousand shall fall at thy side, and ten thousand at thy", a:"right", suffix:"hand; but it shall not come nigh thee.", d:["left","own","other"] },
        { r:"Psalm 91:8", prefix:"Only with thine eyes shalt thou behold and see the reward of the", a:"wicked", suffix:".", d:["righteous","nations","proud"] },
        { r:"Psalm 91:9", prefix:"Because thou hast made the LORD, which is my refuge, even the most High, thy", a:"habitation", suffix:";", d:["dwelling","fortress","refuge"] },
        { r:"Psalm 91:10", prefix:"There shall no evil befall thee, neither shall any plague come nigh thy", a:"dwelling", suffix:".", d:["house","tent","habitation"] },
        { r:"Psalm 91:11", prefix:"For he shall give his", a:"angels", suffix:"charge over thee, to keep thee in all thy ways.", d:["spirits","hosts","saints"] },
        { r:"Psalm 91:12", prefix:"They shall bear thee up in their hands, lest thou dash thy foot against a", a:"stone", suffix:".", d:["rock","snare","serpent"] },
        { r:"Psalm 91:13", prefix:"Thou shalt tread upon the lion and adder: the young lion and the dragon shalt thou", a:"trample", suffix:"under feet.", d:["conquer","cast","break"] },
        { r:"Psalm 91:14", prefix:"Because he hath set his love upon me, therefore will I", a:"deliver", suffix:"him: I will set him on high, because he hath known my name.", d:["preserve","save","strengthen"] },
        { r:"Psalm 91:15", prefix:"He shall call upon me, and I will answer him: I will be with him in", a:"trouble", suffix:"; I will deliver him, and honour him.", d:["danger","need","battle"] },
        { r:"Psalm 91:16", prefix:"With long life will I satisfy him, and shew him my", a:"salvation", suffix:".", d:["mercy","glory","favour"] }
      ]
    },
    {
      id:"john1", name:"John 1", r:"John 1", subtitle:"In the beginning was the Word", pace:1,
      blanks:[
        { r:"John 1:1", prefix:"In the beginning was the", a:"Word", suffix:", and the Word was with God, and the Word was God.", d:["Light","Law","Voice"] },
        { r:"John 1:2", prefix:"The same was in the beginning with", a:"God", suffix:".", d:["man","heaven","us"] },
        { r:"John 1:3", prefix:"All things were made by him; and without him was not any thing", a:"made", suffix:"that was made.", d:["done","seen","formed"] },
        { r:"John 1:4", prefix:"In him was life; and the life was the light of", a:"men", suffix:".", d:["God","heaven","angels"] },
        { r:"John 1:5", prefix:"And the light shineth in darkness; and the darkness comprehended it", a:"not", suffix:".", d:["well","fully","ever"] },
        { r:"John 1:6", prefix:"There was a man sent from God, whose name was", a:"John", suffix:".", d:["Jesus","Elijah","Moses"] },
        { r:"John 1:7", prefix:"The same came for a witness, to bear witness of the Light, that all men through him might", a:"believe", suffix:".", d:["live","see","follow"] },
        { r:"John 1:8", prefix:"He was not that Light, but was sent to bear witness of that", a:"Light", suffix:".", d:["Word","truth","life"] },
        { r:"John 1:9", prefix:"That was the true Light, which lighteth every man that cometh into the", a:"world", suffix:".", d:["kingdom","earth","day"] },
        { r:"John 1:10", prefix:"He was in the world, and the world was made by him, and the world knew him", a:"not", suffix:".", d:["never","little","again"] },
        { r:"John 1:11", prefix:"He came unto his own, and his own received him", a:"not", suffix:".", d:["gladly","fully","never"] },
        { r:"John 1:12", prefix:"But as many as received him, to them gave he power to become the sons of", a:"God", suffix:", even to them that believe on his name:", d:["man","Abraham","Israel"] },
        { r:"John 1:13", prefix:"Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of", a:"God", suffix:".", d:["grace","heaven","truth"] },
        { r:"John 1:14", prefix:"And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the", a:"Father", suffix:",) full of grace and truth.", d:["Son","Lord","Most High"] },
        { r:"John 1:15", prefix:"John bare witness of him, and cried, saying, This was he of whom I spake, He that cometh after me is preferred before me: for he was", a:"before", suffix:"me.", d:["above","with","near"] },
        { r:"John 1:16", prefix:"And of his fulness have all we received, and grace for", a:"grace", suffix:".", d:["mercy","truth","truth's sake"] },
        { r:"John 1:17", prefix:"For the law was given by Moses, but grace and truth came by Jesus", a:"Christ", suffix:".", d:["the Lord","of Nazareth","Messiah"] },
        { r:"John 1:18", prefix:"No man hath seen God at any time; the only begotten Son, which is in the bosom of the Father, he hath", a:"declared", suffix:"him.", d:["revealed","seen","known"] },
        { r:"John 1:19", prefix:"And this is the record of John, when the Jews sent priests and Levites from Jerusalem to ask him, Who art", a:"thou", suffix:"?", d:["ye","he","this"] },
        { r:"John 1:20", prefix:"And he confessed, and denied not; but confessed, I am not the", a:"Christ", suffix:".", d:["prophet","Messiah","king"] },
        { r:"John 1:21", prefix:"And they asked him, What then? Art thou Elias? And he saith, I am not. Art thou that", a:"prophet", suffix:"? And he answered, No.", d:["priest","scribe","teacher"] },
        { r:"John 1:22", prefix:"Then said they unto him, Who art thou? that we may give an answer to them that sent us. What sayest thou of", a:"thyself", suffix:"?", d:["the Christ","the kingdom","this man"] },
        { r:"John 1:23", prefix:"He said, I am the voice of one crying in the wilderness, Make straight the way of the", a:"Lord", suffix:", as said the prophet Esaias.", d:["king","Christ","Most High"] },
        { r:"John 1:24", prefix:"And they which were sent were of the", a:"Pharisees", suffix:".", d:["Sadducees","scribes","priests"] },
        { r:"John 1:25", prefix:"Why baptizest thou then, if thou be not that Christ, nor Elias, neither that", a:"prophet", suffix:"?", d:["priest","teacher","king"] },
        { r:"John 1:26", prefix:"John answered them, saying, I baptize with water: but there standeth one among you, whom ye know", a:"not", suffix:";", d:["little","already","well"] },
        { r:"John 1:27", prefix:"He it is, who coming after me is preferred before me, whose shoe's latchet I am not worthy to", a:"unloose", suffix:".", d:["bear","touch","take"] },
        { r:"John 1:28", prefix:"These things were done in Bethabara beyond Jordan, where John was", a:"baptizing", suffix:".", d:["preaching","dwelling","teaching"] },
        { r:"John 1:29", prefix:"The next day John seeth Jesus coming unto him, and saith, Behold the Lamb of God, which taketh away the sin of the", a:"world", suffix:".", d:["people","nations","earth"] },
        { r:"John 1:30", prefix:"After me cometh a man which is preferred before me: for he was", a:"before", suffix:"me.", d:["above","with","near"] },
        { r:"John 1:31", prefix:"And I knew him not: but that he should be made manifest to Israel, therefore am I come", a:"baptizing", suffix:"with water.", d:["preaching","teaching","calling"] },
        { r:"John 1:32", prefix:"And John bare record, saying, I saw the Spirit descending from heaven like a", a:"dove", suffix:", and it abode upon him.", d:["cloud","flame","bird"] },
        { r:"John 1:33", prefix:"Upon whom thou shalt see the Spirit descending, and remaining on him, the same is he which baptizeth with the Holy", a:"Ghost", suffix:".", d:["Spirit","fire","water"] },
        { r:"John 1:34", prefix:"And I saw, and bare record that this is the Son of", a:"God", suffix:".", d:["man","David","Israel"] },
        { r:"John 1:35", prefix:"Again the next day after John stood, and two of his", a:"disciples", suffix:";", d:["brethren","servants","followers"] },
        { r:"John 1:36", prefix:"And looking upon Jesus as he walked, he saith, Behold the Lamb of", a:"God", suffix:"!", d:["heaven","Israel","the Lord"] },
        { r:"John 1:37", prefix:"And the two disciples heard him speak, and they followed", a:"Jesus", suffix:".", d:["John","him","after"] },
        { r:"John 1:38", prefix:"Then Jesus turned, and saw them following, and saith unto them, What seek", a:"ye", suffix:"?", d:["thou","they","we"] },
        { r:"John 1:39", prefix:"He saith unto them, Come and see. They came and saw where he dwelt, and abode with him that day: for it was about the", a:"tenth", suffix:"hour.", d:["sixth","ninth","third"] },
        { r:"John 1:40", prefix:"One of the two which heard John speak, and followed him, was Andrew, Simon Peter's", a:"brother", suffix:".", d:["father","son","friend"] },
        { r:"John 1:41", prefix:"We have found the Messias, which is, being interpreted, the", a:"Christ", suffix:".", d:["King","Prophet","Saviour"] },
        { r:"John 1:42", prefix:"And he brought him to Jesus. And when Jesus beheld him, he said, Thou art Simon the son of Jona: thou shalt be called Cephas, which is by interpretation, A", a:"stone", suffix:".", d:["rock","disciple","Peter"] },
        { r:"John 1:43", prefix:"The day following Jesus would go forth into Galilee, and findeth Philip, and saith unto him, Follow", a:"me", suffix:".", d:["him","Jesus","thee"] },
        { r:"John 1:44", prefix:"Now Philip was of Bethsaida, the city of Andrew and", a:"Peter", suffix:".", d:["John","Philip","Nathanael"] },
        { r:"John 1:45", prefix:"We have found him, of whom Moses in the law, and the prophets, did write, Jesus of Nazareth, the son of", a:"Joseph", suffix:".", d:["David","Mary","God"] },
        { r:"John 1:46", prefix:"And Nathanael said unto him, Can there any good thing come out of Nazareth? Philip saith unto him, Come and", a:"see", suffix:".", d:["follow","believe","hear"] },
        { r:"John 1:47", prefix:"Jesus saw Nathanael coming to him, and saith of him, Behold an Israelite indeed, in whom is no", a:"guile", suffix:"!", d:["sin","deceit","doubt"] },
        { r:"John 1:48", prefix:"Nathanael saith unto him, Whence knowest thou me? Jesus answered and said unto him, Before that Philip called thee, when thou wast under the fig tree, I saw", a:"thee", suffix:".", d:["him","me","it"] },
        { r:"John 1:49", prefix:"Nathanael answered and saith unto him, Rabbi, thou art the Son of God; thou art the King of", a:"Israel", suffix:".", d:["the Jews","heaven","men"] },
        { r:"John 1:50", prefix:"Because I said unto thee, I saw thee under the fig tree, believest thou? thou shalt see greater things than", a:"these", suffix:".", d:["this","before","now"] },
        { r:"John 1:51", prefix:"Verily, verily, I say unto you, Hereafter ye shall see heaven open, and the angels of God ascending and descending upon the Son of", a:"man", suffix:".", d:["God","David","Joseph"] }
      ]
    },
    {
      id:"prayer", name:"The Lord's Prayer", r:"Matthew 6:9-13", subtitle:"After this manner therefore pray ye", tutorial:true,
      blanks:[
        { r:"Matthew 6:9", prefix:"After this manner therefore pray ye: Our", a:"Father", suffix:"which art in heaven,", d:["Master","King","Lord"] },
        { r:"Matthew 6:9", prefix:"Hallowed be thy", a:"name", suffix:".", d:["word","throne","glory"] },
        { r:"Matthew 6:9", prefix:"Our Father which art in", a:"heaven", suffix:", Hallowed be thy name.", d:["earth","glory","Zion"] },
        { r:"Matthew 6:10", prefix:"Thy", a:"kingdom", suffix:"come.", d:["power","church","spirit"] },
        { r:"Matthew 6:10", prefix:"Thy", a:"will", suffix:"be done in earth, as it is in heaven.", d:["word","law","work"] },
        { r:"Matthew 6:11", prefix:"Give us this day our daily", a:"bread", suffix:".", d:["meat","water","wine"] },
        { r:"Matthew 6:12", prefix:"And forgive us our", a:"debts", suffix:", as we forgive our debtors.", d:["sins","trespass","faults"] },
        { r:"Matthew 6:13", prefix:"And lead us not into", a:"temptation", suffix:",", d:["darkness","trial","sorrow"] },
        { r:"Matthew 6:13", prefix:"but deliver us from", a:"evil", suffix:":", d:["death","fear","wrath"] },
        { r:"Matthew 6:13", prefix:"For thine is the kingdom, and the power, and the glory, for ever.", a:"Amen", suffix:".", d:["Yea","Selah","Peace"] }
      ]
    }
  ];
  function chapter(id){
    let i = 0;
    for(; i < chapters.length; i++) if(chapters[i].id === id) return chapters[i];
    return chapters[0];
  }
  function shuffle(list){
    const a = list.slice();
    let i = a.length;
    while(i > 1){
      const j = Math.floor(Math.random() * i);
      i--;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function options(blank){
    if(!blank) return [];
    return shuffle([blank.a].concat((blank.d || []).slice(0, 3)));
  }
  function held(run){
    return !!(run && !run.tabletMiss && run.tabletIdx >= (run.tabletTotal || 0) && (run.tabletTotal || 0) > 0);
  }
  function recordOf(save, id){
    const pack = (save && save.tablets) || {};
    return pack[id] || { best:0, held:false };
  }
  function clampLevel(n){
    n = n|0;
    if(n < 1) return 1;
    if(n > 3) return 3;
    return n;
  }
  /* A chapter lives at one pace. The clock and the graduation ladder both
     read the chapter, not a replay level — II and III are other chapters. */
  function paceOf(ch){
    if(!ch || ch.tutorial) return 1;
    return clampLevel(ch.pace || 1);
  }
  function heldCountAtPace(save, pace){
    if(typeof save === "number" && (typeof pace === "object" || !pace)){
      const t = save; save = pace; pace = t;
    }
    let n = 0;
    chapters.forEach(function(ch){
      if(ch.tutorial || paceOf(ch) !== pace) return;
      if(recordOf(save, ch.id).held) n++;
    });
    return n;
  }
  function paceGateOpen(pace, save){
    if(typeof pace === "object" && (typeof save === "number" || typeof save === "undefined")){
      const t = pace; pace = save; save = t;
    }
    if(!pace || pace <= 1) return true;
    return heldCountAtPace(save, pace - 1) >= HOLDS_TO_OPEN;
  }
  function paceGateLabel(pace){
    return pace >= 3 ? "Hold 3 at Pace II to open" : "Hold 3 at Pace I to open";
  }
  function blankMs(level){
    return LEVEL_MS[clampLevel(level) - 1] || BLANK_MS;
  }
  function levelName(level){
    return LEVEL_NAME[clampLevel(level) - 1] || "I";
  }
  function unlocked(id, save){
    if(id === "prayer") return true;
    if(id === "psalm23") return true;
    if(id === "psalm91") return !!recordOf(save, "psalm23").held;
    if(id === "john1") return !!recordOf(save, "psalm91").held;
    const ch = chapter(id);
    if(!ch || ch.id !== id) return false;
    if(ch.tutorial) return true;
    if(ch.hall){
      /* Hall chapters climb the pace ladder: II needs 3 pace-I Holds. */
      if(!paceGateOpen(paceOf(ch), save)) return false;
      return !!recordOf(save, "john1").held;
    }
    /* Road chapters keep their site as the gate — a tablet stop must always
       be playable when the pilgrim walks onto it. */
    if(!ch.after) return false;
    if(recordOf(save, id).held) return true;
    const pilgrim = save && save.pilgrim;
    if(typeof Pilgrimage !== "undefined" && Pilgrimage.isCleared && Pilgrimage.isCleared(pilgrim, ch.after)) return true;
    if(typeof Pilgrimage !== "undefined" && Pilgrimage.currentSite){
      const cur = Pilgrimage.currentSite(pilgrim);
      if(cur && cur.id === id) return true;
    }
    return false;
  }
  function unlockLabel(id, save){
    if(id === "psalm91") return "Hold Psalm 23 to open";
    if(id === "john1") return "Hold Psalm 91 to open";
    const ch = chapter(id);
    if(!ch || ch.id !== id) return "Open";
    if(ch.tutorial) return "Open";
    if(ch.after) return "Clear " + (ch.afterName || ch.after) + " to open";
    if(ch.hall && save && !recordOf(save, "john1").held) return "Hold John 1 to open";
    return paceGateLabel(paceOf(ch));
  }
  /* A run always starts at the chapter's own pace; the ladder is across
     chapters, so there is no per-chapter replay level to pick. */
  function pickLevel(id){
    return paceOf(chapter(id));
  }
  function holdKick(id, save){
    if(id === "psalm23") return "Pace I held. Psalm 91 is open.";
    if(id === "psalm91") return "Pace I held. John 1 is open.";
    if(id === "john1") return "Pace I held. The Hall is open.";
    const ch = chapter(id);
    const pace = paceOf(ch);
    if(pace === 1) return paceGateOpen(2, save) ? "Pace II is open." : "Pace I held. Pace II opens after 3 Holds.";
    if(pace === 2) return paceGateOpen(3, save) ? "Pace III is open." : "Pace II held. Pace III opens after 3 Holds.";
    return "The manuscript held";
  }
  return {
    BLANK_MS: BLANK_MS,
    LEVEL_MS: LEVEL_MS,
    HOLDS_TO_OPEN: HOLDS_TO_OPEN,
    chapters: chapters,
    canon: [],
    hall: [],
    more: [],
    chapter: chapter,
    options: options,
    held: held,
    unlocked: unlocked,
    unlockLabel: unlockLabel,
    recordOf: recordOf,
    paceOf: paceOf,
    heldCountAtPace: heldCountAtPace,
    paceGateOpen: paceGateOpen,
    paceGateLabel: paceGateLabel,
    clampLevel: clampLevel,
    blankMs: blankMs,
    levelName: levelName,
    pickLevel: pickLevel,
    holdKick: holdKick
  };
})();
if(typeof module !== "undefined") module.exports = { Tablets: Tablets };
