/* ==================================================================
   LEADERBOARD — one shared renderer for every cloud board (the
   results screen and the Chronicle's global tabs). HTML-string
   builder only: a raised podium with rank seals for the top three,
   and a share-of-leader fill behind each row so the whole field
   reads at a glance. Ranks arrive tie-aware from Polish.rankRows,
   and a tied podium rank stacks every player who shares the spot.
   ================================================================== */

var Leaderboard = (function () {

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m];
    });
  }

  function fmtNum(n) {
    n = Math.round(Number(n) || 0);
    return (typeof fmt === "function") ? fmt(n)
      : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function meta(r, kind) {
    if (kind === "blitz") {
      var sec = r.survived_ms != null ? Math.round(r.survived_ms / 1000) + "s" : "";
      return "verses" + (sec ? " · " + sec : "");
    }
    var acc = r.accuracy != null ? Math.round(Number(r.accuracy)) + "%" : "";
    var diff = r.diff ? esc(r.diff) : "";
    return [acc, diff].filter(Boolean).join(" · ");
  }

  function rankLabel(r) {
    return (r.tied ? "T" : "#") + r.rank;
  }

  function moveArrow(r) {
    if (!(r.mine && typeof r.move === "number" && r.move !== 0)) return "";
    return r.move > 0
      ? ' <i class="board-move-up" title="Up ' + r.move + ' from your last daily">▲</i>'
      : ' <i class="board-move-down" title="Down ' + (-r.move) + ' from your last daily">▼</i>';
  }

  function youPill(r) {
    return r.mine ? ' <i class="you-pill">You</i>' : "";
  }

  function reportBtn(r, ctx) {
    return ctx.reports && r.id
      ? '<button type="button" class="board-report" data-report-score="' + esc(r.id) + '">Report</button>'
      : "";
  }

  function rowHtml(r, ctx) {
    var share = ctx.top > 0 ? Math.max(3, Math.round((Number(r.score) / ctx.top) * 100)) : 0;
    return '<div class="lbd-row' + (r.mine ? " mine" : "") + (ctx.reports ? " has-report" : "") + '" style="--share:' + share + '%">' +
      '<span class="lbd-rank" title="' + (r.tied ? "Tied at rank " + r.rank : "Rank " + r.rank) + '">' + rankLabel(r) + '</span>' +
      '<span class="lbd-name">' + esc(r.name) + youPill(r) + moveArrow(r) + '</span>' +
      '<span class="lbd-meta">' + meta(r, ctx.kind) + '</span>' +
      reportBtn(r, ctx) +
      '<b class="lbd-score">' + fmtNum(r.score) + '</b>' +
      '</div>';
  }

  function pedHtml(r, k, ctx, small) {
    return '<div class="lbd-pgroup">' +
      '<span class="lbd-seal' + (small ? " lbd-seal--sm" : "") + '"><i>' + k + '</i></span>' +
      '<span class="lbd-pname">' + esc(r.name) + youPill(r) + '</span>' +
      '<b class="lbd-pscore">' + fmtNum(r.score) + '</b>' +
      '<span class="lbd-pmeta">' + meta(r, ctx.kind) + '</span>' +
      reportBtn(r, ctx) +
      '</div>';
  }

  function podiumHtml(rows, ctx) {
    var byRank = {};
    rows.forEach(function (r) {
      if (r.rank >= 1 && r.rank <= 3) (byRank[r.rank] = byRank[r.rank] || []).push(r);
    });
    if (!byRank[1]) return "";
    /* 2 · 1 · 3 on screen; empty keepers hold the grid so #1 stays centred.
       A tied rank keeps EVERY player who shares the spot. */
    return '<div class="lbd-podium">' + [2, 1, 3].map(function (k) {
      var group = byRank[k];
      if (!group || !group.length) return '<div class="lbd-ped lbd-pempty" aria-hidden="true"></div>';
      var tied = group.length > 1;
      return '<div class="lbd-ped lbd-p' + k + (tied ? " lbd-ped--tied" : "") + '">' +
        group.map(function (r) { return pedHtml(r, k, ctx, tied); }).join("") + '</div>';
    }).join("") + '</div>';
  }

  function headHtml(o) {
    var bits = '<span class="lbd-orn" aria-hidden="true">✦</span>' +
      '<span class="lbd-title">' + esc(o.title) + '</span>';
    if (o.date) bits += ' <span class="lbd-date">' + esc(o.date) + '</span>';
    bits += o.trust || "";
    if (o.note) bits += '<span class="lbd-note">' + esc(o.note) + '</span>';
    return '<div class="lbd-head">' + bits + '</div>';
  }

  /* opts: { title, date, note, trust, kind:"daily"|"blitz", rows, mine,
             mineLabel, reports, compact, head } */
  function board(opts) {
    opts = opts || {};
    var rows = opts.rows || [];
    var top = rows.length ? Math.max.apply(null, rows.map(function (r) { return Number(r.score) || 0; })) : 0;
    var ctx = { kind: opts.kind || "daily", reports: !!opts.reports, top: top };
    var html = '<div class="lbd' + (opts.compact ? " lbd--compact" : "") + '">';
    if (opts.head !== false && opts.title) html += headHtml(opts);
    if (rows.length) {
      html += podiumHtml(rows, ctx);
      html += '<div class="lbd-rows">' + rows.filter(function (r) { return !(r.rank >= 1 && r.rank <= 3); })
        .map(function (r) { return rowHtml(r, ctx); }).join("") + '</div>';
      if (opts.mine && !rows.some(function (r) { return r.mine; })) {
        html += '<div class="lbd-sep">' + esc(opts.mineLabel || "Your rank") + '</div>' +
          '<div class="lbd-rows lbd-rows--mine">' +
          rowHtml(opts.mine, { kind: ctx.kind, reports: false, top: top }) + '</div>';
      }
    }
    return html + '</div>';
  }

  return { board: board, esc: esc };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Leaderboard;
