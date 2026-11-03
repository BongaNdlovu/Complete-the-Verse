(function(){
  const CANON = [
    {
      id:"genesis1", pace:2, name:"Genesis 1", r:"Genesis 1", subtitle:"In the beginning God created", after:"ur", afterName:"Ur", testament:"ot",
      blanks:[
        { r:"Genesis 1:1", prefix:"In the beginning God created the heaven and the", a:"earth", suffix:".", d:["world","deep","light","sea","dust"] },
        { r:"Genesis 1:2", prefix:"And the earth was without form, and void; and darkness was upon the face of the", a:"deep", suffix:".", d:["waters","void","night","heaven","sea"] },
        { r:"Genesis 1:3", prefix:"And God said, Let there be", a:"light", suffix:": and there was light.", d:["day","life","order","land","water"] },
        { r:"Genesis 1:5", prefix:"And God called the light Day, and the darkness he called", a:"Night", suffix:".", d:["Eve","Shadow","Dusk","Morning","Midnight"] },
        { r:"Genesis 1:16", prefix:"And God made two great lights; the greater light to rule the day, and the lesser light to rule the", a:"night", suffix:":", d:["heaven","earth","seas","land","world"] },
        { r:"Genesis 1:21", prefix:"And God created great", a:"whales", suffix:", and every living creature that moveth,", d:["beasts","fishes","serpents","lions","eagles"] },
        { r:"Genesis 1:26", prefix:"And God said, Let us make man in our", a:"image", suffix:", after our likeness:", d:["glory","spirit","likeness","name","hand"] },
        { r:"Genesis 1:27", prefix:"So God created man in his own image, in the image of God created he him; male and female created he", a:"them", suffix:".", d:["him","us","all","those","these"] },
        { r:"Genesis 1:28", prefix:"And God blessed them, and God said unto them, Be fruitful, and", a:"multiply", suffix:", and replenish the earth,", d:["increase","fill","spread","rest","rejoice"] },
        { r:"Genesis 1:31", prefix:"And God saw every thing that he had made, and, behold, it was very", a:"good", suffix:".", d:["fair","true","done","great","wicked"] }
      ]
    },
    {
      id:"genesis12", pace:1, name:"Genesis 12", r:"Genesis 12", subtitle:"Get thee out of thy country", after:"haran", afterName:"Haran", testament:"ot",
      blanks:[
        { r:"Genesis 12:1", prefix:"Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father's", a:"house", suffix:",", d:["land","tent","people","gods","sons"] },
        { r:"Genesis 12:1", prefix:"unto a land that I will shew", a:"thee", suffix:":", d:["you","him","it","thyself","them"] },
        { r:"Genesis 12:2", prefix:"And I will make of thee a great", a:"nation", suffix:", and I will bless thee,", d:["people","house","kingdom","city","name"] },
        { r:"Genesis 12:2", prefix:"and make thy name great; and thou shalt be a", a:"blessing", suffix:":", d:["witness","light","father","curse","gift"] },
        { r:"Genesis 12:3", prefix:"And I will bless them that bless thee, and curse him that curseth thee: and in thee shall all families of the earth be", a:"blessed", suffix:".", d:["gathered","saved","named","loved","chosen"] },
        { r:"Genesis 12:4", prefix:"So Abram departed, as the LORD had spoken unto him; and Lot went with", a:"him", suffix:":", d:["them","Abram","thee","her","it"] },
        { r:"Genesis 12:7", prefix:"And the LORD appeared unto Abram, and said, Unto thy seed will I give this", a:"land", suffix:":", d:["place","country","earth","city","mountain"] },
        { r:"Genesis 12:8", prefix:"and there he builded an altar unto the LORD, and called upon the name of the", a:"LORD", suffix:".", d:["Most High","Almighty","God","Father","Shepherd"] }
      ]
    },
    {
      id:"genesis22", pace:3, name:"Genesis 22", r:"Genesis 22", subtitle:"Take now thy son, thine only son", after:"moriah", afterName:"Moriah", testament:"ot",
      blanks:[
        { r:"Genesis 22:2", prefix:"And he said, Take now thy son, thine only son Isaac, whom thou", a:"lovest", suffix:",", d:["knowest","fearest","keepest","seest","heardest"] },
        { r:"Genesis 22:2", prefix:"and get thee into the land of Moriah; and offer him there for a burnt offering upon one of the", a:"mountains", suffix:"which I will tell thee of.", d:["hills","altars","places","valleys","rivers"] },
        { r:"Genesis 22:6", prefix:"And Abraham took the wood of the burnt offering, and laid it upon Isaac his", a:"son", suffix:";", d:["servant","lad","heir","firstborn","daughter"] },
        { r:"Genesis 22:7", prefix:"And Isaac spake unto Abraham his father, and said, My father: and he said, Here am I, my son. And he said, Behold the fire and the wood: but where is the lamb for a burnt", a:"offering", suffix:"?", d:["sacrifice","altar","gift","beast","incense"] },
        { r:"Genesis 22:8", prefix:"And Abraham said, My son, God will provide himself a", a:"lamb", suffix:"for a burnt offering:", d:["ram","kid","bull","goat","sheep"] },
        { r:"Genesis 22:12", prefix:"And he said, Lay not thine hand upon the lad, neither do thou any thing unto him: for now I know that thou fearest God, seeing thou hast not withheld thy son, thine only", a:"son", suffix:"from me.", d:["child","heir","seed","daughter","brother"] },
        { r:"Genesis 22:13", prefix:"and Abraham went and took the ram, and offered him up for a burnt offering in the stead of his", a:"son", suffix:".", d:["lad","child","seed","servant","brother"] },
        { r:"Genesis 22:14", prefix:"And Abraham called the name of that place Jehovahjireh: as it is said to this day, In the mount of the LORD it shall be", a:"seen", suffix:".", d:["done","given","known","heard","provided"] },
        { r:"Genesis 22:17", prefix:"That in blessing I will bless thee, and in multiplying I will multiply thy seed as the stars of the", a:"heaven", suffix:",", d:["sky","night","host","sea","earth"] },
        { r:"Genesis 22:18", prefix:"And in thy seed shall all the nations of the earth be", a:"blessed", suffix:"; because thou hast obeyed my voice.", d:["gathered","saved","named","cursed","called"] }
      ]
    },
    {
      id:"exodus20", pace:2, name:"Exodus 20", r:"Exodus 20", subtitle:"The ten words on the mount", after:"sinai", afterName:"Sinai", testament:"ot",
      blanks:[
        { r:"Exodus 20:3", prefix:"Thou shalt have no other gods before", a:"me", suffix:".", d:["him","us","thee","them","myself"] },
        { r:"Exodus 20:4", prefix:"Thou shalt not make unto thee any graven", a:"image", suffix:",", d:["idol","likeness","altar","god","calf"] },
        { r:"Exodus 20:7", prefix:"Thou shalt not take the name of the LORD thy God in", a:"vain", suffix:";", d:["jest","anger","haste","pride","sin"] },
        { r:"Exodus 20:8", prefix:"Remember the sabbath day, to keep it", a:"holy", suffix:".", d:["clean","set","apart","secret","quiet"] },
        { r:"Exodus 20:12", prefix:"Honour thy father and thy", a:"mother", suffix:": that thy days may be long upon the land which the LORD thy God giveth thee.", d:["house","kin","elders","brother","sister"] },
        { r:"Exodus 20:13", prefix:"Thou shalt not", a:"kill", suffix:".", d:["steal","swear","covet","lie","forsake"] },
        { r:"Exodus 20:14", prefix:"Thou shalt not commit", a:"adultery", suffix:".", d:["murder","idolatry","theft","covetousness","treason"] },
        { r:"Exodus 20:15", prefix:"Thou shalt not", a:"steal", suffix:".", d:["kill","lie","covet","swear","forsake"] },
        { r:"Exodus 20:16", prefix:"Thou shalt not bear false witness against thy", a:"neighbour", suffix:".", d:["brother","friend","people","enemy","stranger"] },
        { r:"Exodus 20:17", prefix:"Thou shalt not", a:"covet", suffix:"thy neighbour's house,", d:["take","touch","keep","build","sell"] }
      ]
    },
    {
      id:"deuteronomy6", pace:1, name:"Deuteronomy 6", r:"Deuteronomy 6", subtitle:"Hear, O Israel", after:"nebo", afterName:"Nebo", testament:"ot",
      blanks:[
        { r:"Deuteronomy 6:4", prefix:"Hear, O Israel: The LORD our God is one", a:"LORD", suffix:":", d:["God","King","Name","Father","Judge"] },
        { r:"Deuteronomy 6:5", prefix:"And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy", a:"might", suffix:".", d:["mind","strength","spirit","body","will"] },
        { r:"Deuteronomy 6:6", prefix:"And these words, which I command thee this day, shall be in thine", a:"heart", suffix:":", d:["mouth","house","hand","eyes","bosom"] },
        { r:"Deuteronomy 6:7", prefix:"And thou shalt teach them diligently unto thy", a:"children", suffix:",", d:["sons","people","house","servants","brethren"] },
        { r:"Deuteronomy 6:7", prefix:"and shalt talk of them when thou sittest in thine house, and when thou walkest by the way, and when thou liest down, and when thou risest", a:"up", suffix:".", d:["again","early","forth","awake","out"] },
        { r:"Deuteronomy 6:8", prefix:"And thou shalt bind them for a sign upon thine", a:"hand", suffix:",", d:["arm","brow","door","foot","heart"] },
        { r:"Deuteronomy 6:9", prefix:"And thou shalt write them upon the posts of thy house, and on thy", a:"gates", suffix:".", d:["doors","walls","lintel","tables","hearts"] },
        { r:"Deuteronomy 6:12", prefix:"Then beware lest thou forget the LORD, which brought thee forth out of the land of", a:"Egypt", suffix:", from the house of bondage.", d:["Canaan","Horeb","Goshen","Babylon","Assyria"] }
      ]
    },
    {
      id:"joshua1", pace:1, name:"Joshua 1", r:"Joshua 1", subtitle:"Be strong and of a good courage", after:"gilgal", afterName:"Gilgal", testament:"ot",
      blanks:[
        { r:"Joshua 1:2", prefix:"Moses my servant is dead; now therefore arise, go over this Jordan, thou, and all this people, unto the land which I do give to them, even to the children of", a:"Israel", suffix:".", d:["Abraham","Jacob","Judah","Esau","Levi"] },
        { r:"Joshua 1:5", prefix:"There shall not any man be able to stand before thee all the days of thy life: as I was with Moses, so I will be with", a:"thee", suffix:":", d:["you","him","us","them","thyself"] },
        { r:"Joshua 1:5", prefix:"I will not fail thee, nor", a:"forsake", suffix:"thee.", d:["leave","forget","fear","hate","praise"] },
        { r:"Joshua 1:6", prefix:"Be strong and of a good", a:"courage", suffix:":", d:["heart","faith","hope","conscience","report"] },
        { r:"Joshua 1:8", prefix:"This book of the law shall not depart out of thy", a:"mouth", suffix:";", d:["hand","heart","sight","house","land"] },
        { r:"Joshua 1:8", prefix:"but thou shalt meditate therein day and", a:"night", suffix:",", d:["evening","dawn","always","morning","year"] },
        { r:"Joshua 1:9", prefix:"Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou", a:"dismayed", suffix:":", d:["troubled","weak","moved","proud","wise"] },
        { r:"Joshua 1:9", prefix:"for the LORD thy God is with thee whithersoever thou", a:"goest", suffix:".", d:["walkest","turnest","dwellest","sittest","sleepest"] }
      ]
    },
    {
      id:"psalm51", pace:3, name:"Psalm 51", r:"Psalm 51", subtitle:"Create in me a clean heart", after:"jerusalem", afterName:"Jerusalem", testament:"ot",
      blanks:[
        { r:"Psalm 51:1", prefix:"Have mercy upon me, O God, according to thy lovingkindness: according unto the multitude of thy tender mercies blot out my", a:"transgressions", suffix:".", d:["iniquities","sins","offences","sorrows","tears"] },
        { r:"Psalm 51:2", prefix:"Wash me throughly from mine iniquity, and cleanse me from my", a:"sin", suffix:".", d:["guilt","stain","shame","pride","fear"] },
        { r:"Psalm 51:7", prefix:"Purge me with hyssop, and I shall be clean: wash me, and I shall be whiter than", a:"snow", suffix:".", d:["wool","light","linen","milk","gold"] },
        { r:"Psalm 51:10", prefix:"Create in me a clean heart, O God; and renew a right spirit within", a:"me", suffix:".", d:["us","thee","him","it","them"] },
        { r:"Psalm 51:11", prefix:"Cast me not away from thy presence; and take not thy holy spirit from", a:"me", suffix:".", d:["us","thee","him","it","them"] },
        { r:"Psalm 51:12", prefix:"Restore unto me the joy of thy", a:"salvation", suffix:";", d:["mercy","presence","truth","strength","glory"] },
        { r:"Psalm 51:12", prefix:"and uphold me with thy free", a:"spirit", suffix:".", d:["hand","grace","word","gift","will"] },
        { r:"Psalm 51:13", prefix:"Then will I teach transgressors thy ways; and sinners shall be converted unto", a:"thee", suffix:".", d:["God","truth","life","you","him"] },
        { r:"Psalm 51:17", prefix:"The sacrifices of God are a broken", a:"spirit", suffix:":", d:["heart","will","pride","offering","vessel"] },
        { r:"Psalm 51:17", prefix:"a broken and a contrite heart, O God, thou wilt not", a:"despise", suffix:".", d:["refuse","forget","break","accept","forsake"] }
      ]
    },
    {
      id:"proverbs3", pace:2, name:"Proverbs 3", r:"Proverbs 3", subtitle:"Trust in the LORD with all thine heart", after:"shiloh", afterName:"Shiloh", testament:"ot",
      blanks:[
        { r:"Proverbs 3:5", prefix:"Trust in the LORD with all thine", a:"heart", suffix:";", d:["soul","mind","might","hand","eyes"] },
        { r:"Proverbs 3:5", prefix:"and lean not unto thine own", a:"understanding", suffix:".", d:["wisdom","strength","counsel","hand","sight"] },
        { r:"Proverbs 3:6", prefix:"In all thy ways acknowledge him, and he shall direct thy", a:"paths", suffix:".", d:["steps","ways","feet","thoughts","hearts"] },
        { r:"Proverbs 3:7", prefix:"Be not wise in thine own eyes: fear the LORD, and depart from", a:"evil", suffix:".", d:["sin","pride","folly","idols","anger"] },
        { r:"Proverbs 3:9", prefix:"Honour the LORD with thy substance, and with the firstfruits of all thine", a:"increase", suffix:":", d:["labour","field","house","garden","treasure"] },
        { r:"Proverbs 3:11", prefix:"My son, despise not the chastening of the LORD; neither be weary of his", a:"correction", suffix:":", d:["rebuke","rod","law","love","favour"] },
        { r:"Proverbs 3:13", prefix:"Happy is the man that findeth", a:"wisdom", suffix:", and the man that getteth understanding.", d:["knowledge","riches","honour","gold","peace"] },
        { r:"Proverbs 3:27", prefix:"Withhold not good from them to whom it is due, when it is in the power of thine hand to do", a:"it", suffix:".", d:["so","this","good","that","him"] }
      ]
    },
    {
      id:"isaiah53", pace:3, name:"Isaiah 53", r:"Isaiah 53", subtitle:"He is despised and rejected of men", after:"lachish", afterName:"Lachish", testament:"ot",
      blanks:[
        { r:"Isaiah 53:3", prefix:"He is despised and rejected of men; a man of sorrows, and acquainted with", a:"grief", suffix:":", d:["pain","shame","death","joy","sin"] },
        { r:"Isaiah 53:4", prefix:"Surely he hath borne our griefs, and carried our", a:"sorrows", suffix:":", d:["sins","pains","burdens","tears","treasures"] },
        { r:"Isaiah 53:5", prefix:"But he was wounded for our transgressions, he was bruised for our", a:"iniquities", suffix:":", d:["sins","offences","guilts","griefs","weakness"] },
        { r:"Isaiah 53:5", prefix:"the chastisement of our peace was upon him; and with his stripes we are", a:"healed", suffix:".", d:["saved","cleansed","kept","lost","wounded"] },
        { r:"Isaiah 53:6", prefix:"All we like sheep have gone", a:"astray", suffix:";", d:["away","aside","forth","back","abroad"] },
        { r:"Isaiah 53:6", prefix:"we have turned every one to his own way; and the LORD hath laid on him the iniquity of us", a:"all", suffix:".", d:["both","now","then","many","some"] },
        { r:"Isaiah 53:7", prefix:"He was oppressed, and he was afflicted, yet he opened not his", a:"mouth", suffix:":", d:["lips","voice","hand","heart","eyes"] },
        { r:"Isaiah 53:7", prefix:"he is brought as a lamb to the", a:"slaughter", suffix:",", d:["altar","shearer","cross","sheepfold","pasture"] },
        { r:"Isaiah 53:9", prefix:"And he made his grave with the wicked, and with the rich in his", a:"death", suffix:";", d:["tomb","sleep","end","pit","house"] },
        { r:"Isaiah 53:12", prefix:"because he hath poured out his soul unto death: and he was numbered with the", a:"transgressors", suffix:";", d:["wicked","sinners","thieves","prophets","saints"] }
      ]
    },
    {
      id:"daniel6", pace:3, name:"Daniel 6", r:"Daniel 6", subtitle:"My God hath sent his angel", after:"babylon", afterName:"Babylon", testament:"ot",
      blanks:[
        { r:"Daniel 6:10", prefix:"Now when Daniel knew that the writing was signed, he went into his house; and his windows being open in his chamber toward Jerusalem, he kneeled upon his knees three times a day, and prayed, and gave thanks before his", a:"God", suffix:",", d:["King","Lord","Father","Judge","Shepherd"] },
        { r:"Daniel 6:16", prefix:"Then the king commanded, and they brought Daniel, and cast him into the den of", a:"lions", suffix:".", d:["beasts","fire","stone","wolves","ravens"] },
        { r:"Daniel 6:20", prefix:"And when he came to the den, he cried with a lamentable voice unto Daniel: and the king spake and said to Daniel, O Daniel, servant of the living God, is thy God, whom thou servest continually, able to deliver thee from the", a:"lions", suffix:"?", d:["pit","king","law","wolves","fire"] },
        { r:"Daniel 6:22", prefix:"My God hath sent his angel, and hath shut the lions'", a:"mouths", suffix:",", d:["jaws","teeth","roar","eyes","gates"] },
        { r:"Daniel 6:22", prefix:"that they have not hurt me: forasmuch as before him innocency was found in me; and also before thee, O king, have I done no", a:"hurt", suffix:".", d:["wrong","harm","ill","good","service"] },
        { r:"Daniel 6:23", prefix:"So Daniel was taken up out of the den, and no manner of hurt was found upon him, because he believed in his", a:"God", suffix:".", d:["King","word","angel","Father","Judge"] },
        { r:"Daniel 6:26", prefix:"I make a decree, That in every dominion of my kingdom men tremble and fear before the God of Daniel: for he is the living God, and stedfast for", a:"ever", suffix:",", d:["aye","always","ages","now","once"] },
        { r:"Daniel 6:27", prefix:"He delivereth and rescueth, and he worketh signs and wonders in heaven and in", a:"earth", suffix:",", d:["land","world","deep","sea","hell"] }
      ]
    },
    {
      id:"luke2", pace:1, name:"Luke 2", r:"Luke 2", subtitle:"For unto you is born this day", after:"bethlehem", afterName:"Bethlehem", testament:"nt",
      blanks:[
        { r:"Luke 2:7", prefix:"And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a", a:"manger", suffix:";", d:["crib","bed","stall","field","tent"] },
        { r:"Luke 2:10", prefix:"And the angel said unto them, Fear not: for, behold, I bring you good tidings of great", a:"joy", suffix:",", d:["peace","hope","glory","sorrow","light"] },
        { r:"Luke 2:11", prefix:"For unto you is born this day in the city of David a", a:"Saviour", suffix:", which is Christ the Lord.", d:["King","Prophet","Son","Shepherd","Stranger"] },
        { r:"Luke 2:12", prefix:"And this shall be a sign unto you; Ye shall find the babe wrapped in swaddling clothes, lying in a", a:"manger", suffix:".", d:["crib","bed","house","field","tent"] },
        { r:"Luke 2:14", prefix:"Glory to God in the highest, and on earth peace, good will toward", a:"men", suffix:".", d:["us","all","Israel","saints","kings"] },
        { r:"Luke 2:29", prefix:"Lord, now lettest thou thy servant depart in", a:"peace", suffix:", according to thy word:", d:["joy","rest","hope","death","glory"] },
        { r:"Luke 2:30", prefix:"For mine eyes have seen thy", a:"salvation", suffix:",", d:["glory","Christ","mercy","power","wrath"] },
        { r:"Luke 2:32", prefix:"A light to lighten the Gentiles, and the glory of thy people", a:"Israel", suffix:".", d:["Judah","Jacob","Zion","Abraham","Moses"] },
        { r:"Luke 2:40", prefix:"And the child grew, and waxed strong in spirit, filled with wisdom: and the grace of God was upon", a:"him", suffix:".", d:["them","us","it","her","thee"] },
        { r:"Luke 2:52", prefix:"And Jesus increased in wisdom and stature, and in favour with God and", a:"man", suffix:".", d:["men","Israel","heaven","angels","saints"] }
      ]
    },
    {
      id:"john3", pace:1, name:"John 3", r:"John 3", subtitle:"Ye must be born again", after:"jordan", afterName:"Jordan", testament:"nt",
      blanks:[
        { r:"John 3:3", prefix:"Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of", a:"God", suffix:".", d:["heaven","man","light","Adam","David"] },
        { r:"John 3:5", prefix:"Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of", a:"God", suffix:".", d:["heaven","man","life","Israel","David"] },
        { r:"John 3:7", prefix:"Marvel not that I said unto thee, Ye must be born", a:"again", suffix:".", d:["anew","of God","from above","twice","alone"] },
        { r:"John 3:8", prefix:"The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the", a:"Spirit", suffix:".", d:["water","word","light","flesh","blood"] },
        { r:"John 3:14", prefix:"And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted", a:"up", suffix:":", d:["high","forth","again","down","out"] },
        { r:"John 3:16", prefix:"For God so loved the world, that he gave his only begotten", a:"Son", suffix:",", d:["Child","Word","Lamb","Spirit","Prophet"] },
        { r:"John 3:16", prefix:"that whosoever believeth in him should not perish, but have everlasting", a:"life", suffix:".", d:["hope","peace","joy","glory","rest"] },
        { r:"John 3:17", prefix:"For God sent not his Son into the world to condemn the world; but that the world through him might be", a:"saved", suffix:".", d:["healed","kept","known","judged","warned"] }
      ]
    },
    {
      id:"matthew5", pace:2, name:"Matthew 5", r:"Matthew 5", subtitle:"Blessed are the poor in spirit", after:"capernaum", afterName:"Capernaum", testament:"nt",
      blanks:[
        { r:"Matthew 5:3", prefix:"Blessed are the poor in spirit: for theirs is the kingdom of", a:"heaven", suffix:".", d:["God","life","peace","earth","glory"] },
        { r:"Matthew 5:4", prefix:"Blessed are they that mourn: for they shall be", a:"comforted", suffix:".", d:["healed","kept","lifted","saved","heard"] },
        { r:"Matthew 5:5", prefix:"Blessed are the meek: for they shall inherit the", a:"earth", suffix:".", d:["land","kingdom","world","heaven","throne"] },
        { r:"Matthew 5:6", prefix:"Blessed are they which do hunger and thirst after righteousness: for they shall be", a:"filled", suffix:".", d:["fed","kept","blessed","troubled","scattered"] },
        { r:"Matthew 5:8", prefix:"Blessed are the pure in heart: for they shall see", a:"God", suffix:".", d:["Christ","heaven","light","serve","fear"] },
        { r:"Matthew 5:9", prefix:"Blessed are the peacemakers: for they shall be called the children of", a:"God", suffix:".", d:["peace","heaven","light","Israel","Abraham"] },
        { r:"Matthew 5:14", prefix:"Ye are the light of the", a:"world", suffix:".", d:["earth","house","city","sea","nation"] },
        { r:"Matthew 5:16", prefix:"Let your light so shine before men, that they may see your good works, and glorify your Father which is in", a:"heaven", suffix:".", d:["glory","secret","truth","earth","hell"] },
        { r:"Matthew 5:17", prefix:"Think not that I am come to destroy the law, or the prophets: I am not come to destroy, but to", a:"fulfil", suffix:".", d:["keep","teach","finish","build","sin"] },
        { r:"Matthew 5:44", prefix:"But I say unto you, Love your enemies, bless them that curse you, do good to them that hate you, and pray for them which despitefully use you, and persecute", a:"you", suffix:";", d:["thee","us","them","me","him"] }
      ]
    },
    {
      id:"john14", pace:2, name:"John 14", r:"John 14", subtitle:"I am the way, the truth, and the life", after:"capernaum", afterName:"Capernaum", testament:"nt",
      blanks:[
        { r:"John 14:1", prefix:"Let not your heart be", a:"troubled", suffix:": ye believe in God, believe also in me.", d:["afraid","weary","moved","broken","lost"] },
        { r:"John 14:2", prefix:"In my Father's house are many", a:"mansions", suffix:":", d:["rooms","places","thrones","sons","servants"] },
        { r:"John 14:3", prefix:"And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be", a:"also", suffix:".", d:["too","then","now","here","once"] },
        { r:"John 14:6", prefix:"Jesus saith unto him, I am the way, the truth, and the", a:"life", suffix:":", d:["light","word","door","bread","vine"] },
        { r:"John 14:6", prefix:"no man cometh unto the Father, but by", a:"me", suffix:".", d:["him","us","thee","it","them"] },
        { r:"John 14:9", prefix:"he that hath seen me hath seen the", a:"Father", suffix:";", d:["Son","Lord","Spirit","Word","Prophet"] },
        { r:"John 14:15", prefix:"If ye love me, keep my", a:"commandments", suffix:".", d:["words","sayings","law","ways","servants"] },
        { r:"John 14:16", prefix:"And I will pray the Father, and he shall give you another", a:"Comforter", suffix:",", d:["Helper","Spirit","Advocate","Shepherd","Adversary"] },
        { r:"John 14:27", prefix:"Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be", a:"afraid", suffix:".", d:["moved","weary","cast","glad","hidden"] },
        { r:"John 14:27", prefix:"Peace I leave with you, my peace I give unto", a:"you", suffix:":", d:["thee","us","them","me","him"] }
      ]
    },
    {
      id:"matthew28", pace:1, name:"Matthew 28", r:"Matthew 28", subtitle:"He is not here: for he is risen", after:"golgotha", afterName:"Golgotha", testament:"nt",
      blanks:[
        { r:"Matthew 28:5", prefix:"And the angel answered and said unto the women, Fear not ye: for I know that ye seek Jesus, which was", a:"crucified", suffix:".", d:["buried","slain","taken","stoned","rejected"] },
        { r:"Matthew 28:6", prefix:"He is not here: for he is risen, as he", a:"said", suffix:".", d:["spake","promised","told","commanded","wept"] },
        { r:"Matthew 28:6", prefix:"Come, see the place where the Lord", a:"lay", suffix:".", d:["slept","rested","was","stood","sat"] },
        { r:"Matthew 28:18", prefix:"And Jesus came and spake unto them, saying, All power is given unto me in heaven and in", a:"earth", suffix:".", d:["hell","glory","the world","sea","dust"] },
        { r:"Matthew 28:19", prefix:"Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy", a:"Ghost", suffix:":", d:["Spirit","One","Name","Word","Light"] },
        { r:"Matthew 28:20", prefix:"Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the", a:"world", suffix:".", d:["age","earth","day","land","city"] },
        { r:"Matthew 28:9", prefix:"And as they went to tell his disciples, behold, Jesus met them, saying,", a:"All hail", suffix:".", d:["Peace","Fear not","Follow me","Good tidings","Go forth"] },
        { r:"Matthew 28:17", prefix:"And when they saw him, they worshipped him: but some", a:"doubted", suffix:".", d:["feared","wondered","fled","believed","rejoiced"] }
      ]
    },
    {
      id:"acts2", pace:2, name:"Acts 2", r:"Acts 2", subtitle:"And they were all filled with the Holy Ghost", after:"emmaus", afterName:"Emmaus", testament:"nt",
      blanks:[
        { r:"Acts 2:1", prefix:"And when the day of Pentecost was fully come, they were all with one accord in one", a:"place", suffix:".", d:["house","mind","spirit","city","temple"] },
        { r:"Acts 2:2", prefix:"And suddenly there came a sound from heaven as of a rushing mighty", a:"wind", suffix:",", d:["fire","voice","cloud","stream","river"] },
        { r:"Acts 2:3", prefix:"And there appeared unto them cloven tongues like as of", a:"fire", suffix:",", d:["flame","light","gold","water","brass"] },
        { r:"Acts 2:4", prefix:"And they were all filled with the Holy Ghost, and began to speak with other tongues, as the Spirit gave them", a:"utterance", suffix:".", d:["speech","words","power","strength","courage"] },
        { r:"Acts 2:21", prefix:"And it shall come to pass, that whosoever shall call on the name of the Lord shall be", a:"saved", suffix:".", d:["healed","kept","blessed","lost","glad"] },
        { r:"Acts 2:24", prefix:"Whom God hath raised up, having loosed the pains of death: because it was not possible that he should be holden of", a:"it", suffix:".", d:["them","death","hell","him","her"] },
        { r:"Acts 2:32", prefix:"This Jesus hath God raised up, whereof we all are", a:"witnesses", suffix:".", d:["disciples","apostles","servants","prophets","debtors"] },
        { r:"Acts 2:36", prefix:"Therefore let all the house of Israel know assuredly, that God hath made that same Jesus, whom ye have crucified, both Lord and", a:"Christ", suffix:".", d:["King","Saviour","Son","Judge","Father"] },
        { r:"Acts 2:38", prefix:"Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of", a:"sins", suffix:",", d:["guilt","debts","offences","pains","wages"] },
        { r:"Acts 2:42", prefix:"And they continued stedfastly in the apostles' doctrine and fellowship, and in breaking of bread, and in", a:"prayers", suffix:".", d:["psalms","alms","fasts","labours","fasting"] }
      ]
    },
    {
      id:"ephesians2", pace:3, name:"Ephesians 2", r:"Ephesians 2", subtitle:"For by grace are ye saved through faith", after:"ephesus", afterName:"Ephesus", testament:"nt",
      blanks:[
        { r:"Ephesians 2:1", prefix:"And you hath he quickened, who were dead in trespasses and", a:"sins", suffix:";", d:["debts","works","flesh","tears","cares"] },
        { r:"Ephesians 2:4", prefix:"But God, who is rich in mercy, for his great love wherewith he loved", a:"us", suffix:",", d:["you","them","me","him","it"] },
        { r:"Ephesians 2:5", prefix:"Even when we were dead in sins, hath quickened us together with Christ, (by grace ye are", a:"saved", suffix:";)", d:["kept","healed","called","blessed","chosen"] },
        { r:"Ephesians 2:8", prefix:"For by grace are ye saved through", a:"faith", suffix:";", d:["works","hope","love","prayer","baptism"] },
        { r:"Ephesians 2:8", prefix:"and that not of yourselves: it is the gift of", a:"God", suffix:":", d:["Christ","grace","heaven","Moses","Abraham"] },
        { r:"Ephesians 2:9", prefix:"Not of works, lest any man should", a:"boast", suffix:".", d:["glory","trust","rise","fear","pray"] },
        { r:"Ephesians 2:10", prefix:"For we are his workmanship, created in Christ Jesus unto good", a:"works", suffix:",", d:["fruit","deeds","paths","gifts","ends"] },
        { r:"Ephesians 2:14", prefix:"For he is our peace, who hath made both one, and hath broken down the middle wall of", a:"partition", suffix:"between us;", d:["hatred","stone","law","gate","hedge"] }
      ]
    },
    {
      id:"corinthians13", pace:3, name:"1 Corinthians 13", r:"1 Corinthians 13", subtitle:"And now abideth faith, hope, charity", after:"corinth", afterName:"Corinth", testament:"nt",
      blanks:[
        { r:"1 Corinthians 13:1", prefix:"Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling", a:"cymbal", suffix:".", d:["bell","drum","harp","trumpet","psaltery"] },
        { r:"1 Corinthians 13:2", prefix:"And though I have the gift of prophecy, and understand all mysteries, and all knowledge; and though I have all faith, so that I could remove mountains, and have not charity, I am", a:"nothing", suffix:".", d:["empty","vain","lost","rich","wise"] },
        { r:"1 Corinthians 13:4", prefix:"Charity suffereth long, and is", a:"kind", suffix:";", d:["meek","true","pure","proud","bold"] },
        { r:"1 Corinthians 13:4", prefix:"charity envieth not; charity vaunteth not itself, is not", a:"puffed", suffix:"up,", d:["lifted","set","raised","bound","filled"] },
        { r:"1 Corinthians 13:8", prefix:"Charity never", a:"faileth", suffix:":", d:["endeth","ceaseth","falleth","changeth","sleepeth"] },
        { r:"1 Corinthians 13:12", prefix:"For now we see through a glass,", a:"darkly", suffix:";", d:["dimly","faintly","partly","quickly","boldly"] },
        { r:"1 Corinthians 13:12", prefix:"but then face to", a:"face", suffix:":", d:["glory","light","truth","eye","hand"] },
        { r:"1 Corinthians 13:13", prefix:"And now abideth faith, hope, charity, these three; but the greatest of these is", a:"charity", suffix:".", d:["faith","hope","love","knowledge","prophecy"] },
        { r:"1 Corinthians 13:7", prefix:"Beareth all things, believeth all things, hopeth all things, endureth all", a:"things", suffix:".", d:["days","trials","pains","men","sufferings"] },
        { r:"1 Corinthians 13:11", prefix:"When I was a child, I spake as a child, I understood as a child, I thought as a child: but when I became a man, I put away childish", a:"things", suffix:".", d:["ways","words","fears","dreams","tears"] }
      ]
    },
    {
      id:"romans8", pace:3, name:"Romans 8", r:"Romans 8", subtitle:"There is therefore now no condemnation", after:"rome", afterName:"Rome", testament:"nt",
      blanks:[
        { r:"Romans 8:1", prefix:"There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the", a:"Spirit", suffix:".", d:["truth","word","law","light","faith"] },
        { r:"Romans 8:14", prefix:"For as many as are led by the Spirit of God, they are the sons of", a:"God", suffix:".", d:["light","Abraham","heaven","Adam","Israel"] },
        { r:"Romans 8:16", prefix:"The Spirit itself beareth witness with our spirit, that we are the children of", a:"God", suffix:":", d:["light","promise","heaven","Abraham","Israel"] },
        { r:"Romans 8:18", prefix:"For I reckon that the sufferings of this present time are not worthy to be compared with the glory which shall be revealed in", a:"us", suffix:".", d:["you","them","me","him","it"] },
        { r:"Romans 8:26", prefix:"Likewise the Spirit also helpeth our infirmities: for we know not what we should pray for as we ought: but the Spirit itself maketh intercession for us with groanings which cannot be", a:"uttered", suffix:".", d:["spoken","named","told","written","touched"] },
        { r:"Romans 8:28", prefix:"And we know that all things work together for good to them that love", a:"God", suffix:",", d:["Christ","truth","life","Israel","Jesus"] },
        { r:"Romans 8:31", prefix:"What shall we then say to these things? If God be for us, who can be against", a:"us", suffix:"?", d:["thee","him","them","me","you"] },
        { r:"Romans 8:37", prefix:"Nay, in all these things we are more than conquerors through him that loved", a:"us", suffix:".", d:["you","them","me","her","it"] },
        { r:"Romans 8:38", prefix:"For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to", a:"come", suffix:",", d:["pass","be","end","go","remain"] },
        { r:"Romans 8:39", prefix:"Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our", a:"Lord", suffix:".", d:["King","Saviour","Head","Shepherd","Father"] }
      ]
    },
    {
      id:"revelation21", pace:3, name:"Revelation 21", r:"Revelation 21", subtitle:"And I saw a new heaven and a new earth", after:"patmos", afterName:"Patmos", testament:"nt",
      blanks:[
        { r:"Revelation 21:1", prefix:"And I saw a new heaven and a new", a:"earth", suffix:":", d:["world","city","sea","garden","garment"] },
        { r:"Revelation 21:1", prefix:"for the first heaven and the first earth were passed away; and there was no more", a:"sea", suffix:".", d:["night","death","pain","tears","light"] },
        { r:"Revelation 21:2", prefix:"And I John saw the holy city, new Jerusalem, coming down from God out of", a:"heaven", suffix:",", d:["glory","the sky","the cloud","earth","Zion"] },
        { r:"Revelation 21:4", prefix:"And God shall wipe away all tears from their eyes; and there shall be no more", a:"death", suffix:",", d:["night","pain","fear","sickness","sin"] },
        { r:"Revelation 21:4", prefix:"neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed", a:"away", suffix:".", d:["on","by","off","over","behind"] },
        { r:"Revelation 21:5", prefix:"And he that sat upon the throne said, Behold, I make all things", a:"new", suffix:".", d:["whole","good","true","clean","old"] },
        { r:"Revelation 21:6", prefix:"And he said unto me, It is done. I am Alpha and Omega, the beginning and the", a:"end", suffix:".", d:["last","finish","close","middle","height"] },
        { r:"Revelation 21:23", prefix:"And the city had no need of the sun, neither of the moon, to shine in it: for the glory of God did lighten it, and the", a:"Lamb", suffix:" is the light thereof.", d:["Lord","Word","Son","Father","Spirit"] },
        { r:"Revelation 21:4", prefix:"and there shall be no more death, neither sorrow, nor crying, neither shall there be any more", a:"pain", suffix:":", d:["fear","night","tears","sickness","shame"] },
        { r:"Revelation 21:27", prefix:"And there shall in no wise enter into it any thing that defileth, neither whatsoever worketh abomination, or maketh a lie: but they which are written in the Lamb's book of", a:"life", suffix:".", d:["names","heaven","glory","death","record"] }
      ]
    }
  ];

  function install(T){
    if(!T) return;
    T.canon = CANON;
    CANON.forEach(function(ch){
      let i = 0, found = false;
      for(; i < T.chapters.length; i++) if(T.chapters[i].id === ch.id) found = true;
      if(!found) T.chapters.push(ch);
    });
  }
  if(typeof Tablets !== "undefined") install(Tablets);
  if(typeof module !== "undefined"){
    module.exports = { TABLETS_CANON: CANON, install: install };
    try{ install(require("./tablets.js").Tablets); }catch(e){}
  }
})();
