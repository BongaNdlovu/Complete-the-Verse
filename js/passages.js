const PASSAGES = [
{b:"Psalms",r:"Psalm 23:1-2",t:2,parts:[
  "The LORD is my ",{a:"shepherd",d:["keeper","guardian","strong tower"]},
  "; I shall not ",{a:"want",d:["fear","fall","stray"]},
  ". He maketh me to lie down in green pastures: he leadeth me beside the ",{a:"still waters",d:["quiet waters","living waters","waters of rest"]},"."]},

{b:"John",r:"John 3:16",t:1,parts:[
  "For God so loved the world, that he gave his ",{a:"only begotten Son",d:["well beloved Son","holy anointed Son","first begotten Son"]},
  ", that whosoever believeth in him should not ",{a:"perish",d:["be lost","be condemned","fall away"]},
  ", but have ",{a:"everlasting life",d:["eternal glory","life eternal","life everlasting"]},"."]},

{b:"Genesis",r:"Genesis 1:1-2",t:2,parts:[
  "In the beginning God created the ",{a:"heaven and the earth",d:["heavens and the earth","earth and the heaven","heavens and earth"]},
  ". And the earth was ",{a:"without form, and void",d:["without shape, and void","formless, and empty","without form, and dark"]},
  /* qaOk: "face of the deep" is lifted from earlier in the passage on purpose —
     it is exactly the phrase a half-remembering reader reaches for here. */
  "; and darkness was upon the face of the deep. And the Spirit of God moved upon the ",{a:"face of the waters",d:["face of the deep","waters of the deep","surface of the waters"],qaOk:["recycled"]},"."]},

{b:"Psalms",r:"Psalm 1:1",t:3,parts:[
  "Blessed is the man that walketh not in the ",{a:"counsel of the ungodly",d:["council of the ungodly","counsel of the wicked","way of the ungodly"]},
  ", nor standeth in the ",{a:"way of sinners",d:["path of sinners","seat of sinners","way of the wicked"]},
  ", nor sitteth in the ",{a:"seat of the scornful",d:["seat of the scoffers","place of the scornful","chair of the scornful"]},"."]},

{b:"Isaiah",r:"Isaiah 40:31",t:2,parts:[
  "But they that wait upon the LORD shall ",{a:"renew their strength",d:["restore their strength","renew their courage","regain their strength"]},
  "; they shall mount up with ",{a:"wings as eagles",d:["wings like eagles","wings as the eagle","eagles' wings"]},
  "; they shall run, and not be weary; and they shall walk, and not ",{a:"faint",d:["fail","fall","tire"]},"."]},

{b:"Proverbs",r:"Proverbs 3:5-6",t:1,parts:[
  "Trust in the LORD with ",{a:"all thine heart",d:["all thy heart","thy whole heart","all thine own heart"]},
  "; and lean not unto ",{a:"thine own understanding",d:["thine own wisdom","thy own understanding","thine own counsel"]},
  ". In all thy ways acknowledge him, and he shall ",{a:"direct thy paths",d:["make straight thy paths","direct thy steps","establish thy paths"]},"."]},

{b:"Romans",r:"Romans 8:28",t:3,parts:[
  "And we know that all things ",{a:"work together for good",d:["work together for glory","work all things for good","turn together for good"]},
  " to them that ",{a:"love God",d:["fear God","serve God","seek God"]},
  ", to them who are the called according to ",{a:"his purpose",d:["his good pleasure","his counsel","his promise"]},"."]},

{b:"Matthew",r:"Matthew 5:3-4",t:2,parts:[
  "Blessed are the ",{a:"poor in spirit",d:["pure in spirit","meek in spirit","lowly in spirit"]},
  ": for theirs is the ",{a:"kingdom of heaven",d:["kingdom of God","kingdom of the Father","house of heaven"]},
  ". Blessed are they that mourn: for they shall be ",{a:"comforted",d:["consoled","made glad","lifted up"]},"."]},

{b:"Psalms",r:"Psalm 46:1-2",t:3,parts:[
  "God is our ",{a:"refuge and strength",d:["rock and refuge","strength and shield","refuge and fortress"]},
  ", a ",{a:"very present help",d:["ever present help","sure and present help","very present hope"]},
  " in trouble. Therefore will not we fear, though the earth be removed, and though the mountains be carried into the ",{a:"midst of the sea",d:["depths of the sea","heart of the sea","midst of the waters"]},"."]},

{b:"1 Corinthians",r:"1 Corinthians 13:4",t:3,parts:[
  "Charity ",{a:"suffereth long",d:["beareth long","endureth long","suffereth all"]},
  ", and is kind; charity ",{a:"envieth not",d:["boasteth not","coveteth not","provoketh not"]},
  "; charity vaunteth not itself, is not ",{a:"puffed up",d:["lifted up","made proud","exalted"]},"."]},

{b:"Ephesians",r:"Ephesians 6:11-12",t:4,parts:[
  "Put on the ",{a:"whole armour of God",d:["full armour of God","whole armour of light","armour of righteousness"]},
  ", that ye may be able to stand against the ",{a:"wiles of the devil",d:["works of the devil","snares of the devil","ways of the devil"]},
  ". For we wrestle not against ",{a:"flesh and blood",d:["blood and flesh","flesh and bone","men of flesh"]},
  ", but against principalities, against powers."]},

{b:"Philippians",r:"Philippians 4:6-7",t:3,parts:[
  "Be careful for nothing; but in every thing by ",{a:"prayer and supplication",d:["prayer and thanksgiving","supplication and fasting","prayer and petition"]},
  " with thanksgiving let your requests be made known unto God. And the ",{a:"peace of God",d:["peace of Christ","grace of God","comfort of God"]},
  ", which ",{a:"passeth all understanding",d:["surpasseth all understanding","passeth all knowledge","passeth understanding"]},
  ", shall keep your hearts and minds through Christ Jesus."]},

{b:"Psalms",r:"Psalm 91:1-2",t:4,parts:[
  "He that dwelleth in the ",{a:"secret place of the most High",d:["secret place of the Almighty","holy place of the most High","hidden place of the most High"]},
  " shall abide under the ",{a:"shadow of the Almighty",d:["shadow of his wings","shelter of the Almighty","shadow of the most High"]},
  ". I will say of the LORD, He is my ",{a:"refuge and my fortress",d:["fortress and my refuge","refuge and my rock","shield and my fortress"]},
  ": my God; in him will I trust."]},

{b:"John",r:"John 14:6",t:1,parts:[
  "Jesus saith unto him, I am ",{a:"the way",d:["the door","the light","the vine"]},
  ", the truth, and ",{a:"the life",d:["the light","the resurrection","the living way"]},
  ": no man cometh unto the Father, ",{a:"but by me",d:["except by me","save through me","but through me"]},"."]},

{b:"Joshua",r:"Joshua 1:9",t:2,parts:[
  "Have not I commanded thee? Be strong and ",{a:"of a good courage",d:["of good cheer","of a good spirit","of great courage"]},
  "; be not afraid, neither be thou ",{a:"dismayed",d:["discouraged","confounded","troubled"]},
  ": for the LORD thy God is with thee ",{a:"whithersoever thou goest",d:["wheresoever thou goest","whithersoever thou dwellest","in all thy ways"]},"."]},

{b:"Hebrews",r:"Hebrews 11:1",t:4,parts:[
  "Now faith is the ",{a:"substance",d:["assurance","foundation","evidence"]},
  " of things hoped for, the ",{a:"evidence",d:["substance","witness","proof"]},
  " of things ",{a:"not seen",d:["unseen","not yet come","not known"]},"."]},

{b:"Revelation",r:"Revelation 21:4",t:3,parts:[
  "And God shall ",{a:"wipe away all tears",d:["wipe away every tear","take away all tears","wipe all tears away"]},
  " from their eyes; and there shall be ",{a:"no more death",d:["no more sorrow","death no more","no more dying"]},
  ", neither sorrow, nor crying, neither shall there be any more pain: for the ",{a:"former things are passed away",d:["former things are done away","first things are passed away","former things have passed"]},"."]},

{b:"Psalms",r:"Psalm 51:10-11",t:3,parts:[
  "Create in me a ",{a:"clean heart",d:["pure heart","new heart","whole heart"]},
  ", O God; and renew a ",{a:"right spirit",d:["righteous spirit","steadfast spirit","willing spirit"]},
  " within me. Cast me not away from thy presence; and take not ",{a:"thy holy spirit",d:["thy Holy Ghost","thy spirit of grace","thine own spirit"]},
  " from me."]},

{b:"Isaiah",r:"Isaiah 53:5",t:4,parts:[
  /* qaOk: the two blanks deliberately offer each other's answer. Transposing
     "transgressions" and "iniquities" is the classic error in this verse. */
  "But he was wounded for ",{a:"our transgressions",d:["our iniquities","our trespasses","our rebellions"],qaOk:["recycled"]},
  ", he was bruised for ",{a:"our iniquities",d:["our transgressions","our offences","our wickedness"],qaOk:["recycled"]},
  ": the chastisement of our peace was upon him; and with his stripes ",{a:"we are healed",d:["we are made whole","are we healed","we are redeemed"]},"."]},

{b:"Matthew",r:"Matthew 6:9-10",t:2,parts:[
  "Our Father which art in heaven, ",{a:"Hallowed be thy name",d:["Holy be thy name","Blessed be thy name","Hallowed be thy word"]},
  ". ",{a:"Thy kingdom come",d:["Thy kingdom reign","Let thy kingdom come","Thy kingdom stand"]},
  ". Thy will be done in earth, ",{a:"as it is in heaven",d:["even as in heaven","as in the heavens","as it is above"]},"."]},

{b:"2 Timothy",r:"2 Timothy 1:7",t:2,parts:[
  "For God hath not given us the ",{a:"spirit of fear",d:["spirit of bondage","spirit of dread","spirit of weakness"]},
  "; but of ",{a:"power",d:["might","strength","glory"]},
  ", and of love, and of a ",{a:"sound mind",d:["sober mind","steadfast mind","quiet mind"]},"."]},

{b:"James",r:"James 1:2-3",t:4,parts:[
  "My brethren, count it ",{a:"all joy",d:["great joy","pure joy","all gladness"]},
  " when ye fall into ",{a:"divers temptations",d:["divers tribulations","many temptations","divers afflictions"]},
  "; Knowing this, that the trying of your faith ",{a:"worketh patience",d:["worketh endurance","bringeth patience","worketh perfection"]},"."]},

{b:"Galatians",r:"Galatians 5:22-23",t:3,parts:[
  "But the fruit of the Spirit is ",{a:"love, joy, peace",d:["joy, love, peace","love, peace, joy","love, hope, peace"]},
  ", ",{a:"longsuffering",d:["forbearance","patience","gentleness"]},
  ", gentleness, goodness, faith, Meekness, temperance: against such there is ",{a:"no law",d:["no judgment","no condemnation","no commandment"]},"."]},

{b:"Romans",r:"Romans 12:2",t:4,parts:[
  "And be not ",{a:"conformed to this world",d:["conformed to the world","fashioned to this world","yoked to this world"]},
  ": but be ye transformed by the ",{a:"renewing of your mind",d:["renewal of your mind","washing of your mind","renewing of your heart"]},
  ", that ye may prove what is that good, and acceptable, and ",{a:"perfect, will of God",d:["holy, will of God","perfect, way of God","complete, will of God"]},"."]},

{b:"Psalms",r:"Psalm 139:13-14",t:5,parts:[
  "For thou hast ",{a:"possessed my reins",d:["formed my inward parts","possessed my heart","fashioned my reins"]},
  ": thou hast covered me in my ",{a:"mother's womb",d:["mother's arms","mother's house","secret place"]},
  ". I will praise thee; for I am ",{a:"fearfully and wonderfully made",d:["wonderfully and fearfully made","fearfully and marvellously made","fearfully and wondrously made"]},
  ": marvellous are thy works."]},

{b:"Ecclesiastes",r:"Ecclesiastes 3:1-2",t:3,parts:[
  "To every thing there is ",{a:"a season",d:["a time","an hour","a due season"]},
  ", and a time to every purpose ",{a:"under the heaven",d:["under the sun","under heaven","beneath the heavens"]},
  ": A time to be born, and ",{a:"a time to die",d:["a time to perish","a time to depart","a time to be gathered"]},
  "; a time to plant, and a time to pluck up that which is planted."]},

{b:"Matthew",r:"Matthew 28:19-20",t:4,parts:[
  "Go ye therefore, and ",{a:"teach all nations",d:["preach to all nations","make disciples of all nations","teach every nation"]},
  ", baptizing them in the name of the Father, and of the Son, and of the ",{a:"Holy Ghost",d:["Holy Spirit","Spirit of God","Comforter"]},
  ": Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the ",{a:"end of the world",d:["end of the age","ends of the earth","end of all things"]},"."]}
];
/* ids and .blanks are assigned in js/bank.js, alongside the verse ids. */

