(function(){
  const HALL = [
    {
      id:"genesis3", name:"Genesis 3", r:"Genesis 3", subtitle:"Hast thou eaten of the tree", hall:true, testament:"ot",
      blanks:[
        { r:"Genesis 3:1", prefix:"Now the serpent was more", a:"subtil", suffix:"than any beast of the field which the LORD God had made.", d:["subtle","crafty","wise"] },
        { r:"Genesis 3:4", prefix:"And the serpent said unto the woman, Ye shall not surely", a:"die", suffix:":", d:["fall","sin","eat"] },
        { r:"Genesis 3:6", prefix:"she took of the fruit thereof, and did eat, and gave also unto her husband with her; and he did", a:"eat", suffix:".", d:["drink","take","see"] },
        { r:"Genesis 3:7", prefix:"And the eyes of them both were opened, and they knew that they were", a:"naked", suffix:";", d:["ashamed","afraid","lost"] },
        { r:"Genesis 3:15", prefix:"it shall bruise thy head, and thou shalt bruise his", a:"heel", suffix:".", d:["hand","foot","side"] },
        { r:"Genesis 3:19", prefix:"for dust thou art, and unto dust shalt thou", a:"return", suffix:".", d:["go","rest","sleep"] },
        { r:"Genesis 3:23", prefix:"Therefore the LORD God sent him forth from the garden of", a:"Eden", suffix:", to till the ground from whence he was taken.", d:["Haran","Zion","Canaan"] },
        { r:"Genesis 3:24", prefix:"So he drove out the man; and he placed at the east of the garden of Eden Cherubims, and a flaming", a:"sword", suffix:"which turned every way,", d:["spear","fire","gate"] }
      ]
    },
    {
      id:"exodus14", name:"Exodus 14", r:"Exodus 14", subtitle:"Stand still, and see the salvation of the LORD", hall:true, testament:"ot",
      blanks:[
        { r:"Exodus 14:13", prefix:"And Moses said unto the people, Fear ye not, stand still, and see the salvation of the", a:"LORD", suffix:",", d:["Most High","Almighty","God"] },
        { r:"Exodus 14:14", prefix:"The LORD shall fight for you, and ye shall hold your", a:"peace", suffix:".", d:["tongue","place","rest"] },
        { r:"Exodus 14:16", prefix:"But lift thou up thy rod, and stretch out thine hand over the", a:"sea", suffix:", and divide it:", d:["river","deep","waters"] },
        { r:"Exodus 14:21", prefix:"and the LORD caused the sea to go back by a strong east", a:"wind", suffix:"all that night,", d:["blast","storm","breath"] },
        { r:"Exodus 14:22", prefix:"And the children of Israel went into the midst of the sea upon the dry ground: and the waters were a", a:"wall", suffix:"unto them on their right hand, and on their left.", d:["hedge","bank","tower"] },
        { r:"Exodus 14:27", prefix:"and the LORD overthrew the Egyptians in the midst of the", a:"sea", suffix:".", d:["deep","flood","wave"] },
        { r:"Exodus 14:28", prefix:"and there remained not so much as one of", a:"them", suffix:".", d:["us","him","these"] },
        { r:"Exodus 14:31", prefix:"And Israel saw that great work which the LORD did upon the Egyptians: and the people feared the LORD, and believed the LORD, and his servant", a:"Moses", suffix:".", d:["Aaron","Joshua","Joseph"] }
      ]
    },
    {
      id:"ruth1", name:"Ruth 1", r:"Ruth 1", subtitle:"Whither thou goest, I will go", hall:true, testament:"ot",
      blanks:[
        { r:"Ruth 1:16", prefix:"And Ruth said, Intreat me not to leave thee, or to return from following after", a:"thee", suffix:":", d:["him","us","her"] },
        { r:"Ruth 1:16", prefix:"for whither thou goest, I will", a:"go", suffix:";", d:["stay","come","walk"] },
        { r:"Ruth 1:16", prefix:"and where thou lodgest, I will", a:"lodge", suffix:":", d:["dwell","rest","abide"] },
        { r:"Ruth 1:16", prefix:"thy people shall be my people, and thy God my", a:"God", suffix:":", d:["LORD","King","help"] },
        { r:"Ruth 1:17", prefix:"Where thou diest, will I", a:"die", suffix:", and there will I be buried:", d:["lie","sleep","rest"] },
        { r:"Ruth 1:17", prefix:"the LORD do so to me, and more also, if ought but death part thee and", a:"me", suffix:".", d:["thee","us","her"] },
        { r:"Ruth 1:20", prefix:"And she said unto them, Call me not Naomi, call me", a:"Mara", suffix:": for the Almighty hath dealt very bitterly with me.", d:["Rachel","Hannah","Sarah"] },
        { r:"Ruth 1:21", prefix:"I went out full, and the LORD hath brought me home again", a:"empty", suffix:":", d:["poor","bare","alone"] }
      ]
    },
    {
      id:"job38", name:"Job 38", r:"Job 38", subtitle:"Where wast thou when I laid the foundations", hall:true, testament:"ot",
      blanks:[
        { r:"Job 38:2", prefix:"Who is this that darkeneth counsel by words without", a:"knowledge", suffix:"?", d:["wisdom","understanding","truth"] },
        { r:"Job 38:4", prefix:"Where wast thou when I laid the foundations of the", a:"earth", suffix:"? declare, if thou hast understanding.", d:["world","deep","heavens"] },
        { r:"Job 38:7", prefix:"When the morning stars sang together, and all the sons of God shouted for", a:"joy", suffix:"?", d:["praise","glory","wonder"] },
        { r:"Job 38:8", prefix:"Or who shut up the sea with", a:"doors", suffix:", when it brake forth, as if it had issued out of the womb?", d:["bars","gates","bonds"] },
        { r:"Job 38:11", prefix:"And said, Hitherto shalt thou come, but no", a:"further", suffix:": and here shall thy proud waves be stayed?", d:["more","beyond","longer"] },
        { r:"Job 38:22", prefix:"Hast thou entered into the treasures of the", a:"snow", suffix:"? or hast thou seen the treasures of the hail,", d:["rain","ice","frost"] },
        { r:"Job 38:31", prefix:"Canst thou bind the sweet influences of Pleiades, or loose the bands of", a:"Orion", suffix:"?", d:["Arcturus","Mazzaroth","the Bear"] },
        { r:"Job 38:41", prefix:"Who provideth for the raven his food? when his young ones cry unto", a:"God", suffix:", they wander for lack of meat.", d:["the LORD","heaven","man"] }
      ]
    },
    {
      id:"psalm1", name:"Psalm 1", r:"Psalm 1", subtitle:"Blessed is the man", hall:true, testament:"ot",
      blanks:[
        { r:"Psalm 1:1", prefix:"Blessed is the man that walketh not in the counsel of the", a:"ungodly", suffix:",", d:["wicked","sinners","proud"] },
        { r:"Psalm 1:2", prefix:"But his delight is in the law of the", a:"LORD", suffix:"; and in his law doth he meditate day and night.", d:["Most High","Almighty","God"] },
        { r:"Psalm 1:3", prefix:"And he shall be like a tree planted by the rivers of", a:"water", suffix:",", d:["life","Eden","peace"] },
        { r:"Psalm 1:3", prefix:"his leaf also shall not", a:"wither", suffix:"; and whatsoever he doeth shall prosper.", d:["fail","fade","fall"] },
        { r:"Psalm 1:4", prefix:"The ungodly are not so: but are like the", a:"chaff", suffix:"which the wind driveth away.", d:["dust","stubble","ash"] },
        { r:"Psalm 1:5", prefix:"Therefore the ungodly shall not stand in the", a:"judgment", suffix:", nor sinners in the congregation of the righteous.", d:["fire","gate","day"] },
        { r:"Psalm 1:6", prefix:"For the LORD knoweth the way of the", a:"righteous", suffix:":", d:["just","holy","meek"] },
        { r:"Psalm 1:6", prefix:"but the way of the ungodly shall", a:"perish", suffix:".", d:["fail","end","fall"] }
      ]
    },
    {
      id:"psalm121", name:"Psalm 121", r:"Psalm 121", subtitle:"I will lift up mine eyes unto the hills", hall:true, testament:"ot",
      blanks:[
        { r:"Psalm 121:1", prefix:"I will lift up mine eyes unto the hills, from whence cometh my", a:"help", suffix:".", d:["hope","strength","peace"] },
        { r:"Psalm 121:2", prefix:"My help cometh from the LORD, which made heaven and", a:"earth", suffix:".", d:["sea","all","man"] },
        { r:"Psalm 121:3", prefix:"He will not suffer thy foot to be moved: he that keepeth thee will not", a:"slumber", suffix:".", d:["sleep","fail","leave"] },
        { r:"Psalm 121:4", prefix:"Behold, he that keepeth Israel shall neither slumber nor", a:"sleep", suffix:".", d:["rest","fail","tire"] },
        { r:"Psalm 121:5", prefix:"The LORD is thy keeper: the LORD is thy shade upon thy right", a:"hand", suffix:".", d:["side","arm","path"] },
        { r:"Psalm 121:6", prefix:"The sun shall not smite thee by day, nor the moon by", a:"night", suffix:".", d:["dark","even","watch"] },
        { r:"Psalm 121:7", prefix:"The LORD shall preserve thee from all", a:"evil", suffix:": he shall preserve thy soul.", d:["harm","fear","death"] },
        { r:"Psalm 121:8", prefix:"The LORD shall preserve thy going out and thy", a:"coming", suffix:"in from this time forth, and even for evermore.", d:["rising","walking","standing"] }
      ]
    },
    {
      id:"ecclesiastes3", name:"Ecclesiastes 3", r:"Ecclesiastes 3", subtitle:"To every thing there is a season", hall:true, testament:"ot",
      blanks:[
        { r:"Ecclesiastes 3:1", prefix:"To every thing there is a season, and a time to every purpose under the", a:"heaven", suffix:":", d:["sun","earth","sky"] },
        { r:"Ecclesiastes 3:2", prefix:"A time to be born, and a time to", a:"die", suffix:";", d:["live","sleep","end"] },
        { r:"Ecclesiastes 3:4", prefix:"A time to weep, and a time to", a:"laugh", suffix:";", d:["sing","dance","rejoice"] },
        { r:"Ecclesiastes 3:4", prefix:"a time to mourn, and a time to", a:"dance", suffix:";", d:["sing","feast","leap"] },
        { r:"Ecclesiastes 3:7", prefix:"A time to keep silence, and a time to", a:"speak", suffix:";", d:["cry","pray","teach"] },
        { r:"Ecclesiastes 3:8", prefix:"A time to love, and a time to hate; a time of war, and a time of", a:"peace", suffix:".", d:["rest","ease","quiet"] },
        { r:"Ecclesiastes 3:11", prefix:"He hath made every thing beautiful in his", a:"time", suffix:":", d:["way","hour","season"] },
        { r:"Ecclesiastes 3:14", prefix:"I know that, whatsoever God doeth, it shall be for", a:"ever", suffix:":", d:["good","us","nought"] }
      ]
    },
    {
      id:"isaiah40", name:"Isaiah 40", r:"Isaiah 40", subtitle:"They that wait upon the LORD", hall:true, testament:"ot",
      blanks:[
        { r:"Isaiah 40:1", prefix:"Comfort ye, comfort ye my people, saith your", a:"God", suffix:".", d:["King","LORD","Father"] },
        { r:"Isaiah 40:3", prefix:"The voice of him that crieth in the wilderness, Prepare ye the way of the", a:"LORD", suffix:",", d:["King","Christ","Most High"] },
        { r:"Isaiah 40:8", prefix:"The grass withereth, the flower fadeth: but the word of our God shall stand for", a:"ever", suffix:".", d:["aye","truth","us"] },
        { r:"Isaiah 40:11", prefix:"He shall feed his flock like a", a:"shepherd", suffix:":", d:["father","king","guide"] },
        { r:"Isaiah 40:28", prefix:"Hast thou not known? hast thou not heard, that the everlasting God, the LORD, the Creator of the ends of the earth, fainteth not, neither is", a:"weary", suffix:"?", d:["weak","spent","tired"] },
        { r:"Isaiah 40:31", prefix:"But they that wait upon the LORD shall renew their", a:"strength", suffix:";", d:["youth","hope","heart"] },
        { r:"Isaiah 40:31", prefix:"they shall mount up with wings as", a:"eagles", suffix:";", d:["doves","angels","cherubims"] },
        { r:"Isaiah 40:31", prefix:"they shall run, and not be weary; and they shall walk, and not", a:"faint", suffix:".", d:["fall","fail","tire"] }
      ]
    },
    {
      id:"jeremiah29", name:"Jeremiah 29", r:"Jeremiah 29", subtitle:"Thoughts of peace, and not of evil", hall:true, testament:"ot",
      blanks:[
        { r:"Jeremiah 29:7", prefix:"And seek the peace of the city whither I have caused you to be carried away", a:"captives", suffix:",", d:["exiles","strangers","servants"] },
        { r:"Jeremiah 29:11", prefix:"For I know the thoughts that I think toward you, saith the LORD, thoughts of", a:"peace", suffix:", and not of evil,", d:["mercy","hope","good"] },
        { r:"Jeremiah 29:11", prefix:"to give you an expected", a:"end", suffix:".", d:["hope","future","rest"] },
        { r:"Jeremiah 29:12", prefix:"Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto", a:"you", suffix:".", d:["them","us","thee"] },
        { r:"Jeremiah 29:13", prefix:"And ye shall seek me, and find me, when ye shall search for me with all your", a:"heart", suffix:".", d:["soul","might","mind"] },
        { r:"Jeremiah 29:14", prefix:"And I will be found of you, saith the LORD: and I will turn away your", a:"captivity", suffix:",", d:["sorrow","bondage","shame"] },
        { r:"Jeremiah 29:10", prefix:"For thus saith the LORD, That after seventy years be accomplished at Babylon I will visit you, and perform my good", a:"word", suffix:"toward you,", d:["oath","work","promise"] },
        { r:"Jeremiah 29:14", prefix:"and I will gather you from all the nations, and from all the places whither I have driven you, saith the LORD; and I will bring you again into the place whence I caused you to be carried away", a:"captive", suffix:".", d:["bound","lost","sold"] }
      ]
    },
    {
      id:"ezekiel37", name:"Ezekiel 37", r:"Ezekiel 37", subtitle:"Can these bones live", hall:true, testament:"ot",
      blanks:[
        { r:"Ezekiel 37:3", prefix:"And he said unto me, Son of man, can these bones", a:"live", suffix:"? And I answered, O Lord GOD, thou knowest.", d:["rise","stand","speak"] },
        { r:"Ezekiel 37:4", prefix:"Again he said unto me, Prophesy upon these bones, and say unto them, O ye dry bones, hear the word of the", a:"LORD", suffix:".", d:["Most High","Almighty","God"] },
        { r:"Ezekiel 37:5", prefix:"Thus saith the Lord GOD unto these bones; Behold, I will cause breath to enter into you, and ye shall", a:"live", suffix:":", d:["rise","stand","wake"] },
        { r:"Ezekiel 37:7", prefix:"So I prophesied as I was commanded: and as I prophesied, there was a noise, and behold a", a:"shaking", suffix:", and the bones came together, bone to his bone.", d:["wind","thunder","quake"] },
        { r:"Ezekiel 37:8", prefix:"and the sinews and the flesh came up upon them, and the skin covered them above: but there was no breath in", a:"them", suffix:".", d:["us","him","it"] },
        { r:"Ezekiel 37:9", prefix:"Then said he unto me, Prophesy unto the wind, prophesy, son of man, and say to the wind, Thus saith the Lord GOD; Come from the four winds, O", a:"breath", suffix:", and breathe upon these slain, that they may live.", d:["spirit","air","life"] },
        { r:"Ezekiel 37:10", prefix:"and they lived, and stood up upon their feet, an exceeding great", a:"army", suffix:".", d:["host","people","nation"] },
        { r:"Ezekiel 37:14", prefix:"And shall put my spirit in you, and ye shall live, and I shall place you in your own", a:"land", suffix:":", d:["house","city","place"] }
      ]
    },
    {
      id:"matthew11", name:"Matthew 11", r:"Matthew 11", subtitle:"Come unto me, all ye that labour", hall:true, testament:"nt",
      blanks:[
        { r:"Matthew 11:28", prefix:"Come unto me, all ye that labour and are heavy laden, and I will give you", a:"rest", suffix:".", d:["peace","life","joy"] },
        { r:"Matthew 11:29", prefix:"Take my yoke upon you, and learn of me; for I am meek and lowly in", a:"heart", suffix:":", d:["spirit","mind","soul"] },
        { r:"Matthew 11:29", prefix:"and ye shall find rest unto your", a:"souls", suffix:".", d:["hearts","minds","flesh"] },
        { r:"Matthew 11:30", prefix:"For my yoke is easy, and my burden is", a:"light", suffix:".", d:["small","kind","fair"] },
        { r:"Matthew 11:25", prefix:"I thank thee, O Father, Lord of heaven and earth, because thou hast hid these things from the wise and prudent, and hast revealed them unto", a:"babes", suffix:".", d:["children","the poor","sinners"] },
        { r:"Matthew 11:27", prefix:"All things are delivered unto me of my Father: and no man knoweth the Son, but the", a:"Father", suffix:";", d:["Spirit","Lord","Most High"] },
        { r:"Matthew 11:28", prefix:"Come unto me, all ye that labour and are heavy", a:"laden", suffix:",", d:["tried","worn","spent"] },
        { r:"Matthew 11:29", prefix:"Take my yoke upon you, and learn of", a:"me", suffix:";", d:["him","God","this"] }
      ]
    },
    {
      id:"mark16", name:"Mark 16", r:"Mark 16", subtitle:"He is risen; he is not here", hall:true, testament:"nt",
      blanks:[
        { r:"Mark 16:6", prefix:"And he saith unto them, Be not affrighted: Ye seek Jesus of Nazareth, which was crucified: he is risen; he is not", a:"here", suffix:":", d:["dead","gone","lost"] },
        { r:"Mark 16:6", prefix:"behold the place where they laid", a:"him", suffix:".", d:["Jesus","the Lord","them"] },
        { r:"Mark 16:15", prefix:"And he said unto them, Go ye into all the world, and preach the gospel to every", a:"creature", suffix:".", d:["nation","people","tongue"] },
        { r:"Mark 16:16", prefix:"He that believeth and is baptized shall be", a:"saved", suffix:"; but he that believeth not shall be damned.", d:["blessed","kept","healed"] },
        { r:"Mark 16:17", prefix:"And these signs shall follow them that believe; In my name shall they cast out", a:"devils", suffix:";", d:["spirits","demons","serpents"] },
        { r:"Mark 16:19", prefix:"So then after the Lord had spoken unto them, he was received up into", a:"heaven", suffix:", and sat on the right hand of God.", d:["glory","the cloud","the sky"] },
        { r:"Mark 16:20", prefix:"And they went forth, and preached every where, the Lord working with them, and confirming the word with", a:"signs", suffix:"following.", d:["wonders","miracles","power"] },
        { r:"Mark 16:6", prefix:"Ye seek Jesus of Nazareth, which was crucified: he is", a:"risen", suffix:"; he is not here:", d:["alive","gone","taken"] }
      ]
    },
    {
      id:"luke15", name:"Luke 15", r:"Luke 15", subtitle:"This my son was dead, and is alive again", hall:true, testament:"nt",
      blanks:[
        { r:"Luke 15:4", prefix:"What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is", a:"lost", suffix:", until he find it?", d:["gone","strayed","hurt"] },
        { r:"Luke 15:6", prefix:"Rejoice with me; for I have found my sheep which was", a:"lost", suffix:".", d:["dead","gone","stolen"] },
        { r:"Luke 15:8", prefix:"Either what woman having ten pieces of silver, if she lose one piece, doth not light a candle, and sweep the house, and seek diligently till she find", a:"it", suffix:"?", d:["her","them","one"] },
        { r:"Luke 15:13", prefix:"And not many days after the younger son gathered all together, and took his journey into a far country, and there wasted his substance with riotous", a:"living", suffix:".", d:["drink","pleasure","waste"] },
        { r:"Luke 15:18", prefix:"I will arise and go to my father, and will say unto him, Father, I have sinned against heaven, and before", a:"thee", suffix:",", d:["God","you","him"] },
        { r:"Luke 15:20", prefix:"And he arose, and came to his father. But when he was yet a great way off, his father saw him, and had", a:"compassion", suffix:", and ran, and fell on his neck, and kissed him.", d:["mercy","pity","joy"] },
        { r:"Luke 15:24", prefix:"For this my son was dead, and is alive again; he was lost, and is", a:"found", suffix:".", d:["home","saved","kept"] },
        { r:"Luke 15:32", prefix:"It was meet that we should make merry, and be glad: for this thy brother was dead, and is alive again; and was lost, and is", a:"found", suffix:".", d:["home","here","kept"] }
      ]
    },
    {
      id:"john11", name:"John 11", r:"John 11", subtitle:"I am the resurrection, and the life", hall:true, testament:"nt",
      blanks:[
        { r:"John 11:25", prefix:"Jesus said unto her, I am the resurrection, and the", a:"life", suffix:":", d:["way","truth","light"] },
        { r:"John 11:25", prefix:"he that believeth in me, though he were dead, yet shall he", a:"live", suffix:":", d:["rise","stand","wake"] },
        { r:"John 11:26", prefix:"And whosoever liveth and believeth in me shall never", a:"die", suffix:". Believest thou this?", d:["fall","perish","sleep"] },
        { r:"John 11:35", prefix:"Jesus", a:"wept", suffix:".", d:["sighed","groaned","prayed"] },
        { r:"John 11:39", prefix:"Jesus said, Take ye away the", a:"stone", suffix:".", d:["cloth","door","grave"] },
        { r:"John 11:43", prefix:"And when he thus had spoken, he cried with a loud voice, Lazarus, come", a:"forth", suffix:".", d:["out","up","here"] },
        { r:"John 11:44", prefix:"And he that was dead came forth, bound hand and foot with", a:"graveclothes", suffix:":", d:["linen","bands","cloths"] },
        { r:"John 11:4", prefix:"When Jesus heard that, he said, This sickness is not unto death, but for the glory of", a:"God", suffix:", that the Son of God might be glorified thereby.", d:["the Father","heaven","the Lord"] }
      ]
    },
    {
      id:"acts9", name:"Acts 9", r:"Acts 9", subtitle:"Saul, Saul, why persecutest thou me", hall:true, testament:"nt",
      blanks:[
        { r:"Acts 9:3", prefix:"And as he journeyed, he came near Damascus: and suddenly there shined round about him a light from", a:"heaven", suffix:":", d:["God","the sun","glory"] },
        { r:"Acts 9:4", prefix:"And he fell to the earth, and heard a voice saying unto him, Saul, Saul, why persecutest thou", a:"me", suffix:"?", d:["us","them","him"] },
        { r:"Acts 9:5", prefix:"And he said, Who art thou, Lord? And the Lord said, I am Jesus whom thou", a:"persecutest", suffix:":", d:["hatest","huntest","scourgest"] },
        { r:"Acts 9:6", prefix:"And he trembling and astonished said, Lord, what wilt thou have me to", a:"do", suffix:"?", d:["say","be","go"] },
        { r:"Acts 9:9", prefix:"And he was three days without sight, and neither did eat nor", a:"drink", suffix:".", d:["sleep","speak","pray"] },
        { r:"Acts 9:15", prefix:"But the Lord said unto him, Go thy way: for he is a chosen vessel unto me, to bear my name before the Gentiles, and kings, and the children of", a:"Israel", suffix:".", d:["men","Judah","Abraham"] },
        { r:"Acts 9:18", prefix:"And immediately there fell from his eyes as it had been", a:"scales", suffix:": and he received sight forthwith, and arose, and was baptized.", d:["dust","film","veils"] },
        { r:"Acts 9:20", prefix:"And straightway he preached Christ in the synagogues, that he is the Son of", a:"God", suffix:".", d:["man","David","Abraham"] }
      ]
    },
    {
      id:"romans12", name:"Romans 12", r:"Romans 12", subtitle:"A living sacrifice", hall:true, testament:"nt",
      blanks:[
        { r:"Romans 12:1", prefix:"I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living", a:"sacrifice", suffix:", holy, acceptable unto God, which is your reasonable service.", d:["offering","gift","altar"] },
        { r:"Romans 12:2", prefix:"And be not conformed to this world: but be ye transformed by the renewing of your", a:"mind", suffix:",", d:["heart","soul","spirit"] },
        { r:"Romans 12:9", prefix:"Let love be without dissimulation. Abhor that which is evil; cleave to that which is", a:"good", suffix:".", d:["true","holy","just"] },
        { r:"Romans 12:12", prefix:"Rejoicing in hope; patient in tribulation; continuing instant in", a:"prayer", suffix:".", d:["faith","watch","fasting"] },
        { r:"Romans 12:15", prefix:"Rejoice with them that do rejoice, and weep with them that", a:"weep", suffix:".", d:["mourn","cry","sorrow"] },
        { r:"Romans 12:18", prefix:"If it be possible, as much as lieth in you, live peaceably with all", a:"men", suffix:".", d:["people","brethren","nations"] },
        { r:"Romans 12:21", prefix:"Be not overcome of evil, but overcome evil with", a:"good", suffix:".", d:["love","truth","light"] },
        { r:"Romans 12:3", prefix:"For I say, through the grace given unto me, to every man that is among you, not to think of himself more highly than he ought to think; but to think", a:"soberly", suffix:",", d:["lowly","meekly","truly"] }
      ]
    },
    {
      id:"philippians2", name:"Philippians 2", r:"Philippians 2", subtitle:"Let this mind be in you", hall:true, testament:"nt",
      blanks:[
        { r:"Philippians 2:3", prefix:"Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than", a:"themselves", suffix:".", d:["himself","ourselves","yourselves"] },
        { r:"Philippians 2:5", prefix:"Let this mind be in you, which was also in Christ", a:"Jesus", suffix:":", d:["the Lord","our Lord","Jesus Christ"] },
        { r:"Philippians 2:6", prefix:"Who, being in the form of God, thought it not robbery to be equal with", a:"God", suffix:":", d:["the Father","heaven","man"] },
        { r:"Philippians 2:7", prefix:"But made himself of no reputation, and took upon him the form of a", a:"servant", suffix:",", d:["man","slave","son"] },
        { r:"Philippians 2:8", prefix:"And being found in fashion as a man, he humbled himself, and became obedient unto death, even the death of the", a:"cross", suffix:".", d:["tree","grave","world"] },
        { r:"Philippians 2:9", prefix:"Wherefore God also hath highly exalted him, and given him a name which is above every", a:"name", suffix:":", d:["power","throne","title"] },
        { r:"Philippians 2:10", prefix:"That at the name of Jesus every knee should", a:"bow", suffix:",", d:["bend","fall","kneel"] },
        { r:"Philippians 2:11", prefix:"And that every tongue should confess that Jesus Christ is Lord, to the glory of God the", a:"Father", suffix:".", d:["Most High","Almighty","Holy Ghost"] }
      ]
    },
    {
      id:"hebrews11", name:"Hebrews 11", r:"Hebrews 11", subtitle:"Faith is the substance of things hoped for", hall:true, testament:"nt",
      blanks:[
        { r:"Hebrews 11:1", prefix:"Now faith is the substance of things hoped for, the evidence of things not", a:"seen", suffix:".", d:["known","held","named"] },
        { r:"Hebrews 11:3", prefix:"Through faith we understand that the worlds were framed by the word of", a:"God", suffix:",", d:["the LORD","his mouth","power"] },
        { r:"Hebrews 11:6", prefix:"But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek", a:"him", suffix:".", d:["thee","us","it"] },
        { r:"Hebrews 11:7", prefix:"By faith Noah, being warned of God of things not seen as yet, moved with fear, prepared an", a:"ark", suffix:"to the saving of his house;", d:["altar","house","tent"] },
        { r:"Hebrews 11:8", prefix:"By faith Abraham, when he was called to go out into a place which he should after receive for an inheritance, obeyed; and he went out, not knowing whither he", a:"went", suffix:".", d:["came","walked","sailed"] },
        { r:"Hebrews 11:17", prefix:"By faith Abraham, when he was tried, offered up", a:"Isaac", suffix:":", d:["Ishmael","his son","the lad"] },
        { r:"Hebrews 11:31", prefix:"By faith the harlot Rahab perished not with them that believed not, when she had received the spies with", a:"peace", suffix:".", d:["bread","wine","haste"] },
        { r:"Hebrews 11:13", prefix:"These all died in faith, not having received the promises, but having seen them afar off, and were persuaded of them, and embraced them, and confessed that they were strangers and pilgrims on the", a:"earth", suffix:".", d:["land","way","world"] }
      ]
    },
    {
      id:"james1", name:"James 1", r:"James 1", subtitle:"Count it all joy", hall:true, testament:"nt",
      blanks:[
        { r:"James 1:2", prefix:"My brethren, count it all joy when ye fall into divers", a:"temptations", suffix:";", d:["trials","troubles","sorrows"] },
        { r:"James 1:3", prefix:"Knowing this, that the trying of your faith worketh", a:"patience", suffix:".", d:["hope","peace","strength"] },
        { r:"James 1:5", prefix:"If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given", a:"him", suffix:".", d:["thee","you","them"] },
        { r:"James 1:12", prefix:"Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of", a:"life", suffix:",", d:["glory","righteousness","joy"] },
        { r:"James 1:17", prefix:"Every good gift and every perfect gift is from above, and cometh down from the Father of", a:"lights", suffix:",", d:["spirits","glory","heaven"] },
        { r:"James 1:19", prefix:"Wherefore, my beloved brethren, let every man be swift to hear, slow to speak, slow to", a:"wrath", suffix:":", d:["anger","judge","strife"] },
        { r:"James 1:22", prefix:"But be ye doers of the word, and not hearers only, deceiving your own", a:"selves", suffix:".", d:["hearts","souls","minds"] },
        { r:"James 1:27", prefix:"Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction, and to keep himself unspotted from the", a:"world", suffix:".", d:["flesh","evil","age"] }
      ]
    },
    {
      id:"firstjohn4", name:"1 John 4", r:"1 John 4", subtitle:"God is love", hall:true, testament:"nt",
      blanks:[
        { r:"1 John 4:7", prefix:"Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth", a:"God", suffix:".", d:["truth","light","life"] },
        { r:"1 John 4:8", prefix:"He that loveth not knoweth not God; for God is", a:"love", suffix:".", d:["light","life","truth"] },
        { r:"1 John 4:9", prefix:"In this was manifested the love of God toward us, because that God sent his only begotten Son into the world, that we might live through", a:"him", suffix:".", d:["Christ","Jesus","the Word"] },
        { r:"1 John 4:10", prefix:"Herein is love, not that we loved God, but that he loved us, and sent his Son to be the propitiation for our", a:"sins", suffix:".", d:["souls","guilt","death"] },
        { r:"1 John 4:18", prefix:"There is no fear in love; but perfect love casteth out", a:"fear", suffix:":", d:["death","hate","doubt"] },
        { r:"1 John 4:19", prefix:"We love him, because he first loved", a:"us", suffix:".", d:["me","thee","them"] },
        { r:"1 John 4:16", prefix:"And we have known and believed the love that God hath to us. God is love; and he that dwelleth in love dwelleth in God, and God in", a:"him", suffix:".", d:["us","them","thee"] },
        { r:"1 John 4:21", prefix:"That he who loveth God love his", a:"brother", suffix:"also.", d:["neighbour","friend","enemy"] }
      ]
    }
  ];

  function install(T){
    if(!T) return;
    T.hall = HALL;
    HALL.forEach(function(ch){
      let i = 0, found = false;
      for(; i < T.chapters.length; i++) if(T.chapters[i].id === ch.id) found = true;
      if(!found) T.chapters.push(ch);
    });
  }
  if(typeof Tablets !== "undefined") install(Tablets);
  if(typeof module !== "undefined"){
    module.exports = { TABLETS_HALL: HALL, install: install };
    try{ install(require("./tablets.js").Tablets); }catch(e){}
  }
})();
