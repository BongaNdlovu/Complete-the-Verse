#!/usr/bin/env node
/** Writes scripts/verse-extra-plans.js from compact ref tables. */
const fs = require("fs");
const path = require("path");

// [ref, tier] or [ref, tier, answer, [d1,d2,d3]]
const RAW = {
  Genesis: [
    ["3:15", 3, "her seed", ["his seed", "their seed", "thy seed"]],
    ["4:9", 2, "Am I my brother's keeper?", ["Am I my brother's keeper", "Where is thy brother?", "What hast thou done?"]],
    ["8:22", 4, "seedtime and harvest", ["harvest and seedtime", "planting and harvest", "seed and harvest"]],
    ["12:2", 3, "a great nation", ["a mighty nation", "a holy nation", "a chosen nation"]],
    ["15:6", 2, "believed in the LORD", ["believed God", "trusted in the LORD", "believed on the LORD"]],
    ["17:1", 4, "walk before me", ["walk with me", "walk after me", "walk in my ways"]],
    ["18:14", 3, "Is any thing too hard for the LORD?", ["Is anything too hard for the LORD?", "Is any thing too hard for God?", "Shall any thing be too hard for the LORD?"]],
    ["22:14", 3, "Jehovahjireh", ["the LORD will provide", "the LORD seeth", "God will provide"]],
    ["28:15", 2, "I am with thee", ["I will be with thee", "the LORD is with thee", "I am with you"]],
    ["39:2", 4, "the LORD was with him", ["God was with him", "the LORD blessed him", "the LORD prospered him"]],
  ],
  Exodus: [
    ["15:2", 2, "The LORD is my strength and song", ["The LORD is my strength and my song", "God is my strength and song", "The LORD is my rock and song"]],
    ["19:5", 4, "a peculiar treasure", ["a special treasure", "a chosen treasure", "a holy treasure"]],
    ["20:12", 1, "Honour thy father and thy mother", ["Honour thy father and mother", "Honour your father and thy mother", "Honour thy father and thy mother:"]],
    ["33:14", 3, "My presence shall go with thee", ["My face shall go with thee", "I will go with thee", "My spirit shall go with thee"]],
    ["34:6", 4, "merciful and gracious", ["gracious and merciful", "slow to anger", "longsuffering and gracious"]],
    ["34:7", 5, "keeping mercy for thousands", ["keeping mercy for thousands,", "showing mercy for thousands", "keeping mercy unto thousands"]],
  ],
  Leviticus: [
    ["11:45", 4, "ye shall therefore be holy", ["ye shall be holy", "ye shall be holy therefore", "be ye therefore holy"]],
    ["19:2", 3, "Ye shall be holy", ["Ye shall be holy:", "Be ye holy", "Ye shall be sanctified"]],
    ["20:26", 5, "a holy nation", ["an holy nation", "a holy people", "a chosen nation"]],
  ],
  Numbers: [
    ["14:18", 4, "slow to anger", ["longsuffering", "slow to wrath", "patient in anger"]],
    ["21:9", 5, "a serpent of brass", ["a brazen serpent", "a fiery serpent", "a serpent of bronze"]],
    ["32:23", 4, "your sin will find you out", ["your sins will find you out", "your sin shall find you out", "your iniquity will find you out"]],
  ],
  Deuteronomy: [
    ["4:29", 2, "thou shalt find him", ["ye shall find him", "thou shalt find the LORD", "thou shalt find me"]],
    ["8:3", 3, "man doth not live by bread only", ["man shall not live by bread only", "man doth not live by bread alone", "man liveth not by bread only"]],
    ["32:4", 4, "A God of truth", ["The God of truth", "A God of faithfulness", "The God of truth and"]],
  ],
  Joshua: [
    ["1:8", 2, "meditate therein day and night", ["meditate therein day and night:", "meditate on it day and night", "meditate therein night and day"]],
    ["3:5", 4, "Sanctify yourselves", ["Prepare yourselves", "Purify yourselves", "Hallow yourselves"]],
    ["23:14", 5, "not one thing hath failed", ["not one word hath failed", "not one thing hath failed of", "not one hath failed"]],
  ],
  Judges: [
    ["7:2", 5, "The people are yet too many", ["The people are still too many", "The people are yet too great", "The host is yet too many"]],
    ["13:18", 5, "secret", ["wonderful", "hidden", "mysterious"]],
    ["21:25", 3, "every man did that which was right in his own eyes", ["every man did that which was right in his own eyes.", "every man did what was right in his own eyes", "each man did that which was right in his own eyes"]],
  ],
  Ruth: [
    ["1:17", 2, "the LORD do so to me, and more also", ["the LORD do so to me, and more also,", "the LORD do so to me, and more", "God do so to me, and more also"]],
    ["2:12", 2, "under whose wings thou art come to trust", ["under whose wings thou hast come to trust", "under whose wings thou art come", "under his wings thou art come to trust"]],
    ["3:18", 4, "sit still", ["be still", "wait still", "rest still"]],
    ["4:13", 3, "the LORD gave her conception", ["God gave her conception", "the LORD gave her to conceive", "the LORD gave conception"]],
  ],
  "1 Samuel": [
    ["2:2", 3, "There is none holy as the LORD", ["There is none holy like the LORD", "There is none holy as God", "There is none holy as the LORD:"]],
    ["3:10", 4, "Speak, LORD; for thy servant heareth", ["Speak, LORD; for thy servant heareth.", "Speak, Lord; for thy servant heareth", "Speak; for thy servant heareth"]],
    ["17:47", 3, "the battle is the LORD's", ["the battle is the LORD's:", "the battle is God's", "the battle belongeth unto the LORD"]],
  ],
  "2 Samuel": [
    ["7:22", 4, "there is none like thee", ["there is none like thee,", "there is none like you", "there is none like thee, neither is there any God beside thee"]],
    ["12:7", 5, "Thou art the man", ["Thou art the man.", "Thou art that man", "Thou art he"]],
    ["23:2", 5, "The Spirit of the LORD spake by me", ["The Spirit of the LORD spake in me", "The Spirit of God spake by me", "The Spirit of the LORD spoke by me"]],
  ],
  "1 Kings": [
    ["3:9", 4, "an understanding heart", ["a wise heart", "a discerning heart", "an understanding mind"]],
    ["8:27", 5, "heaven and heaven of heavens", ["the heaven and heaven of heavens", "heaven and the heaven of heavens", "heavens and heaven of heavens"]],
    ["17:14", 4, "The barrel of meal shall not waste", ["The barrel of meal shall not waste,", "The meal shall not waste", "The barrel of meal shall not fail"]],
  ],
  "2 Kings": [
    ["2:9", 4, "a double portion", ["a double portion of thy spirit", "twofold portion", "a double measure"]],
    ["5:10", 5, "Go and wash in Jordan seven times", ["Go and wash in the Jordan seven times", "Go wash in Jordan seven times", "Go and wash in Jordan seven times,"]],
    ["20:5", 4, "I have heard thy prayer", ["I have heard thy prayer,", "I have heard thy supplication", "I have heard thy cry"]],
  ],
  "1 Chronicles": [
    ["29:11", 3, "Thine, O LORD, is the greatness", ["Thine, O LORD, is the greatness,", "Thine, O LORD, is greatness", "Thine, O God, is the greatness"]],
    ["29:14", 4, "of thine own have we given thee", ["of thine own have we given thee.", "of thine own we have given thee", "of thine own have we given"]],
    ["28:9", 5, "serve him with a perfect heart", ["serve him with a perfect heart and", "serve him with a whole heart", "serve him with perfect heart"]],
  ],
  "2 Chronicles": [
    ["20:15", 4, "the battle is not yours, but God's", ["the battle is not yours, but God's.", "the battle is not yours, but the LORD's", "the battle is not your's, but God's"]],
    ["20:17", 3, "Ye shall not need to fight in this battle", ["Ye shall not need to fight in this battle:", "Ye shall not need to fight this battle", "Ye need not fight in this battle"]],
    ["32:8", 4, "there be more with us than with him", ["there are more with us than with him", "there be more with us than with them", "more are with us than with him"]],
  ],
  Ezra: [
    ["3:11", 3, "for he is good", ["for he is good,", "for his mercy is good", "for the LORD is good"]],
    ["9:8", 5, "a nail in his holy place", ["a nail in his holy place,", "a peg in his holy place", "a nail in the holy place"]],
    ["10:4", 4, "Arise; for this matter belongeth unto thee", ["Arise; for this matter belongeth unto thee:", "Arise; for this matter is thine", "Arise; for this thing belongeth unto thee"]],
  ],
  Nehemiah: [
    ["2:20", 4, "The God of heaven, he will prosper us", ["The God of heaven, he will prosper us;", "The God of heaven will prosper us", "The God of heaven, he shall prosper us"]],
    ["4:6", 3, "the people had a mind to work", ["the people had a mind to work.", "the people had heart to work", "the people had a mind for work"]],
    ["9:17", 5, "a God ready to pardon", ["a God ready to forgive", "a God ready to pardon,", "a God gracious to pardon"]],
  ],
  Esther: [
    ["2:17", 4, "set the royal crown upon her head", ["set the royal crown upon her head,", "set the crown royal upon her head", "set the royal crown on her head"]],
    ["8:17", 5, "many of the people of the land became Jews", ["many of the people of the land became Jews;", "many people of the land became Jews", "many of the people became Jews"]],
    ["9:22", 5, "days of feasting and joy", ["days of feasting and gladness", "days of joy and feasting", "days of feasting and mirth"]],
  ],
  Job: [
    ["5:17", 5, "Happy is the man whom God correcteth", ["Happy is the man whom God correcteth:", "Blessed is the man whom God correcteth", "Happy is the man God correcteth"]],
    ["23:10", 4, "he knoweth the way that I take", ["he knoweth the way that I take:", "he knoweth my way", "he knoweth the way I take"]],
    ["42:5", 4, "I have heard of thee by the hearing of the ear", ["I have heard of thee by the hearing of the ear:", "I have heard of thee with the hearing of the ear", "I have heard of thee by hearing of the ear"]],
    ["42:6", 5, "I abhor myself, and repent in dust and ashes", ["I abhor myself, and repent in dust and ashes.", "I abhor myself, and repent in dust", "I despise myself, and repent in dust and ashes"]],
  ],
  Psalms: [
    ["2:8", 4], ["4:8", 2], ["8:2", 3], ["16:11", 2], ["18:2", 3], ["24:1", 2], ["25:5", 4],
    ["29:11", 2], ["32:8", 3], ["33:12", 4], ["40:3", 4], ["48:14", 3], ["62:1", 3], ["63:1", 4],
    ["66:19", 4], ["68:19", 3], ["73:26", 2], ["85:10", 4], ["86:11", 4], ["89:1", 5], ["92:1", 3],
    ["95:6", 2], ["103:12", 2], ["107:1", 1], ["116:15", 4], ["118:6", 2], ["119:11", 2],
    ["120:1", 3], ["121:8", 3], ["130:5", 3], ["136:1", 1], ["138:8", 4], ["145:9", 3],
    ["150:6", 2],
  ],
  Proverbs: [
    ["1:7", 2, "The fear of the LORD is the beginning of knowledge", ["The fear of the LORD is the beginning of wisdom", "The fear of God is the beginning of knowledge", "The fear of the LORD is the start of knowledge"]],
    ["3:6", 2, "he shall direct thy paths", ["he will direct thy paths", "he shall direct your paths", "he shall guide thy paths"]],
    ["10:12", 3, "love covereth all sins", ["love covereth all transgressions", "love covereth a multitude of sins", "charity covereth all sins"]],
  ],
  Ecclesiastes: [
    ["1:2", 3, "Vanity of vanities", ["Vanity of vanities;", "Vanity of vanity", "Vanities of vanities"]],
    ["11:1", 5, "Cast thy bread upon the waters", ["Cast thy bread upon the waters:", "Cast your bread upon the waters", "Cast thy bread on the waters"]],
    ["12:1", 2, "Remember now thy Creator", ["Remember thy Creator", "Remember now thy Creator in", "Remember now thy Creator in the days of thy youth"]],
  ],
  "Song of Solomon": [
    ["1:2", 4, "for thy love is better than wine", ["for thy love is better than wine.", "for thy love is better than wine,", "for love is better than wine"]],
    ["4:7", 3, "Thou art all fair, my love", ["Thou art all fair, my love;", "Thou art all fair, my beloved", "Thou art fair, my love"]],
    ["6:3", 4, "I am my beloved's, and my beloved is mine", ["I am my beloved's, and my beloved is mine:", "I am my beloved's, and my beloved is mine.", "I am my beloved's, and my beloved is mine;"]],
  ],
  Isaiah: [
    ["7:14", 3], ["11:6", 4], ["12:2", 2], ["25:8", 4], ["30:21", 4], ["35:4", 3], ["40:8", 2],
    ["42:8", 4], ["45:22", 2], ["49:16", 4], ["54:17", 3], ["61:1", 3],
  ],
  Jeremiah: [
    ["1:5", 4, "Before I formed thee in the belly I knew thee", ["Before I formed thee in the belly I knew thee;", "Before I formed you in the belly I knew thee", "Before I formed thee in the womb I knew thee"]],
    ["10:23", 5, "it is not in man that walketh to direct his steps", ["it is not in man that walketh to direct his steps.", "it is not in man to direct his steps", "it is not in man that walketh to guide his steps"]],
    ["31:3", 3, "I have loved thee with an everlasting love", ["I have loved thee with an everlasting love:", "I have loved you with an everlasting love", "I have loved thee with eternal love"]],
    ["32:27", 4, "Behold, I am the LORD, the God of all flesh", ["Behold, I am the LORD, the God of all flesh:", "Behold, I am the LORD, the God of all flesh: is there any thing too hard for me?", "Behold, I am the LORD, God of all flesh"]],
    ["33:3", 3], // duplicate ref in existing? existing has 33:3 - skip
  ],
  Lamentations: [
    ["3:24", 3, "The LORD is my portion", ["The LORD is my portion,", "The LORD is my portion saith my soul", "The LORD is my part"]],
    ["3:26", 4, "quietly wait for the salvation of the LORD", ["quietly wait for the salvation of the LORD.", "quietly wait for salvation of the LORD", "silently wait for the salvation of the LORD"]],
    ["5:21", 5, "Turn thou us unto thee, O LORD", ["Turn thou us unto thee, O LORD,", "Turn us unto thee, O LORD", "Turn thou us to thee, O LORD"]],
  ],
  Ezekiel: [
    ["11:19", 4, "a new spirit", ["a new heart", "a new spirit will I give", "a right spirit"]],
    ["18:32", 5, "I have no pleasure in the death of him that dieth", ["I have no pleasure in the death of him that dieth,", "I have no pleasure in the death of the wicked", "I have no pleasure in death of him that dieth"]],
    ["34:23", 5, "one shepherd", ["one shepherd,", "a one shepherd", "one shepherd even"]],
  ],
  Daniel: [
    ["2:20", 4, "wisdom and might are his", ["wisdom and might are his:", "wisdom and power are his", "wisdom and strength are his"]],
    ["6:10", 5, "kneeled upon his knees", ["kneeled upon his knees three times", "knelt upon his knees", "bowed upon his knees"]],
    ["9:9", 4, "belongeth mercies and forgivenesses", ["belongeth mercies and forgiveness", "belong mercies and forgivenesses", "belongeth mercy and forgivenesses"]],
  ],
  Hosea: [
    ["2:23", 4, "Thou art my people", ["Thou art my people;", "You are my people", "Thou art my people, and"]],
    ["13:14", 5, "O death, I will be thy plagues", ["O death, I will be thy plagues;", "O grave, I will be thy destruction", "O death, I will be thy destruction"]],
    ["14:4", 4, "I will heal their backsliding", ["I will heal their backsliding,", "I will heal their turning away", "I will heal their apostasy"]],
  ],
  Joel: [
    ["2:13", 3, "slow to anger", ["slow to wrath", "longsuffering", "patient to anger"]],
    ["2:32", 3, "whosoever shall call on the name of the LORD shall be delivered", ["whosoever shall call on the name of the LORD shall be saved", "whosoever shall call upon the name of the LORD shall be delivered", "whosoever shall call on the name of the LORD shall be saved"]],
    ["3:10", 5, "Beat your plowshares into swords", ["Beat your plowshares into swords,", "Beat your plowshares into swords and", "Beat your plowshares to swords"]],
  ],
  Amos: [
    ["4:12", 5, "prepare to meet thy God", ["prepare to meet thy God,", "prepare to meet thy God, O Israel", "prepare to meet your God"]],
    ["5:14", 4, "Seek good, and not evil", ["Seek good, and not evil,", "Seek good, and not evil that ye may live", "Seek the good, and not evil"]],
    ["9:13", 5, "the plowman shall overtake the reaper", ["the plowman shall overtake the reaper,", "the plowman shall overtake the reaper and", "the plowman shall overtake reaper"]],
  ],
  Obadiah: [
    ["1:4", 5, "set thy nest among the stars", ["set thy nest among the stars,", "set your nest among the stars", "set thy nest in the stars"]],
    ["1:17", 4, "upon mount Zion shall be deliverance", ["upon mount Zion shall be deliverance,", "in mount Zion shall be deliverance", "upon mount Zion shall be salvation"]],
    ["1:21", 5, "saviours shall come up on mount Zion", ["saviours shall come up on mount Zion to", "saviours shall come upon mount Zion", "saviours shall come up on mount Zion to judge"]],
  ],
  Jonah: [
    ["1:3", 4, "fled from the presence of the LORD", ["fled from the presence of the LORD,", "fled from the presence of God", "fled from before the LORD"]],
    ["3:10", 4, "God repented of the evil", ["God repented of the evil,", "God relented of the evil", "the LORD repented of the evil"]],
    ["4:2", 5, "a gracious God, and merciful", ["a gracious God, and merciful,", "a gracious God and merciful", "a gracious and merciful God"]],
  ],
  Micah: [
    ["4:3", 4, "beat their swords into plowshares", ["beat their swords into plowshares,", "beat their swords into plowshares and", "they shall beat their swords into plowshares"]],
    ["7:18", 4, "who is a God like unto thee", ["who is a God like unto thee,", "who is a God like unto thee, that pardoneth iniquity", "who is a God like you"]],
    ["7:19", 5, "thou wilt cast all their sins into the depths of the sea", ["thou wilt cast all their sins into the depths of the sea.", "thou wilt cast all their sins into the depths of the sea;", "thou wilt cast their sins into the depths of the sea"]],
  ],
  Nahum: [
    ["1:2", 5, "God is jealous", ["God is jealous,", "The LORD is jealous", "God is a jealous God"]],
    ["1:15", 4, "publish peace", ["publish peace,", "proclaim peace", "preach peace"]],
    ["2:1", 5, "he that dasheth in pieces is come up before thy face", ["he that dasheth in pieces is come up before thy face:", "he that dasheth in pieces is come up before thy face;", "he that scattereth is come up before thy face"]],
  ],
  Habakkuk: [
    ["1:5", 4, "I will work a work in your days", ["I will work a work in your days,", "I will work a work in your days which ye will not believe", "I will do a work in your days"]],
    ["2:14", 4, "the earth shall be filled with the knowledge of the glory of the LORD", ["the earth shall be filled with the knowledge of the glory of the LORD,", "the earth shall be filled with the knowledge of the glory of the LORD, as the waters cover the sea.", "the earth shall be filled with the glory of the LORD"]],
    ["2:20", 3, "the LORD is in his holy temple", ["the LORD is in his holy temple:", "the LORD is in his holy temple: let all the earth keep silence before him.", "God is in his holy temple"]],
  ],
  Zephaniah: [
    ["1:7", 5, "the LORD hath prepared a sacrifice", ["the LORD hath prepared a sacrifice,", "the LORD hath prepared a sacrifice, he hath bid his guests.", "God hath prepared a sacrifice"]],
    ["2:3", 4, "Seek ye the LORD, all ye meek of the earth", ["Seek ye the LORD, all ye meek of the earth,", "Seek ye the LORD, all ye meek of the earth, which have wrought his judgment", "Seek the LORD, all ye meek of the earth"]],
    ["3:17", 3], // existing
  ],
  Haggai: [
    ["1:8", 4, "build the house", ["build the house;", "build the house,", "build ye the house"]],
    ["2:4", 3, "be strong, all ye people of the land", ["be strong, all ye people of the land,", "be strong, all ye people of the land, saith the LORD", "be strong, all people of the land"]],
    ["2:7", 5, "the desire of all nations shall come", ["the desire of all nations shall come:", "the desire of all nations shall come", "the Desire of all nations shall come"]],
  ],
  Zechariah: [
    ["1:3", 4, "Turn ye unto me", ["Turn ye unto me,", "Turn ye unto me, saith the LORD of hosts", "Turn unto me"]],
    ["8:16", 5, "Speak ye every man the truth to his neighbour", ["Speak ye every man the truth to his neighbour:", "Speak ye every man truth to his neighbour", "Speak every man the truth to his neighbour"]],
    ["14:9", 3, "the LORD shall be king over all the earth", ["the LORD shall be king over all the earth:", "the LORD shall be king over all the earth: in that day shall there be one LORD, and his name one.", "the LORD shall be king over all the earth;"]],
  ],
  Malachi: [
    ["2:10", 4, "Have we not all one father?", ["Have we not all one father?", "Have we not all one Father?", "Have we not all one father? hath not one God created us?"]],
    ["3:1", 3, "the Lord, whom ye seek, shall suddenly come to his temple", ["the Lord, whom ye seek, shall suddenly come to his temple,", "the Lord, whom ye seek, shall suddenly come to his temple, even the messenger of the covenant", "the Lord whom ye seek shall suddenly come to his temple"]],
    ["3:16", 5, "a book of remembrance was written before him", ["a book of remembrance was written before him for", "a book of remembrance was written before him,", "a book of remembrance was written before the LORD"]],
  ],
  Matthew: [
    ["4:4", 2], ["4:19", 3], ["5:3", 3], ["5:8", 3], ["5:44", 4], ["6:9", 2], ["6:21", 3],
    ["7:12", 2], ["7:13", 3], ["10:16", 4], ["18:20", 2], ["22:37", 2], ["24:35", 4],
  ],
  Mark: [
    ["1:15", 2, "The time is fulfilled, and the kingdom of God is at hand", ["The time is fulfilled, and the kingdom of God is at hand:", "The time is fulfilled, and the kingdom of God is at hand: repent ye", "The time is fulfilled, and the kingdom of heaven is at hand"]],
    ["4:39", 4, "Peace, be still", ["Peace, be still.", "Peace, be still", "Be still"]],
    ["9:24", 3, "Lord, I believe; help thou mine unbelief", ["Lord, I believe; help thou mine unbelief.", "Lord, I believe; help my unbelief", "Lord, I believe; help thou my unbelief"]],
    ["12:30", 2, "thou shalt love the Lord thy God with all thy heart", ["thou shalt love the Lord thy God with all thy heart,", "thou shalt love the Lord thy God with all thy heart, and with all thy soul", "you shall love the Lord thy God with all thy heart"]],
  ],
  Luke: [
    ["1:38", 3, "be it unto me according to thy word", ["be it unto me according to thy word.", "be it unto me according to your word", "be it done unto me according to thy word"]],
    ["2:14", 2, "Glory to God in the highest", ["Glory to God in the highest,", "Glory to God in the highest, and on earth peace", "Glory be to God in the highest"]],
    ["2:52", 4, "in favour with God and man", ["in favour with God and man.", "in favor with God and man", "in favour with God and with man"]],
    ["10:27", 2, "Thou shalt love the Lord thy God with all thy heart", ["Thou shalt love the Lord thy God with all thy heart,", "Thou shalt love the Lord thy God with all thy heart, and with all thy soul", "You shall love the Lord thy God with all thy heart"]],
  ],
  John: [
    ["1:12", 2], ["1:29", 3], ["4:24", 3], ["6:35", 2], ["8:12", 2], ["11:25", 2], ["13:34", 2],
    ["14:1", 1], ["14:27", 2], ["16:33", 3],
  ],
  Acts: [
    ["2:38", 2, "Repent, and be baptized every one of you", ["Repent, and be baptized every one of you in", "Repent, and be baptized every one of you in the name of Jesus Christ", "Repent, and be baptized every one of you,"]],
    ["5:29", 3, "We ought to obey God rather than men", ["We ought to obey God rather than men.", "We ought to obey God rather than men", "We must obey God rather than men"]],
    ["16:31", 1, "Believe on the Lord Jesus Christ, and thou shalt be saved", ["Believe on the Lord Jesus Christ, and thou shalt be saved,", "Believe on the Lord Jesus Christ, and thou shalt be saved, and thy house.", "Believe on the Lord Jesus Christ, and you shall be saved"]],
    ["20:35", 4, "It is more blessed to give than to receive", ["It is more blessed to give than to receive.", "It is more blessed to give than to receive", "It is more blessed to give than receive"]],
  ],
  Romans: [
    ["1:16", 2], ["3:10", 3], ["5:1", 2], ["8:1", 2], ["8:31", 2], ["12:1", 3], ["12:21", 3],
    ["13:10", 4], ["14:8", 4], ["15:13", 3],
  ],
  "1 Corinthians": [
    ["1:18", 3, "the preaching of the cross", ["the preaching of the cross is", "the message of the cross", "the preaching of the cross is to them that perish foolishness"]],
    ["3:16", 4, "the temple of God", ["the temple of God is holy", "a temple of God", "the temple of the LORD"]],
    ["6:19", 3, "your body is the temple of the Holy Ghost", ["your body is the temple of the Holy Ghost which is in you", "your body is a temple of the Holy Ghost", "your body is the temple of the Holy Spirit"]],
    ["15:57", 4, "But thanks be to God, which giveth us the victory", ["But thanks be to God, which giveth us the victory through our Lord Jesus Christ.", "But thanks be to God, which giveth us the victory through", "But thanks be to God, who giveth us the victory"]],
  ],
  "2 Corinthians": [
    ["4:7", 4, "treasure in earthen vessels", ["treasure in earthen vessels,", "treasure in earthen vessels, that the excellency of the power may be of God", "treasure in clay vessels"]],
    ["9:7", 3, "God loveth a cheerful giver", ["God loveth a cheerful giver.", "God loves a cheerful giver", "the Lord loveth a cheerful giver"]],
    ["13:14", 4, "The grace of the Lord Jesus Christ", ["The grace of the Lord Jesus Christ,", "The grace of the Lord Jesus Christ, and the love of God", "The grace of our Lord Jesus Christ"]],
    ["1:3", 5, "the Father of mercies", ["the Father of mercies,", "the Father of mercies, and the God of all comfort", "the God of mercies"]],
  ],
  Galatians: [
    ["3:28", 3, "ye are all one in Christ Jesus", ["ye are all one in Christ Jesus.", "ye are all one in Christ Jesus", "you are all one in Christ Jesus"]],
    ["5:1", 3, "Stand fast therefore in the liberty wherewith Christ hath made us free", ["Stand fast therefore in the liberty wherewith Christ hath made us free,", "Stand fast therefore in the liberty wherewith Christ hath made us free, and be not entangled again with the yoke of bondage.", "Stand fast in the liberty wherewith Christ hath made us free"]],
    ["6:7", 3, "whatsoever a man soweth, that shall he also reap", ["whatsoever a man soweth, that shall he also reap.", "whatsoever a man soweth, that shall he also reap", "whatsoever a man sows, that shall he also reap"]],
    ["6:14", 4, "God forbid that I should glory, save in the cross of our Lord Jesus Christ", ["God forbid that I should glory, save in the cross of our Lord Jesus Christ,", "God forbid that I should glory, save in the cross of our Lord Jesus Christ, by whom the world is crucified unto me, and I unto the world.", "God forbid that I should glory save in the cross of our Lord Jesus Christ"]],
  ],
  Ephesians: [
    ["1:7", 3, "redemption through his blood", ["redemption through his blood,", "redemption through his blood, the forgiveness of sins", "redemption through the blood"]],
    ["4:32", 3, "forgiving one another", ["forgiving one another,", "forgiving one another, even as God for Christ's sake hath forgiven you.", "forgiving one another even as God for Christ's sake hath forgiven you"]],
    ["5:25", 4, "Husbands, love your wives", ["Husbands, love your wives,", "Husbands, love your wives, even as Christ also loved the church", "Husbands, love your wives even as Christ also loved the church"]],
    ["6:11", 3, "Put on the whole armour of God", ["Put on the whole armour of God,", "Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.", "Put on the whole armor of God"]],
  ],
  Philippians: [
    ["1:21", 3, "For to me to live is Christ, and to die is gain", ["For to me to live is Christ, and to die is gain.", "For to me to live is Christ, and to die is gain", "For to me to live is Christ, and to die is gain,"]],
    ["2:5", 4, "Let this mind be in you, which was also in Christ Jesus", ["Let this mind be in you, which was also in Christ Jesus:", "Let this mind be in you, which was also in Christ Jesus", "Let this mind be in you which was also in Christ Jesus"]],
    ["3:14", 4, "I press toward the mark", ["I press toward the mark for the prize of the high calling of God in Christ Jesus.", "I press toward the mark for", "I press toward the mark for the prize"]],
  ],
  Colossians: [
    ["1:15", 4, "the firstborn of every creature", ["the firstborn of every creature:", "the firstborn of all creation", "the firstborn of every creature;"]],
    ["2:6", 3, "walk ye in him", ["walk ye in him:", "walk ye in him, rooted and built up in him", "walk in him"]],
    ["3:2", 3, "Set your affection on things above", ["Set your affection on things above,", "Set your affection on things above, not on things on the earth.", "Set your mind on things above"]],
  ],
  "1 Thessalonians": [
    ["4:13", 4, "that ye sorrow not, even as others which have no hope", ["that ye sorrow not, even as others which have no hope.", "that ye sorrow not, even as others which have no hope", "that ye sorrow not even as others which have no hope"]],
    ["5:16", 1, "Rejoice evermore", ["Rejoice evermore.", "Rejoice evermore", "Rejoice always"]],
    ["5:23", 5, "the very God of peace sanctify you wholly", ["the very God of peace sanctify you wholly;", "the very God of peace sanctify you wholly", "the God of peace sanctify you wholly"]],
  ],
  "2 Thessalonians": [
    ["1:11", 5, "that our God would count you worthy of this calling", ["that our God would count you worthy of this calling,", "that our God would count you worthy of this calling, and fulfil all the good pleasure of his goodness", "that God would count you worthy of this calling"]],
    ["2:15", 4, "stand fast, and hold the traditions which ye have been taught", ["stand fast, and hold the traditions which ye have been taught,", "stand fast, and hold the traditions which ye have been taught, whether by word, or our epistle.", "stand fast, and hold the traditions which ye have been taught whether by word, or our epistle."]],
    ["3:10", 4, "If any would not work, neither should he eat", ["If any would not work, neither should he eat.", "If any would not work, neither should he eat", "If any will not work, neither should he eat"]],
  ],
  "1 Timothy": [
    ["1:15", 3, "Christ Jesus came into the world to save sinners", ["Christ Jesus came into the world to save sinners;", "Christ Jesus came into the world to save sinners", "Jesus Christ came into the world to save sinners"]],
    ["2:5", 3, "one mediator between God and men", ["one mediator between God and men,", "one mediator between God and men, the man Christ Jesus;", "one mediator between God and men, the man Christ Jesus"]],
    ["6:12", 4, "Fight the good fight of faith", ["Fight the good fight of faith,", "Fight the good fight of faith, lay hold on eternal life", "Fight the good fight of faith, lay hold on eternal life,"]],
  ],
  "2 Timothy": [
    ["2:2", 4, "faithful men", ["faithful men,", "faithful men, who shall be able to teach others also.", "faithful men who shall be able to teach others also"]],
    ["4:7", 3, "I have fought a good fight", ["I have fought a good fight,", "I have fought a good fight, I have finished my course", "I have fought the good fight"]],
    ["4:8", 4, "a crown of righteousness", ["a crown of righteousness,", "a crown of righteousness, which the Lord, the righteous judge, shall give me at that day", "the crown of righteousness"]],
  ],
  Titus: [
    ["1:2", 5, "hope of eternal life", ["hope of eternal life,", "hope of eternal life, which God, that cannot lie, promised before the world began;", "hope of everlasting life"]],
    ["2:12", 4, "denying ungodliness and worldly lusts", ["denying ungodliness and worldly lusts,", "denying ungodliness and worldly lusts, we should live soberly", "denying ungodliness and worldly lusts, we should live"]],
    ["3:8", 5, "maintain good works", ["maintain good works.", "maintain good works", "be careful to maintain good works"]],
  ],
  Philemon: [
    ["1:4", 4, "I thank my God", ["I thank my God,", "I thank my God, making mention of thee always in my prayers", "I thank God"]],
    ["1:9", 5, "being such an one as Paul the aged", ["being such an one as Paul the aged,", "being such an one as Paul the aged, and now also a prisoner of Jesus Christ.", "being such a one as Paul the aged"]],
    ["1:16", 4, "Not now as a servant, but above a servant", ["Not now as a servant, but above a servant,", "Not now as a servant, but above a servant, a brother beloved", "Not now as a servant, but more than a servant"]],
  ],
  Hebrews: [
    ["1:1", 4, "spake in time past unto the fathers by the prophets", ["spake in time past unto the fathers by the prophets,", "spake in time past unto the fathers by the prophets", "spake of old time to the fathers by the prophets"]],
    ["2:18", 5, "in that he himself hath suffered being tempted", ["in that he himself hath suffered being tempted,", "in that he himself hath suffered being tempted, he is able to succour them that are tempted.", "in that he himself hath suffered being tempted, he is able to succour"]],
    ["3:13", 4, "exhort one another daily", ["exhort one another daily,", "exhort one another daily, while it is called To day", "exhort one another daily, while it is called To day;"]],
    ["10:25", 3, "Not forsaking the assembling of ourselves together", ["Not forsaking the assembling of ourselves together,", "Not forsaking the assembling of ourselves together, as the manner of some is", "Not forsaking the assembling of ourselves together, as the manner of some is;"]],
  ],
  James: [
    ["1:5", 2, "If any of you lack wisdom, let him ask of God", ["If any of you lack wisdom, let him ask of God,", "If any of you lack wisdom, let him ask of God, that giveth to all men liberally", "If any of you lack wisdom, let him ask of God, that giveth to all men liberally,"]],
    ["2:26", 4, "faith without works is dead", ["faith without works is dead.", "faith without works is dead", "faith without works is dead also"]],
    ["3:17", 5, "first pure, then peaceable", ["first pure, then peaceable,", "first pure, then peaceable, gentle", "first pure, then peaceable, gentle,"]],
  ],
  "1 Peter": [
    ["1:16", 3, "Be ye holy; for I am holy", ["Be ye holy; for I am holy.", "Be ye holy; for I am holy", "Be holy; for I am holy"]],
    ["2:24", 3, "by whose stripes ye were healed", ["by whose stripes ye were healed.", "by whose stripes ye were healed", "by whose stripes you were healed"]],
    ["3:15", 3, "be ready always to give an answer", ["be ready always to give an answer to every man that asketh you", "be ready always to give an answer to every man that asketh you a reason of the hope that is in you", "be ready always to give an answer to every man"]],
  ],
  "2 Peter": [
    ["1:4", 5, "exceeding great and precious promises", ["exceeding great and precious promises:", "exceeding great and precious promises", "great and precious promises"]],
    ["2:9", 4, "the Lord knoweth how to deliver the godly out of temptations", ["the Lord knoweth how to deliver the godly out of temptations,", "the Lord knoweth how to deliver the godly out of temptations, and to reserve the unjust unto the day of judgment to be punished:", "the Lord knoweth how to deliver the godly out of temptation"]],
    ["3:18", 5, "grow in grace, and in the knowledge of our Lord and Saviour Jesus Christ", ["grow in grace, and in the knowledge of our Lord and Saviour Jesus Christ.", "grow in grace, and in the knowledge of our Lord and Saviour Jesus Christ", "grow in grace and in the knowledge of our Lord and Saviour Jesus Christ"]],
  ],
  "1 John": [
    ["2:15", 3, "Love not the world", ["Love not the world,", "Love not the world, neither the things that are in the world.", "Love not the world, neither the things that are in the world"]],
    ["3:1", 3, "what manner of love the Father hath bestowed upon us", ["what manner of love the Father hath bestowed upon us,", "what manner of love the Father hath bestowed upon us, that we should be called the sons of God", "what manner of love the Father hath bestowed upon us, that we should be called the sons of God:"]],
    ["5:14", 4, "if we ask any thing according to his will, he heareth us", ["if we ask any thing according to his will, he heareth us:", "if we ask any thing according to his will, he heareth us", "if we ask anything according to his will, he heareth us"]],
  ],
  "2 John": [
    ["1:4", 4, "I rejoiced greatly that I found of thy children walking in truth", ["I rejoiced greatly that I found of thy children walking in truth,", "I rejoiced greatly that I found of thy children walking in truth, as we have received a commandment from the Father.", "I rejoiced greatly that I found thy children walking in truth"]],
    ["1:10", 5, "receive him not into your house", ["receive him not into your house,", "receive him not into your house, neither bid him God speed:", "receive him not into your house, neither bid him God speed"]],
    ["1:11", 5, "he that biddeth him God speed is partaker of his evil deeds", ["he that biddeth him God speed is partaker of his evil deeds.", "he that biddeth him God speed is partaker of his evil deeds", "he that biddeth him God speed is partaker of his evil deeds,"]],
  ],
  "3 John": [
    ["1:8", 4, "fellowhelpers to the truth", ["fellowhelpers to the truth.", "fellowhelpers to the truth", "fellow helpers to the truth"]],
    ["1:11", 5, "follow not that which is evil, but that which is good", ["follow not that which is evil, but that which is good.", "follow not that which is evil, but that which is good", "follow not that which is evil, but that which is good. He that doeth good is of God"]],
    ["1:12", 4, "Demetrius hath good report of all men", ["Demetrius hath good report of all men,", "Demetrius hath good report of all men, and of the truth itself", "Demetrius hath good report of all men, and of the truth itself:"]],
  ],
  Jude: [
    ["1:21", 4, "Keep yourselves in the love of God", ["Keep yourselves in the love of God,", "Keep yourselves in the love of God, looking for the mercy of our Lord Jesus Christ unto eternal life.", "Keep yourselves in the love of God, looking for the mercy"]],
    ["1:25", 5, "To the only wise God our Saviour", ["To the only wise God our Saviour,", "To the only wise God our Saviour, be glory and majesty", "To the only wise God our Saviour, be glory and majesty,"]],
    ["1:22", 5, "of some have compassion, making a difference", ["of some have compassion, making a difference:", "of some have compassion, making a difference", "on some have compassion, making a difference"]],
  ],
  Revelation: [
    ["2:10", 4, "be thou faithful unto death", ["be thou faithful unto death,", "be thou faithful unto death, and I will give thee a crown of life.", "be faithful unto death"]],
    ["4:8", 5, "Holy, holy, holy, Lord God Almighty", ["Holy, holy, holy, Lord God Almighty,", "Holy, holy, holy, Lord God Almighty, which was, and is, and is to come.", "Holy, holy, holy, Lord God Almighty, which was, and is, and is to come"]],
    ["5:12", 5, "Worthy is the Lamb that was slain", ["Worthy is the Lamb that was slain to receive power", "Worthy is the Lamb that was slain to", "Worthy is the Lamb that was slain to receive power, and riches"]],
  ],
};

// Additional ref-only candidates (auto blank + distractors from build script)
const BULK = {
  Genesis: [[1, 27, 2], [6, 8, 3], [11, 6, 4], [13, 15, 3], [24, 14, 4], [32, 28, 4], [45, 5, 3]],
  Exodus: [[12, 13, 2], [16, 15, 3], [20, 8, 1], [25, 8, 5], [33, 19, 4]],
  Leviticus: [[19, 11, 4], [26, 12, 5]],
  Numbers: [[11, 23, 4], [24, 17, 3]],
  Deuteronomy: [[5, 7, 2], [10, 12, 3], [30, 19, 2], [32, 31, 4]],
  Joshua: [[4, 24, 3], [10, 8, 4]],
  Judges: [[7, 7, 4], [16, 28, 3]],
  Ruth: [[1, 1, 2], [4, 16, 2]],
  "1 Samuel": [[3, 19, 4], [12, 24, 3]],
  "2 Samuel": [[7, 12, 3], [12, 13, 4]],
  "1 Kings": [[4, 34, 4], [8, 23, 3]],
  "2 Kings": [[4, 34, 3], [6, 17, 4]],
  "1 Chronicles": [[16, 11, 3], [29, 13, 2]],
  "2 Chronicles": [[15, 2, 4], [30, 9, 3]],
  Ezra: [[1, 2, 4], [8, 22, 3]],
  Nehemiah: [[1, 5, 3], [4, 14, 2]],
  Esther: [[1, 17, 4], [5, 14, 3]],
  Job: [[14, 1, 4], [28, 28, 5], [38, 4, 5]],
  Psalms: [[3, 5, 2], [5, 3, 3], [9, 10, 3], [16, 8, 2], [17, 8, 3], [18, 30, 3], [20, 7, 2], [25, 4, 3], [31, 24, 3], [32, 1, 2], [34, 18, 3], [36, 7, 3], [37, 5, 2], [40, 8, 3], [41, 1, 3], [43, 5, 3], [45, 6, 4], [46, 10, 3], [47, 1, 3], [51, 17, 3], [55, 22, 3], [57, 1, 3], [61, 2, 3], [62, 5, 3], [65, 11, 3], [66, 1, 2], [67, 1, 2], [68, 35, 4], [69, 30, 4], [71, 5, 3], [72, 18, 4], [77, 13, 4], [81, 10, 4], [85, 8, 3], [86, 5, 3], [89, 15, 4], [90, 2, 3], [92, 13, 4], [93, 4, 3], [94, 19, 4], [96, 1, 2], [97, 1, 3], [98, 1, 2], [99, 5, 3], [101, 2, 4], [103, 1, 1], [103, 3, 2], [104, 24, 4], [107, 9, 3], [110, 1, 4], [111, 10, 3], [112, 1, 3], [113, 3, 2], [115, 1, 3], [116, 1, 2], [117, 2, 1], [118, 8, 2], [119, 89, 4], [120, 7, 4], [121, 2, 2], [124, 8, 3], [125, 1, 3], [126, 5, 3], [127, 1, 3], [128, 1, 3], [130, 7, 3], [131, 1, 3], [132, 13, 4], [133, 3, 4], [134, 3, 2], [135, 3, 2], [136, 26, 3], [138, 2, 3], [139, 23, 4], [140, 12, 4], [141, 3, 4], [142, 5, 4], [143, 8, 3], [144, 1, 3], [145, 18, 3], [146, 5, 3], [147, 1, 2], [148, 1, 2], [149, 1, 3]],
  Proverbs: [[6, 6, 3], [10, 22, 2], [11, 14, 3], [12, 25, 3], [13, 12, 3], [14, 12, 3], [16, 9, 3], [16, 18, 3], [16, 31, 3], [17, 17, 3], [19, 21, 3], [20, 1, 3], [21, 31, 4], [23, 7, 4], [25, 28, 4], [26, 20, 4], [28, 13, 3], [29, 18, 4], [30, 5, 4], [31, 10, 3]],
  Ecclesiastes: [[4, 9, 2], [7, 8, 3], [9, 10, 3], [10, 19, 4]],
  "Song of Solomon": [[2, 4, 3], [5, 16, 4]],
  Isaiah: [[6, 3, 4], [9, 2, 3], [12, 5, 3], [14, 12, 5], [26, 4, 3], [28, 16, 4], [32, 17, 3], [33, 22, 3], [35, 10, 3], [40, 3, 3], [42, 1, 4], [43, 1, 2], [44, 22, 3], [46, 4, 4], [49, 25, 4], [50, 7, 4], [51, 11, 3], [52, 7, 4], [53, 6, 2], [55, 1, 2], [55, 11, 3], [57, 15, 4], [58, 11, 4], [59, 1, 4], [60, 1, 4], [61, 3, 3], [62, 5, 4], [64, 8, 4], [65, 17, 4]],
  Jeremiah: [[2, 13, 4], [9, 23, 3], [15, 16, 4], [17, 7, 3], [23, 29, 4], [29, 13, 3], [31, 31, 4], [32, 17, 3]],
  Lamentations: [[1, 1, 4], [3, 40, 4]],
  Ezekiel: [[3, 17, 4], [14, 6, 4], [22, 30, 4], [33, 11, 3], [37, 27, 4], [47, 12, 5]],
  Daniel: [[1, 8, 4], [4, 35, 4], [7, 27, 5], [9, 23, 4], [10, 19, 4]],
  Hosea: [[6, 1, 4], [11, 1, 3], [14, 1, 3]],
  Joel: [[1, 15, 4], [2, 25, 4]],
  Amos: [[3, 7, 4], [8, 11, 5]],
  Obadiah: [[1, 1, 4]],
  Jonah: [[2, 8, 3], [4, 11, 4]],
  Micah: [[5, 4, 3], [6, 6, 4]],
  Nahum: [[1, 7, 3]],
  Habakkuk: [[3, 17, 4], [3, 18, 3]],
  Zephaniah: [[2, 3, 3], [3, 5, 4]],
  Haggai: [[2, 9, 4]],
  Zechariah: [[2, 10, 4], [3, 2, 4], [7, 9, 4], [12, 10, 4], [13, 9, 5]],
  Malachi: [[1, 6, 4], [3, 6, 3], [4, 5, 4]],
  Matthew: [[1, 23, 3], [3, 2, 3], [3, 17, 2], [5, 4, 2], [5, 9, 2], [5, 13, 2], [5, 17, 3], [6, 6, 2], [6, 14, 3], [6, 34, 2], [7, 1, 3], [7, 14, 3], [7, 21, 3], [8, 26, 3], [9, 37, 3], [10, 8, 3], [12, 30, 3], [12, 37, 4], [13, 44, 3], [16, 18, 2], [17, 20, 3], [19, 26, 4], [20, 28, 3], [23, 39, 4], [24, 42, 4], [25, 21, 4], [26, 41, 3], [27, 46, 4]],
  Mark: [[2, 17, 3], [4, 9, 3], [8, 34, 3], [9, 23, 2], [10, 45, 3], [12, 31, 2], [13, 31, 4], [16, 6, 3]],
  Luke: [[1, 37, 2], [1, 47, 2], [2, 11, 2], [4, 18, 3], [5, 32, 3], [6, 38, 3], [9, 23, 3], [11, 9, 2], [12, 34, 3], [15, 7, 3], [16, 13, 4], [17, 21, 4], [18, 1, 3], [21, 36, 4], [23, 34, 4], [24, 32, 4]],
  John: [[1, 14, 2], [3, 3, 2], [3, 30, 3], [4, 14, 2], [5, 24, 2], [6, 47, 2], [6, 51, 3], [7, 38, 3], [8, 36, 3], [9, 5, 3], [10, 11, 2], [10, 27, 2], [11, 26, 2], [12, 32, 3], [13, 35, 3], [14, 2, 2], [14, 13, 3], [15, 13, 2], [16, 13, 4], [17, 3, 3], [20, 31, 3]],
  Acts: [[1, 11, 3], [2, 21, 4], [3, 19, 2], [4, 20, 4], [5, 42, 4], [7, 59, 5], [9, 6, 3], [10, 34, 3], [13, 38, 3], [16, 25, 4], [17, 11, 4], [20, 24, 4], [24, 16, 4]],
  Romans: [[1, 17, 3], [2, 4, 3], [4, 5, 3], [4, 20, 4], [6, 14, 3], [7, 24, 4], [8, 14, 3], [8, 18, 3], [8, 26, 4], [8, 37, 2], [9, 33, 4], [11, 33, 4], [12, 12, 2], [12, 17, 3], [13, 1, 3], [14, 17, 3], [15, 4, 3]],
  "1 Corinthians": [[2, 9, 4], [6, 20, 3], [7, 19, 4], [9, 24, 3], [10, 31, 3], [11, 1, 2], [12, 13, 3], [13, 8, 3], [13, 13, 2], [14, 33, 3], [15, 10, 4], [15, 33, 3], [16, 14, 4]],
  "2 Corinthians": [[1, 4, 4], [3, 18, 4], [4, 16, 3], [5, 21, 3], [6, 14, 4], [8, 9, 3], [10, 4, 4], [11, 14, 5], [12, 9, 3]],
  Galatians: [[3, 13, 4], [4, 4, 4], [5, 13, 3], [5, 16, 3], [5, 24, 4], [6, 2, 3]],
  Ephesians: [[1, 3, 4], [2, 10, 3], [3, 20, 3], [4, 2, 3], [4, 26, 3], [4, 29, 3], [5, 2, 3], [5, 8, 3], [5, 11, 4], [6, 1, 2], [6, 10, 3]],
  Philippians: [[1, 6, 3], [2, 3, 3], [2, 8, 4], [2, 11, 3], [3, 10, 4], [4, 4, 1], [4, 7, 2], [4, 8, 2], [4, 19, 2]],
  Colossians: [[1, 13, 3], [1, 18, 3], [2, 8, 4], [2, 9, 4], [3, 1, 3], [3, 12, 3], [3, 16, 3], [4, 2, 3], [4, 6, 3]],
  "1 Thessalonians": [[1, 3, 3], [2, 13, 4], [4, 16, 4], [5, 6, 3], [5, 22, 3]],
  "2 Thessalonians": [[2, 16, 4], [3, 13, 3]],
  "1 Timothy": [[2, 1, 3], [3, 16, 4], [4, 8, 3], [6, 6, 3], [6, 11, 3], [6, 17, 4]],
  "2 Timothy": [[1, 9, 4], [2, 3, 4], [2, 13, 3], [3, 12, 4], [4, 2, 3], [4, 18, 4]],
  Titus: [[1, 9, 4], [2, 14, 4], [3, 1, 3], [3, 8, 4]],
  Philemon: [[1, 7, 3], [1, 17, 4], [1, 25, 4]],
  Hebrews: [[2, 14, 4], [3, 8, 3], [4, 15, 3], [4, 16, 2], [6, 10, 4], [7, 25, 4], [9, 14, 4], [9, 27, 3], [10, 23, 2], [11, 6, 2], [12, 2, 3], [12, 28, 3], [13, 5, 2], [13, 16, 4]],
  James: [[1, 12, 3], [2, 8, 3], [2, 19, 3], [3, 1, 4], [3, 8, 4], [4, 8, 3], [5, 16, 3]],
  "1 Peter": [[1, 3, 3], [1, 7, 4], [1, 8, 3], [1, 25, 4], [2, 5, 3], [2, 11, 4], [3, 18, 4], [4, 8, 2], [4, 10, 3], [5, 5, 3], [5, 8, 3]],
  "2 Peter": [[1, 2, 4], [1, 5, 3], [2, 1, 4], [3, 14, 4]],
  "1 John": [[1, 7, 2], [2, 1, 3], [2, 6, 3], [3, 16, 3], [3, 18, 3], [4, 7, 2], [4, 19, 2], [5, 3, 3], [5, 11, 3], [5, 14, 3]],
  "2 John": [[1, 1, 4], [1, 5, 4]],
  "3 John": [[1, 1, 4], [1, 3, 4]],
  Jude: [[1, 1, 4], [1, 6, 5], [1, 20, 4]],
  Revelation: [[1, 5, 3], [1, 17, 4], [2, 4, 4], [3, 19, 4], [4, 11, 4], [5, 9, 4], [7, 9, 4], [14, 13, 4], [19, 6, 4], [21, 1, 3], [21, 6, 3], [21, 27, 4], [22, 17, 3]],
};

for (const [book, rows] of Object.entries(BULK)) {
  if (!RAW[book]) RAW[book] = [];
  for (const [ch, vs, t] of rows) {
    const ref = `${ch}:${vs}`;
    if (!RAW[book].some((x) => x[0] === ref)) RAW[book].push([ref, t]);
  }
}

// Remove duplicate Jeremiah 33:3 (already in base)
RAW.Jeremiah = RAW.Jeremiah.filter((x) => x[0] !== "33:3");
// Remove duplicate Zephaniah 3:17
RAW.Zephaniah = RAW.Zephaniah.filter((x) => x[0] !== "3:17");

function toItem(row) {
  const [ref, t, a, d] = row;
  const item = { ref, t };
  if (a) item.a = a;
  if (d) item.d = d;
  return item;
}

const PLANS = {};
for (const [book, rows] of Object.entries(RAW)) {
  PLANS[book] = rows.map(toItem);
}

const out = `/** Curated verse expansion plans — ref, tier, optional KJV answer + distractors */\nmodule.exports = { PLANS: ${JSON.stringify(PLANS, null, 2)} };\n`;
fs.writeFileSync(path.join(__dirname, "verse-extra-plans.js"), out, "utf8");

let n = 0;
for (const rows of Object.values(PLANS)) n += rows.length;
console.log("Wrote verse-extra-plans.js with", n, "specs");
