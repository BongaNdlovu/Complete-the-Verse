/* ==================================================================
   SKY3D — Phase A living vault behind the UI.

   Optional WebGL sky dome. Falls back to the CSS #backdrop wash when
   WebGL is unavailable, quality is low, or reduced motion is on.

   Loaded as an ES module; attaches window.Sky3D for game.js (classic
   script) to call via Backdrop.palette / applySettings.
   ================================================================== */

import * as THREE from "three";

const RGB = {
  menu:    { a: [138, 111, 52], b: [26, 20, 9],  c: [90, 72, 34] },
  act1:    { a: [138, 111, 52], b: [26, 20, 9],  c: [90, 72, 34] },
  act2:    { a: [44, 74, 110],  b: [10, 18, 32], c: [30, 52, 80] },
  act3:    { a: [150, 72, 26],  b: [29, 12, 5],  c: [104, 44, 14] },
  act4:    { a: [80, 57, 120],  b: [18, 12, 30], c: [52, 36, 84] },
  act5:    { a: [128, 20, 24],  b: [26, 4, 7],   c: [96, 14, 18] },
  results: { a: [154, 124, 60], b: [28, 21, 9],  c: [104, 82, 40] }
};

function toVec3(rgb) {
  return new THREE.Vector3(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
}

const SKY_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vWorld;
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uBot;
  uniform vec3 uAccent;
  uniform float uTime;
  uniform float uGlow;

  // Soft value noise (no textures — tiny footprint)
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec3 dir = normalize(vWorld);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

    // Vertical palette wash — bright enough to read behind the UI film
    vec3 col = mix(uBot * 1.4, uMid * 1.55, smoothstep(0.0, 0.5, h));
    col = mix(col, uTop * 1.7, smoothstep(0.28, 1.0, h));

    // Slow drifting haze near the horizon
    float haze = noise(dir.xz * 2.2 + vec2(uTime * 0.022, uTime * 0.015));
    col += uAccent * (0.12 + 0.22 * haze) * (1.0 - abs(dir.y));

    // Celestial dust higher in the vault
    float dust = noise(dir.xy * 6.0 + uTime * 0.012) * noise(dir.zy * 5.0 - uTime * 0.01);
    col += uAccent * dust * 0.2 * max(dir.y, 0.0);

    // Soft center lift so the hall doesn't stay pure black
    col += uAccent * 0.06 * (1.0 - smoothstep(0.0, 0.85, length(dir.xz)));

    // Light vignette only
    float vig = smoothstep(1.4, 0.0, length(dir.xz));
    col *= 0.85 + 0.25 * vig;

    // Act pulse
    col += uAccent * uGlow * 0.18;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const Sky3D = (function () {
  let renderer = null;
  let scene = null;
  let camera = null;
  let skyMesh = null;
  let stars = null;
  let canvas = null;
  let host = null;
  let raf = null;
  let running = false;
  let mounted = false;
  let enabled = true;
  let paletteName = "menu";
  let target = { top: null, mid: null, bot: null, accent: null };
  let current = { top: null, mid: null, bot: null, accent: null };
  let glow = 0;
  let lastT = 0;
  let startT = 0;

  function qualityAllows() {
    if (typeof document === "undefined") return false;
    if (document.body.classList.contains("reduced")) return false;
    if (document.body.classList.contains("quality-low")) return false;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return enabled;
  }

  function dprCap() {
    const hi = document.body.classList.contains("quality-high");
    const bal = document.body.classList.contains("quality-balanced");
    const max = hi ? 1.5 : bal ? 1.2 : 1;
    return Math.min(window.devicePixelRatio || 1, max);
  }

  function applyPaletteImmediate(name) {
    const p = RGB[name] || RGB.menu;
    target.top = toVec3(p.a);
    target.mid = toVec3(p.c);
    target.bot = toVec3(p.b);
    target.accent = toVec3(p.a);
    if (!current.top) {
      current.top = target.top.clone();
      current.mid = target.mid.clone();
      current.bot = target.bot.clone();
      current.accent = target.accent.clone();
    }
  }

  function lerpColor(a, b, t) {
    a.lerp(b, t);
  }

  function buildStars() {
    const n = 900;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      // Upper hemisphere only
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(0.15 + 0.85 * v); // bias upward
      const r = 90;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xe8d6a8,
      size: 0.35,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    return new THREE.Points(geo, mat);
  }

  function mount(el) {
    if (!el || mounted) return !!mounted;
    if (!qualityAllows()) return false;
    try {
      host = el;
      canvas = document.createElement("canvas");
      canvas.id = "sky3d";
      canvas.setAttribute("aria-hidden", "true");
      host.insertBefore(canvas, host.firstChild);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        powerPreference: "low-power"
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(dprCap());

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
      camera.position.set(0, 0.15, 0.1);

      applyPaletteImmediate(paletteName);
      const uniforms = {
        uTop: { value: current.top.clone() },
        uMid: { value: current.mid.clone() },
        uBot: { value: current.bot.clone() },
        uAccent: { value: current.accent.clone() },
        uTime: { value: 0 },
        uGlow: { value: 0 }
      };

      const skyMat = new THREE.ShaderMaterial({
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        uniforms,
        side: THREE.BackSide,
        depthWrite: false
      });
      skyMesh = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 20), skyMat);
      scene.add(skyMesh);

      stars = buildStars();
      scene.add(stars);

      mounted = true;
      if (typeof document !== "undefined" && document.body) {
        document.body.classList.add("sky3d-on");
      }
      resize();
      start();
      return true;
    } catch (e) {
      dispose();
      return false;
    }
  }

  function dispose() {
    stop();
    if (typeof document !== "undefined" && document.body) {
      document.body.classList.remove("sky3d-on");
    }
    if (stars) {
      stars.geometry.dispose();
      stars.material.dispose();
      stars = null;
    }
    if (skyMesh) {
      skyMesh.geometry.dispose();
      skyMesh.material.dispose();
      skyMesh = null;
    }
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    canvas = null;
    scene = null;
    camera = null;
    host = null;
    mounted = false;
  }

  function resize() {
    if (!renderer || !camera || !host) return;
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    renderer.setPixelRatio(dprCap());
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  function start() {
    if (running || !mounted) return;
    running = true;
    startT = performance.now();
    lastT = startT;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function tick(now) {
    if (!running || !mounted) return;
    raf = requestAnimationFrame(tick);
    if (document.hidden) return;

    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    const t = (now - startT) / 1000;

    // Smooth palette transitions
    const k = 1 - Math.pow(0.001, dt); // ~slow ease
    lerpColor(current.top, target.top, k * 0.6);
    lerpColor(current.mid, target.mid, k * 0.6);
    lerpColor(current.bot, target.bot, k * 0.6);
    lerpColor(current.accent, target.accent, k * 0.6);
    glow *= Math.pow(0.15, dt); // decay hit glow

    const u = skyMesh.material.uniforms;
    u.uTop.value.copy(current.top);
    u.uMid.value.copy(current.mid);
    u.uBot.value.copy(current.bot);
    u.uAccent.value.copy(current.accent);
    u.uTime.value = t;
    u.uGlow.value = glow;

    // Slow camera drift — barely noticeable
    camera.rotation.y = Math.sin(t * 0.02) * 0.06;
    camera.rotation.x = Math.sin(t * 0.015) * 0.03 - 0.04;
    if (stars) {
      stars.rotation.y = t * 0.004;
      stars.material.opacity = 0.18 + current.bot.y * 0.25;
    }

    renderer.render(scene, camera);
  }

  function setPalette(name) {
    paletteName = name || "menu";
    applyPaletteImmediate(paletteName);
    if (!mounted && qualityAllows() && host) mount(host);
    if (mounted && !qualityAllows()) dispose();
  }

  function pulse(amount) {
    glow = Math.min(1, glow + (amount == null ? 0.55 : amount));
  }

  function setEnabled(on) {
    enabled = !!on;
    syncFromSettings();
  }

  function syncFromSettings() {
    if (!qualityAllows()) {
      if (mounted) dispose();
      return;
    }
    if (!mounted) {
      const el = host || document.getElementById("backdrop");
      if (el) mount(el);
    } else {
      resize();
      if (!running) start();
    }
  }

  function init(el) {
    host = el || document.getElementById("backdrop");
    applyPaletteImmediate(paletteName);
    if (qualityAllows()) mount(host);
    return mounted;
  }

  // Public API
  const api = {
    init,
    setPalette,
    pulse,
    setEnabled,
    syncFromSettings,
    resize,
    dispose,
    isMounted() { return mounted; }
  };

  // Late bind if game boots first
  if (typeof window !== "undefined") {
    window.Sky3D = api;
    window.addEventListener("resize", () => {
      if (mounted) resize();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (mounted && qualityAllows()) start();
    });
    // Auto-init when DOM ready if backdrop exists
    const boot = () => {
      const el = document.getElementById("backdrop");
      if (el) init(el);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
      boot();
    }
  }

  return api;
})();

export default Sky3D;
