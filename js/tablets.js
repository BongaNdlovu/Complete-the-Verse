const Tablets = (function(){
  const BLANK_MS = 6500;
  const chapters = [
    {
      id:"psalm23", name:"Psalm 23", r:"Psalm 23:1-6", subtitle:"The LORD is my shepherd",
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
      id:"psalm91", name:"Psalm 91", r:"Psalm 91:1-11", subtitle:"The secret place of the most High",
      blanks:[
        { r:"Psalm 91:1", prefix:"He that dwelleth in the secret place of the most High shall abide under the shadow of the", a:"Almighty", suffix:".", d:["Father","Rock","King"] },
        { r:"Psalm 91:2", prefix:"I will say of the LORD, He is my refuge and my", a:"fortress", suffix:": my God; in him will I trust.", d:["strength","shield","tower"] },
        { r:"Psalm 91:3", prefix:"Surely he shall deliver thee from the snare of the", a:"fowler", suffix:", and from the noisome pestilence.", d:["hunter","wicked","lion"] },
        { r:"Psalm 91:4", prefix:"He shall cover thee with his", a:"feathers", suffix:", and under his wings shalt thou trust:", d:["hands","mantle","shadow"] },
        { r:"Psalm 91:4", prefix:"his truth shall be thy shield and", a:"buckler", suffix:".", d:["helmet","sword","rock"] },
        { r:"Psalm 91:5", prefix:"Thou shalt not be afraid for the terror by", a:"night", suffix:"; nor for the arrow that flieth by day;", d:["storm","death","fire"] },
        { r:"Psalm 91:7", prefix:"A thousand shall fall at thy side, and ten thousand at thy", a:"right", suffix:"hand; but it shall not come nigh thee.", d:["left","own","other"] },
        { r:"Psalm 91:11", prefix:"For he shall give his", a:"angels", suffix:"charge over thee, to keep thee in all thy ways.", d:["spirits","hosts","saints"] }
      ]
    },
    {
      id:"john1", name:"John 1", r:"John 1:1-5", subtitle:"In the beginning was the Word",
      blanks:[
        { r:"John 1:1", prefix:"In the beginning was the", a:"Word", suffix:", and the Word was with God, and the Word was God.", d:["Light","Law","Voice"] },
        { r:"John 1:2", prefix:"The same was in the beginning with", a:"God", suffix:".", d:["man","heaven","us"] },
        { r:"John 1:3", prefix:"All things were made by him; and without him was not any thing", a:"made", suffix:"that was made.", d:["done","seen","formed"] },
        { r:"John 1:4", prefix:"In him was life; and the life was the light of", a:"men", suffix:".", d:["God","heaven","angels"] },
        { r:"John 1:5", prefix:"And the light shineth in darkness; and the darkness comprehended it", a:"not", suffix:".", d:["well","fully","ever"] }
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
  function unlocked(id, save){
    if(id === "psalm23") return true;
    if(id === "psalm91") return !!recordOf(save, "psalm23").held;
    if(id === "john1") return !!recordOf(save, "psalm91").held;
    return false;
  }
  function unlockLabel(id){
    if(id === "psalm91") return "Hold Psalm 23 to open";
    if(id === "john1") return "Hold Psalm 91 to open";
    return "Open";
  }
  return {
    BLANK_MS: BLANK_MS,
    chapters: chapters,
    chapter: chapter,
    options: options,
    held: held,
    unlocked: unlocked,
    unlockLabel: unlockLabel,
    recordOf: recordOf
  };
})();
if(typeof module !== "undefined") module.exports = { Tablets: Tablets };
