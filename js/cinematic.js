/* ==================================================================
   CINEMATIC — procedural vector animations, Seventh Lamp Day-7 reward,
   combo celebrations, Overdrive entrance, and visible miss collapse.

   Pure vector (SVG) + Web Audio + CSS synthesis for instant, sharp,
   offline rendering across all devices with zero external asset latency.
   ================================================================== */

var Cinematic = (function () {

  /* One focal beat at a time keeps the hall dramatic instead of noisy. A
     higher-priority event may interrupt a lower one; ordinary combo stamps
     cannot interrupt a ceremony, a miss collapse, or Overdrive. */
  var beatGate = { until: 0, priority: 0 };
  var BEAT_PRIORITY = { site: 20, combo: 30, collapse: 80, overdrive: 90, ceremony: 100 };
  function allowBeat(kind, duration) {
    var now = Date.now();
    var priority = BEAT_PRIORITY[kind] || 10;
    if (now < beatGate.until && priority < beatGate.priority) return false;
    beatGate = { until: now + (duration || 700), priority: priority };
    return true;
  }

  /* ------------------------- WEB AUDIO SYNTH ------------------------- */
  function getAudioCtx() {
    if (typeof Snd !== "undefined" && Snd._ctx) return Snd._ctx;
    if (typeof window !== "undefined") {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try {
          if (!Cinematic._ctx) Cinematic._ctx = new AC();
          return Cinematic._ctx;
        } catch(e) {
          return null;
        }
      }
    }
    return null;
  }

  function playSabbathChime() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      var now = ctx.currentTime;
      var freqs = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major pentatonic chord
      freqs.forEach(function (f, idx) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + idx * 0.12);
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.12 + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 3.0);
      });
    } catch (e) {}
  }

  function playExtinguishHiss() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  function playStampChime(mult) {
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      var now = ctx.currentTime;
      var base = 300 + (mult || 1) * 80;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 1.5, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch (e) {}
  }

  /* ------------------------- SEVENTH LAMP CINEMATIC ------------------------- */
  function playSeventhLamp(opts, onDone) {
    opts = opts || {};
    if (!allowBeat("ceremony", 1800)) return;
    var count = opts.streak || 7;
    var overlay = document.getElementById("seventh-lamp-cinematic");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "seventh-lamp-cinematic";
      overlay.className = "seventh-lamp-cinematic";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      document.body.appendChild(overlay);
    }

    var title = count >= 30 ? "The Thirtieth Lamp" : count >= 14 ? "The Fourteenth Lamp" : "The Seventh Lamp";
    var sub = count >= 30 ? "Thirty Days on the Road" : count >= 14 ? "Two Weeks of Scripture Unbroken" : "Seven Days Finished · The Sabbath Seal";

    overlay.innerHTML =
      '<div class="sl-inner">' +
        '<div class="sl-kick">Sabbath Blessing</div>' +
        '<h2 class="sl-title">' + title + '</h2>' +
        '<div class="sl-sub">' + sub + '</div>' +
        '<div class="sl-lamps-row">' +
          renderLampsSvg(count) +
        '</div>' +
        '<div class="sl-seal-award">' +
          '<div class="sl-seal-icon">' +
            '<svg viewBox="0 0 100 100" class="sl-seal-svg">' +
              '<circle cx="50" cy="50" r="45" stroke="#f5c862" stroke-width="2" fill="none" stroke-dasharray="4,2"/>' +
              '<circle cx="50" cy="50" r="38" stroke="#d49c3d" stroke-width="1.5" fill="#180e08"/>' +
              '<path d="M50 16 L56 38 L78 38 L60 52 L67 74 L50 60 L33 74 L40 52 L22 38 L44 38 Z" fill="url(#sl-gold-grad)" filter="drop-shadow(0 0 8px rgba(245,200,98,0.8))"/>' +
              '<defs>' +
                '<linearGradient id="sl-gold-grad" x1="0" y1="0" x2="0" y2="1">' +
                  '<stop offset="0%" stop-color="#fff5cc"/>' +
                  '<stop offset="50%" stop-color="#e5b342"/>' +
                  '<stop offset="100%" stop-color="#9a6214"/>' +
                '</linearGradient>' +
              '</defs>' +
            '</svg>' +
          '</div>' +
          '<div class="sl-seal-name">Seal of the Seventh Lamp</div>' +
          '<div class="sl-seal-desc">Honor bestowed on the faithful pilgrim who walked seven unbroken calendar days.</div>' +
        '</div>' +
        '<button type="button" class="btn sl-dismiss-btn" id="sl-dismiss">Receive the Seal</button>' +
      '</div>';

    overlay.classList.add("on");
    playSabbathChime();

    /* This ceremony once pointed at an asset that is not shipped. Route it
       through the Director so authored audio can be added later without a
       silent 404 today; the Director's TTS fallback still speaks the line. */
    if (typeof Director !== "undefined" && Director.speak) {
      try { Director.speak("The seventh lamp remains.", true); } catch (e) {}
    }

    var dismiss = document.getElementById("sl-dismiss");
    if (dismiss) {
      dismiss.focus();
      dismiss.onclick = function () {
        overlay.classList.remove("on");
        if (typeof onDone === "function") onDone();
      };
    }
  }

  function renderLampsSvg(count) {
    var max = 7;
    var html = "";
    for (var i = 1; i <= max; i++) {
      var isLit = i <= count;
      var isFinal = (i === max);
      var flameClass = isFinal ? "lamp-seventh-flame" : isLit ? "lamp-lit-flame" : "lamp-unlit";
      html +=
        '<div class="sl-lamp-unit ' + (isLit ? 'lit' : '') + ' ' + (isFinal ? 'seventh' : '') + '">' +
          '<svg viewBox="0 0 36 64" class="sl-lamp-svg">' +
            '<ellipse cx="18" cy="54" rx="14" ry="6" fill="#5a3d1e" stroke="#cca152" stroke-width="1.5"/>' +
            '<path d="M8 54 Q18 42 28 54 Z" fill="#7a5328"/>' +
            '<line x1="18" y1="42" x2="18" y2="34" stroke="#d5b577" stroke-width="2"/>' +
            (isLit ?
              '<path class="sl-flame ' + flameClass + '" d="M18 12 Q24 24 18 34 Q12 24 18 12 Z" fill="#ffd56b"/>' +
              '<circle cx="18" cy="24" r="8" fill="rgba(255,200,80,0.3)" filter="blur(3px)"/>'
              : '<circle cx="18" cy="34" r="2" fill="#443322"/>') +
          '</svg>' +
          '<span class="sl-lamp-num">' + i + '</span>' +
        '</div>';
    }
    return html;
  }

  /* ------------------------- IN-RUN COMBO STAMPS ------------------------- */
  function showComboStamp(streak, mult) {
    if (streak < 3) return;
    if (!allowBeat("combo", 1100)) return;
    var container = document.getElementById("combo-stamp-overlay");
    if (!container) {
      container = document.createElement("div");
      container.id = "combo-stamp-overlay";
      container.className = "combo-stamp-overlay";
      document.body.appendChild(container);
    }

    var stamp = document.createElement("div");
    stamp.className = "combo-stamp-card streak-" + streak + " mult-" + mult;
    var label = streak >= 12 ? "OVERDRIVE ×" + mult : streak >= 8 ? "FERVOR ×" + mult : streak >= 5 ? "ZEAL ×" + mult : "MOMENTUM ×" + mult;

    stamp.innerHTML =
      '<div class="combo-stamp-burst"></div>' +
      '<div class="combo-stamp-text">' + label + '</div>' +
      '<div class="combo-stamp-streak">' + streak + ' in a row</div>';

    if (typeof container.replaceChildren === "function") {
      container.replaceChildren(stamp);
    } else {
      container.innerHTML = "";
      container.appendChild(stamp);
    }
    playStampChime(mult);

    setTimeout(function () {
      if (stamp.parentNode) stamp.parentNode.removeChild(stamp);
    }, 1100);
  }

  /* ------------------------- MISS COLLAPSE VISUAL ------------------------- */
  function showComboCollapse() {
    if (!allowBeat("collapse", 700)) return;
    playExtinguishHiss();
    var flash = document.getElementById("combo-collapse-flash");
    if (!flash) {
      flash = document.createElement("div");
      flash.id = "combo-collapse-flash";
      flash.className = "combo-collapse-flash";
      document.body.appendChild(flash);
    }
    flash.classList.remove("fire-out");
    void flash.offsetWidth;
    flash.classList.add("fire-out");
    setTimeout(function () {
      flash.classList.remove("fire-out");
    }, 700);
  }

  /* ------------------------- OVERDRIVE ENTRANCE EVENT ------------------------- */
  function showOverdriveEntrance() {
    if (!allowBeat("overdrive", 1600)) return;
    var od = document.createElement("div");
    od.className = "overdrive-entrance-banner";
    od.innerHTML =
      '<div class="od-banner-inner">' +
        '<div class="od-banner-title">OVERDRIVE REACHED</div>' +
        '<div class="od-banner-sub">The fire is lit · Multiplier ×4 active</div>' +
      '</div>';
    document.body.appendChild(od);
    playStampChime(4);
    setTimeout(function () {
      if (od.parentNode) od.parentNode.removeChild(od);
    }, 1600);
  }

  /* ------------------------- COLD PLACE TOAST ------------------------- */
  function showColdPlaceToast(siteName, arcName) {
    if (!allowBeat("site", 1800)) return;
    var toast = document.getElementById("cold-place-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "cold-place-toast";
      toast.className = "cold-place-toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML =
      '<div class="cpt-arc">' + (arcName || "The Pilgrimage") + '</div>' +
      '<div class="cpt-name">' + (siteName || "Ur of the Chaldees") + '</div>';
    toast.classList.remove("on");
    void toast.offsetWidth;
    toast.classList.add("on");
    setTimeout(function () {
      toast.classList.remove("on");
    }, 1800);
  }

  function event(kind, payload) {
    payload = payload || {};
    if (kind === "streak") return showComboStamp(payload.streak || 0, payload.mult || 1);
    if (kind === "miss") return showComboCollapse();
    if (kind === "overdrive") return showOverdriveEntrance();
    if (kind === "site") return showColdPlaceToast(payload.siteName, payload.arcName);
    if (kind === "ceremony") return playSeventhLamp(payload, payload.onDone);
    return false;
  }

  return {
    playSeventhLamp: playSeventhLamp,
    showComboStamp: showComboStamp,
    showComboCollapse: showComboCollapse,
    showOverdriveEntrance: showOverdriveEntrance,
    showColdPlaceToast: showColdPlaceToast,
    event: event,
    playSabbathChime: playSabbathChime,
    playExtinguishHiss: playExtinguishHiss
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Cinematic;
