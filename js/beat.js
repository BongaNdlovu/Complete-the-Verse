const Beat = (function(){
  const ROOT = "assets/beats/goliath/";
  function url(file){ return ROOT + file; }
  const CLOCK_MS = 40000;
  const NAME = "the LORD of hosts, the God of the armies of Israel";
  const cinemaA = [
    { still:"01.jpeg", vo:"vo-01-valley.mp3", sfx:null, fx:"wind",
      line:"The valley of Elah. Two camps. Forty days of this." },
    { still:"02.jpeg", vo:"vo-02-ridge.mp3", sfx:null, fx:"wind",
      line:"Saul's men hold the ridge. They do not come down." },
    { still:"03.jpeg", vo:"vo-03-defy.mp3", sfx:null, fx:"run",
      line:"I defy the armies of Israel this day. Give me a man, that we may fight together." },
    { still:"04.jpeg", vo:"vo-04-again.mp3", sfx:null, fx:"breath",
      line:"He has come out again." },
    { still:"05.jpeg", vo:null, sfx:"sfx-05-crowd.mp3", fx:"wind", line:"" }
  ];
  const cinemaB = [
    { still:"06.jpeg", vo:"vo-06-youth.mp3", sfx:"sfx-06-wind-shield.mp3", fx:"wind",
      line:"And when the Philistine looked about, and saw David, he disdained him: for he was but a youth." },
    { still:"07.jpeg", vo:null, sfx:"sfx-07-breath.mp3", fx:"breath", line:"" },
    { still:"08.jpeg", vo:"vo-08-staves.mp3", sfx:null, fx:"run",
      line:"Am I a dog, that thou comest to me with staves?" },
    { still:"09.jpeg", vo:"vo-09-flesh.mp3", sfx:null, fx:"breath",
      line:"Come to me, and I will give thy flesh unto the fowls of the air, and to the beasts of the field." },
    { still:"10.jpeg", vo:"vo-10-name.mp3", sfx:"sfx-10-thud.mp3", sfxFirst:true, fx:"run",
      line:"I come to thee in the name of the LORD of hosts, the God of the armies of Israel, whom thou hast defied." }
  ];
  const questions = [
    {
      id:"beat-q1", kind:"pick", plate:"question.png", sfx:null, fx:"wind",
      r:"1 Samuel 17:1-2",
      stem:"The Philistines gathered themselves together at Shochoh, which belongeth to Judah, and pitched ______. And Saul and the men of Israel were gathered together, and pitched ______.",
      choices:[
        "in the valley of Elah / between Shochoh and Azekah",
        "between Shochoh and Azekah, in Ephes-dammim / in the valley of Elah",
        "at Gath / at Mizpah",
        "at Ekron / in the valley of Jezreel"
      ],
      a:"between Shochoh and Azekah, in Ephes-dammim / in the valley of Elah"
    },
    {
      id:"beat-q2", kind:"pick", plate:"03.jpeg", sfx:null, fx:"wind",
      r:"1 Samuel 17:5-7",
      stem:"Goliath's spear's head weighed:",
      choices:[
        "600 shekels of iron",
        "5,000 shekels of brass",
        "300 shekels of iron",
        "600 shekels of brass"
      ],
      a:"600 shekels of iron"
    },
    {
      id:"beat-q3", kind:"pick", plate:"05.jpeg", sfx:"sfx-05-crowd.mp3", fx:"wind",
      r:"1 Samuel 17:17-18",
      stem:"Jesse sends an ephah of parched corn, ten loaves, and ten cheeses. Who gets the cheeses?",
      choices:[
        "David's brethren",
        "Saul",
        "the captain of their thousand",
        "the keeper of the carriage"
      ],
      a:"the captain of their thousand"
    },
    {
      id:"beat-q4", kind:"order", plate:"06.jpeg", sfx:"sfx-06-wind-shield.mp3", fx:"wind",
      r:"1 Samuel 17:20-22",
      stem:"Put David's morning in verse order.",
      order:[
        "Left the sheep with a keeper",
        "Took, and went, as Jesse had commanded him",
        "Left his carriage in the hand of the keeper of the carriage",
        "Ran into the army, and came and saluted his brethren"
      ]
    },
    {
      id:"beat-q5", kind:"cloze", plate:"07.jpeg", sfx:"sfx-07-breath.mp3", fx:"breath",
      r:"1 Samuel 17:28",
      stem:"Why camest thou down hither? and with whom hast thou left ______? I know thy pride, and the naughtiness of thine heart; for thou art come down ______.",
      blanks:["those few sheep in the wilderness","that thou mightest see the battle"],
      bank:["those few sheep in the wilderness","that thou mightest see the battle","Saul","Abner","Goliath","to see the battle"]
    },
    {
      id:"beat-q6", kind:"pick", plate:"08.jpeg", sfx:null, fx:"run",
      r:"1 Samuel 17:37",
      stem:"The LORD that delivered me out of the paw of the lion, and out of the paw of the bear, he will deliver me ______.",
      choices:[
        "out of the hand of this Philistine",
        "out of the armies of the uncircumcised",
        "out of the giant of Gath",
        "out of the sword of Goliath"
      ],
      a:"out of the hand of this Philistine"
    },
    {
      id:"beat-q7", kind:"multi", plate:"10.jpeg", sfx:"sfx-10-thud.mp3", fx:"run",
      r:"1 Samuel 17:40",
      stem:"What doth David take toward the Philistine? Select all that apply.",
      items:[
        { id:"helm", t:"Saul's helmet of brass", on:false },
        { id:"mail", t:"Saul's coat of mail", on:false },
        { id:"staff", t:"His staff", on:true },
        { id:"stones", t:"Five smooth stones out of the brook", on:true },
        { id:"sling", t:"His sling", on:true },
        { id:"sword", t:"A sword of his own", on:false }
      ]
    },
    {
      id:"beat-q8", kind:"pick", plate:"12.jpeg", sfx:null, fx:"run",
      r:"1 Samuel 17:43",
      stem:"Am I a dog, that thou comest to me with staves?",
      choices:["Eliab","Saul","Goliath","Abner"],
      a:"Goliath"
    },
    {
      id:"beat-q9", kind:"pick", plate:"13.jpeg", sfx:null, fx:"breath",
      r:"1 Samuel 17:45",
      stem:"Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee in the name of ______.",
      choices:[
        NAME,
        "the LORD my shepherd",
        "the God of Abraham, Isaac, and Jacob",
        "the LORD that sitteth between the cherubims"
      ],
      a:NAME
    },
    {
      id:"beat-q10", kind:"pick", plate:"14.jpeg", sfx:null, fx:"run",
      r:"1 Samuel 17:46",
      stem:"Why doth David say this fight is happening?",
      choices:[
        "that all the earth may know that there is a God in Israel",
        "that Saul may know I am fit to be king",
        "that my brethren may see I am no longer a child",
        "that Gath may become subject to Bethlehem"
      ],
      a:"that all the earth may know that there is a God in Israel"
    },
    {
      id:"beat-q11", kind:"pick", plate:"15.jpeg", sfx:null, fx:"run",
      r:"1 Samuel 17:50-51",
      stem:"After the stone hits, what is true?",
      choices:[
        "David's own sword was already drawn",
        "David ran, and stood upon the Philistine, and took his sword, and drew it out of the sheath thereof, and slew him, and cut off his head therewith",
        "The Israelites reached Goliath first and finished him",
        "David left the body and took only the shield to Saul"
      ],
      a:"David ran, and stood upon the Philistine, and took his sword, and drew it out of the sheath thereof, and slew him, and cut off his head therewith"
    },
    {
      id:"beat-q12", kind:"match", plate:"11.jpeg", sfx:null, fx:"wind",
      r:"1 Samuel 17:54",
      stem:"Match both destinations.",
      rows:[
        { id:"head", prompt:"Head of Goliath", a:"Jerusalem" },
        { id:"armour", prompt:"Goliath's armour", a:"David's tent" }
      ],
      scatter:["Jerusalem","David's tent","Saul's house","Nob","the tabernacle","the valley of Elah"]
    }
  ];
  function held(run){
    return !!(run && run.correct === questions.length && !(run.beatMiss));
  }
  function multiKey(item){
    return item.items.filter(function(x){ return x.on; }).map(function(x){ return x.id; }).sort().join(",");
  }
  return {
    CLOCK_MS: CLOCK_MS,
    bed: "fearOfTheDark",
    url: url,
    cinemaA: cinemaA,
    cinemaB: cinemaB,
    questions: questions,
    held: held,
    multiKey: multiKey
  };
})();
if(typeof module !== "undefined") module.exports = { Beat: Beat };
