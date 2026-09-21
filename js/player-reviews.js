var PLAYER_REVIEWS = [
  {
    name: "Marcus T.",
    rating: 5,
    date: "Sep 2026",
    text: "I downloaded this for a bus commute and ended up clearing Ur before I got home. The map makes the verses stick — you remember Abram at Haran because you were just there. KJV wording stays faithful without feeling like a quiz app."
  },
  {
    name: "Priya",
    rating: 5,
    date: "Aug 2026",
    text: "Fade-to-memory scared me the first time. Sixty seconds staring at a whole verse, then the words dissolve and you rebuild it. That is the first app where I felt my brain doing real work, not tapping the obvious wrong answer."
  },
  {
    name: "Daniel K.",
    rating: 4,
    date: "Sep 2026",
    text: "Blitz is brutal in the best way. I sign in once, my save follows me, and the board keeps me honest. Wish the menu showed Daily sooner — I only found it through Settings — but the core loop is solid."
  },
  {
    name: "Grace M.",
    rating: 5,
    date: "Jul 2026",
    text: "Our small group uses the Word Tablets on Sunday evenings. Carving Psalm 23 line by line on a phone sounds odd until you do it. The pace is calm, the sand timer is fair, and nobody needs an account to try the first hold."
  },
  {
    name: "Jonah",
    rating: 4,
    date: "Aug 2026",
    text: "Offline on a flight with no Wi‑Fi and it still ran. Synced when I landed. A few special question types took a run to learn, but the tutorial at the start actually teaches instead of dumping you in cold."
  }
];

function escReviewField(s) {
  return String(s || "").replace(/[<>&"]/g, "");
}

function reviewStars(n) {
  var stars = Math.max(1, Math.min(5, Number(n) || 5));
  var out = "";
  for (var i = 0; i < stars; i++) out += "★";
  for (var j = stars; j < 5; j++) out += "☆";
  return { stars: stars, html: out };
}

function renderPlayerReviewsHTML(list, limit) {
  var items = (list || PLAYER_REVIEWS).slice(0, limit || (list || PLAYER_REVIEWS).length);
  if (!items.length) {
    return '<p class="empty">No published reviews yet. Yours can be the first.</p>';
  }
  return items.map(function (r) {
    var name = escReviewField(r.name || "Player");
    var text = escReviewField(r.text || "");
    var pack = reviewStars(r.rating);
    var date = escReviewField(r.date || "");
    return '<article class="review"><div class="review-head"><span class="review-name">' + name + '</span>' +
      '<span class="review-stars" aria-label="' + pack.stars + ' out of 5">' + pack.html + '</span>' +
      (date ? '<span class="review-date">' + date + '</span>' : '') +
      '</div><p class="review-text">' + text + '</p></article>';
  }).join("");
}

function mountPlayerReviews(hostId, limit) {
  mountPlayerReviewsPanel(hostId, limit);
}

function mountPlayerReviewsPanel(hostId, limit) {
  var host = typeof hostId === "string" ? document.getElementById(hostId) : hostId;
  if (!host) return;
  var avg = playerReviewAverage();
  var count = PLAYER_REVIEWS.length;
  host.innerHTML =
    '<div class="menu-reviews-head"><div class="menu-reviews-meta"><span class="menu-reviews-kicker">What players say</span>' +
    (avg && count ? '<span class="menu-reviews-score">' + avg + ' / 5 · ' + count + ' reviews</span>' : '') +
    '</div><div class="menu-reviews-actions menu-reviews-actions--inline">' +
    '<a class="btn sm" href="support.html#leave-review">Leave a review</a>' +
    '<a class="btn ghost sm" href="support.html">All reviews</a></div></div>' +
    '<div class="menu-reviews-cards">' + renderPlayerReviewsHTML(PLAYER_REVIEWS, limit || 2) + '</div>';
}

function playerReviewAverage() {
  if (!PLAYER_REVIEWS.length) return 0;
  var sum = 0;
  for (var i = 0; i < PLAYER_REVIEWS.length; i++) sum += Number(PLAYER_REVIEWS[i].rating) || 0;
  return Math.round((sum / PLAYER_REVIEWS.length) * 10) / 10;
}
