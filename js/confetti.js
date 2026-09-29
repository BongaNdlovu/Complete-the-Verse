/* ==================================================================
   CELEBRATION — a one-shot confetti burst in the game's own palette,
   plus a floating banner line. Used for Daily streak milestones.
   Honours the reduced-motion setting by standing down entirely.
   ================================================================== */

var Celebration = (function () {

  var COLORS = ["#d9b667", "#ffe3a6", "#ece6d6", "#ff5a62", "#6fb6ff", "#b28cff", "#5fd18a"];

  function reduced() {
    return typeof document !== "undefined" &&
      (document.body.classList.contains("reduced") || document.body.classList.contains("motion-calm"));
  }

  function burst(count) {
    if (reduced() || typeof document === "undefined") return;
    var canvas = document.createElement("canvas");
    canvas.className = "celebration-canvas";
    canvas.setAttribute("aria-hidden", "true");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) { canvas.remove(); return; }
    ctx.scale(dpr, dpr);

    var W = window.innerWidth, H = window.innerHeight;
    count = count || 140;
    var DURATION_MS = 3400;
    var parts = [];
    for (var i = 0; i < count; i++) {
      /* Two cannons, one per bottom corner, firing up and inward — the
         classic paper-cannon arc. Strips tumble in a fake-3D flip and
         sway as they fall, like real confetti. */
      var fromLeft = i % 2 === 0;
      parts.push({
        x: fromLeft ? W * 0.04 : W * 0.96,
        y: H * 0.94,
        vx: (fromLeft ? 1 : -1) * (2.2 + Math.random() * 4.6),
        vy: -(10.5 + Math.random() * 6.5),
        w: 5 + Math.random() * 5,
        h: 9 + Math.random() * 10,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.26,
        flip: Math.random() * Math.PI * 2,
        flipV: 0.07 + Math.random() * 0.15,
        sway: 0.5 + Math.random() * 1.3,
        swayFreq: 0.0016 + Math.random() * 0.002,
        phase: Math.random() * Math.PI * 2,
        g: 0.10 + Math.random() * 0.05,
        drag: 0.972,
        color: COLORS[i % COLORS.length]
      });
    }

    var start = performance.now();
    function frame(now) {
      var t = now - start;
      var sec = t / 1000;
      ctx.clearRect(0, 0, W, H);
      var alive = false;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.vy = (p.vy + p.g) * p.drag;
        p.vx *= p.drag;
        p.x += p.vx + Math.sin(sec * p.swayFreq * 6.283 + p.phase) * p.sway;
        p.y += p.vy;
        p.rot += p.vr;
        p.flip += p.flipV;
        if (p.y < H + 30) alive = true;
        var fade = t > DURATION_MS - 600 ? Math.max(0, (DURATION_MS - t) / 600) : 1;
        var squash = Math.cos(p.flip);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        /* The flip squashes the strip toward its edge — paper turning in
           the light rather than a flat spinning rectangle. */
        ctx.scale(1, Math.max(0.12, Math.abs(squash)));
        ctx.fillStyle = p.color;
        if (squash > 0.55) ctx.fillStyle = "#fff8ea"; /* glint as it turns */
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive && t < DURATION_MS) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  function banner(title, sub) {
    if (typeof document === "undefined") return;
    var el = document.createElement("div");
    el.className = "celebration-banner";
    el.setAttribute("role", "status");
    el.innerHTML = '<b>' + title + '</b>' + (sub ? '<span>' + sub + '</span>' : "");
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("on"); });
    setTimeout(function () { el.classList.remove("on"); }, 3200);
    setTimeout(function () { el.remove(); }, 3800);
  }

  /* Streak milestone celebration: confetti + a banner line. */
  function celebrateStreak(count) {
    if (typeof Polish === "undefined" || !Polish.dailyStreakMilestone ||
        !Polish.dailyStreakMilestone(count)) return false;
    var scale = count >= 100 ? 240 : count >= 30 ? 190 : 140;
    burst(scale);
    banner(count + "-day streak", "The daily reading has held " + count +
      (count === 1 ? " day" : " days") + " in a row — well walked, pilgrim.");
    return true;
  }

  return { burst: burst, banner: banner, celebrateStreak: celebrateStreak };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Celebration;
