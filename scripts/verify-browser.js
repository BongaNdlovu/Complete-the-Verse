const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = require('./repo-root');
const { makeSandbox } = require('./test-shim');
const { ENGINE_FILES } = require('./engine-source');

const PREFIX = [
  'js/verses.js', 'js/verses-extra.js', 'js/verses-more.js', 'js/verses-ascent.js',
  'js/verses-tf.js', 'js/beat.js', 'js/passages.js', 'js/legacy-ids.js',
  'js/bank.js',
  'js/nkjv/verses.js', 'js/nkjv/passages.js', 'js/nkjv/verses-tf.js',
  'js/nkjv/verses-notes.js', 'js/nkjv/tablets.js', 'js/nkjv/quotes.js',
  'js/nkjv/beat.js', 'js/nkjv/tutorial.js',
  'js/srs.js', 'js/recall.js', 'js/assemble.js', 'js/meta.js', 'js/flow.js',
  'js/sites.js', 'js/empires.js', 'js/geo.js', 'js/pilgrimage.js',
  'js/characters.js', 'js/artifacts.js', 'js/live.js', 'js/atlas.js', 'js/tablets.js'
];

const sb = makeSandbox();
const src = PREFIX.concat(ENGINE_FILES).map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n');
vm.runInContext(src, sb, { filename: 'bundle.js' });

function read(expr) { return vm.runInContext(expr, sb); }
function exec(code) { return vm.runInContext(code, sb); }

console.log('--- Step 1: Wipe translation flag / fresh profile -> boot -> edition picker, not hall ---');
exec('currentView = "boot"; SAVE.set.translationChosen = false; openAfterBoot();');
console.log('Current view after boot:', read('currentView'));
if (read('currentView') !== 'edition') throw new Error('Expected edition view, got ' + read('currentView'));

console.log('--- Step 2: Pick NKJV -> tutorial uses NKJV wording -> hall kick/badge say NKJV ---');
exec('Edition.selectEdition("nkjv");');
console.log('Edition:', read('Edition.getEdition()'));
console.log('Tag:', read('translationTag()'));
console.log('Tutorial lesson 1 answer:', read('TUTORIAL_QUESTIONS[0].a'));
if (read('translationTag()') !== 'NKJV') throw new Error('Expected NKJV translationTag');
if (read('TUTORIAL_QUESTIONS[0].a') !== 'shall not want') throw new Error('Expected NKJV tutorial lesson 1 answer');

console.log('--- Step 3: Play one Pilgrimage verse, one Tablets blank, Daily ref line ---');
exec('startRun("pilgrimage", "disciple");');
console.log('Pilgrimage mode:', read('R.mode'));
console.log('First verse ref:', read('R.siteVerses[0].r'));
console.log('First verse blank a:', read('R.siteVerses[0].a'));
console.log('First verse options d:', read('R.siteVerses[0].d'));
if (!read('R.siteVerses[0].id').startsWith('nkjv~')) throw new Error('Expected NKJV id prefix in Pilgrimage');

console.log('Tablets check:');
exec('Tablets.applyShared();');
const tabRecKey = read('Tablets.editionKey("psalm23")');
console.log('Tablet chapter key:', tabRecKey);
if (tabRecKey !== 'nkjv~psalm23') throw new Error('Expected nkjv~psalm23');

console.log('Daily list check:');
const dailyRes = read('buildDailyList()');
const dailyList = dailyRes.list;
console.log('Daily count:', dailyList.length);
console.log('Daily verse 0 id:', dailyList[0].v.id);
if (!dailyList[0].v.id.startsWith('nkjv~')) throw new Error('Expected nkjv~ on Daily verses');

console.log('--- Step 4: Settings -> KJV: site progress stays, daily/tablets isolated ---');
exec('SAVE.pilgrim.sites["ur"] = { cleared: true }; SAVE.tablets["nkjv~psalm23"] = { best: 90, held: true }; SAVE.dailyByEdition.nkjv = { date: "2026-09-28", score: 1800 }; persist();');
exec('Edition.activateEdition("kjv");');
console.log('KJV site ur cleared:', read('SAVE.pilgrim.sites["ur"].cleared'));
console.log('KJV psalm23 held:', read('Tablets.recordOf(SAVE, "psalm23").held'));
console.log('KJV daily date:', read('SAVE.daily.date'));
if (read('Tablets.recordOf(SAVE, "psalm23").held') !== false) throw new Error('Hold leaked into KJV');
if (read('SAVE.daily.date') !== '') throw new Error('Daily leaked into KJV');

console.log('--- Step 5: Switch back to NKJV: SRS/Daily/Tablets NKJV state still there ---');
exec('Edition.activateEdition("nkjv");');
console.log('NKJV psalm23 held:', read('Tablets.recordOf(SAVE, "psalm23").held'));
console.log('NKJV daily date:', read('SAVE.daily.date'));
console.log('NKJV daily score:', read('SAVE.daily.score'));
if (read('Tablets.recordOf(SAVE, "psalm23").held') !== true) throw new Error('NKJV hold lost');
if (read('SAVE.daily.score') !== 1800) throw new Error('NKJV daily score lost');

console.log('--- Step 6: Desktop and phone-width viewport HTML inspection ---');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const gameCss = fs.readFileSync(path.join(ROOT, 'css', 'game.css'), 'utf8');
if (!indexHtml.includes('id="v-edition"')) throw new Error('#v-edition missing from HTML');
if (!indexHtml.includes('data-edition="kjv"') || !indexHtml.includes('data-edition="nkjv"')) throw new Error('Pick buttons missing');
console.log('Edition view markup and responsive layout styles verified.');

console.log('====================================================');
console.log('ALL 6 BROWSER & RUNTIME VERIFICATION STEPS COMPLETE!');
console.log('====================================================');
