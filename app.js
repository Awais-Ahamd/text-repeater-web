/**
 * TextRepeat — app.js
 * All logic: generation, validation, UI interactions, canvas background
 */

(function () {
  "use strict";

  /* ── DOM refs ── */
  const inputText    = document.getElementById("inputText");
  const repeatCount  = document.getElementById("repeatCount");
  const outputArea   = document.getElementById("outputArea");
  const customSep    = document.getElementById("customSep");
  const prefixInput  = document.getElementById("prefix");
  const suffixInput  = document.getElementById("suffix");
  const lineNum      = document.getElementById("lineNumbering");
  const reverseOut   = document.getElementById("reverseOutput");
  const trimIn       = document.getElementById("trimInput");
  const repeatBtn    = document.getElementById("repeatBtn");
  const copyBtn      = document.getElementById("copyBtn");
  const downloadBtn  = document.getElementById("downloadBtn");
  const clearBtn     = document.getElementById("clearBtn");
  const themeToggle  = document.getElementById("themeToggle");
  const decBtn       = document.getElementById("decBtn");
  const incBtn       = document.getElementById("incBtn");
  const statIn       = document.getElementById("statIn");
  const statOut      = document.getElementById("statOut");
  const statWords    = document.getElementById("statWords");
  const statLines    = document.getElementById("statLines");
  const inputCharCount = document.getElementById("inputCharCount");
  const textError    = document.getElementById("textError");
  const countError   = document.getElementById("countError");

  /* ── State ── */
  let currentSep = "space";
  let darkMode   = false;

  /* ──────────────────────────────────────────────
     SEPARATOR BUTTONS
  ────────────────────────────────────────────── */
  const sepBtns = document.querySelectorAll(".sep-btn");
  sepBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      sepBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSep = btn.dataset.sep;
      customSep.style.display = currentSep === "custom" ? "block" : "none";
      if (currentSep !== "custom") liveGenerate();
    });
  });

  /* ──────────────────────────────────────────────
     TOGGLE CARDS
  ────────────────────────────────────────────── */
  const toggleCards = document.querySelectorAll(".toggle-card");
  toggleCards.forEach(card => {
    const cb = card.querySelector("input[type=checkbox]");
    cb.addEventListener("change", () => {
      card.classList.toggle("on", cb.checked);
      liveGenerate();
    });
    // Sync initial state
    card.classList.toggle("on", cb.checked);
  });

  /* ──────────────────────────────────────────────
     NUMBER INPUT: +/- buttons
  ────────────────────────────────────────────── */
  decBtn.addEventListener("click", () => {
    const v = parseInt(repeatCount.value, 10) || 1;
    if (v > 1) { repeatCount.value = v - 1; liveGenerate(); }
  });
  incBtn.addEventListener("click", () => {
    const v = parseInt(repeatCount.value, 10) || 1;
    if (v < 10000) { repeatCount.value = v + 1; liveGenerate(); }
  });

  /* ──────────────────────────────────────────────
     LIVE INPUT HANDLERS
  ────────────────────────────────────────────── */
  inputText.addEventListener("input", () => {
    const len = inputText.value.length;
    inputCharCount.textContent = len.toLocaleString() + " chars";
    clearError(textError);
    liveGenerate();
  });
  repeatCount.addEventListener("input", () => { clearError(countError); liveGenerate(); });
  customSep.addEventListener("input", liveGenerate);
  prefixInput.addEventListener("input", liveGenerate);
  suffixInput.addEventListener("input", liveGenerate);

  /* ──────────────────────────────────────────────
     VALIDATION
  ────────────────────────────────────────────── */
  function validate(strict = false) {
    let ok = true;
    const raw = trimIn.checked ? inputText.value.trim() : inputText.value;

    if (strict) {
      if (!raw) {
        showError(textError, "Please enter some text first.");
        ok = false;
      }
    }

    const n = parseInt(repeatCount.value, 10);
    if (!n || n < 1) {
      if (strict) showError(countError, "Enter a number ≥ 1.");
      ok = false;
    } else if (n > 10000) {
      showError(countError, "Maximum is 10,000 repetitions.");
      ok = false;
    } else {
      clearError(countError);
    }

    return ok;
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.style.animation = "none";
    void el.offsetWidth; // reflow
    el.style.animation = "";
  }
  function clearError(el) { el.textContent = ""; }

  /* ──────────────────────────────────────────────
     GENERATE OUTPUT
  ────────────────────────────────────────────── */
  function getSeparator() {
    switch (currentSep) {
      case "space":   return " ";
      case "newline": return "\n";
      case "comma":   return ", ";
      case "custom":  return customSep.value;
      default:        return " ";
    }
  }

  function generate(strict = false) {
    if (!validate(strict) && strict) return;

    const raw = trimIn.checked ? inputText.value.trim() : inputText.value;
    if (!raw) { updateStats(raw, ""); return; }

    const n   = Math.min(Math.max(parseInt(repeatCount.value, 10) || 1, 1), 10000);
    const sep = getSeparator();
    const pre = prefixInput.value;
    const suf = suffixInput.value;
    const doNum = lineNum.checked;
    const doRev = reverseOut.checked;

    const items = Array.from({ length: n }, (_, i) => {
      const lineIdx = doRev ? (n - i) : (i + 1);
      const numPart = doNum ? lineIdx + ". " : "";
      return numPart + pre + raw + suf;
    });

    if (doRev) items.reverse();

    const result = items.join(sep);
    outputArea.value = result;
    updateStats(raw, result);
    animateStats();
  }

  function liveGenerate() { generate(false); }

  /* ──────────────────────────────────────────────
     STATS
  ────────────────────────────────────────────── */
  function updateStats(inp, out) {
    statIn.textContent    = inp.length.toLocaleString();
    statOut.textContent   = out.length.toLocaleString();
    statWords.textContent = out.trim() ? out.trim().split(/\s+/).filter(Boolean).length.toLocaleString() : "0";
    statLines.textContent = out ? out.split("\n").length.toLocaleString() : "0";
  }

  function animateStats() {
    [statIn, statOut, statWords, statLines].forEach(el => {
      el.classList.remove("updated");
      void el.offsetWidth;
      el.classList.add("updated");
      setTimeout(() => el.classList.remove("updated"), 350);
    });
  }

  /* ──────────────────────────────────────────────
     BUTTON ACTIONS
  ────────────────────────────────────────────── */
  repeatBtn.addEventListener("click", (e) => {
    generate(true);
    rippleEffect(e, repeatBtn);
  });

  copyBtn.addEventListener("click", async () => {
    const txt = outputArea.value;
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("success");
      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("success");
      }, 1800);
    } catch {
      // Fallback for older browsers
      outputArea.select();
      document.execCommand("copy");
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("success");
      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("success");
      }, 1800);
    }
  });

  downloadBtn.addEventListener("click", () => {
    const txt = outputArea.value;
    if (!txt) return;
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "repeated-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  clearBtn.addEventListener("click", () => {
    inputText.value  = "";
    outputArea.value = "";
    prefixInput.value = "";
    suffixInput.value = "";
    repeatCount.value = "3";
    customSep.value   = "";
    inputCharCount.textContent = "0 chars";
    clearError(textError);
    clearError(countError);
    updateStats("", "");
    inputText.focus();
  });

  /* ──────────────────────────────────────────────
     RIPPLE EFFECT
  ────────────────────────────────────────────── */
  function rippleEffect(e, btn) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "btn-ripple";
    ripple.style.left = (e.clientX - rect.left) + "px";
    ripple.style.top  = (e.clientY - rect.top) + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  /* ──────────────────────────────────────────────
     DARK MODE
  ────────────────────────────────────────────── */
  themeToggle.addEventListener("click", () => {
    darkMode = !darkMode;
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    const label = document.getElementById("themeLabel");
    if (label) label.textContent = darkMode ? "Dark" : "Light";
  });

  /* ──────────────────────────────────────────────
     ANIMATED BACKGROUND CANVAS
  ────────────────────────────────────────────── */
  (function initCanvas() {
    const canvas = document.getElementById("bgCanvas");
    const ctx    = canvas.getContext("2d");
    let W, H, dots = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      buildDots();
    }

    function buildDots() {
      dots = [];
      const spacing = 50;
      for (let x = 0; x < W + spacing; x += spacing) {
        for (let y = 0; y < H + spacing; y += spacing) {
          dots.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, r: 1.5 + Math.random() });
        }
      }
    }

    let mx = -9999, my = -9999;
    window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });

    let tick = 0;
    function draw() {
      tick++;
      ctx.clearRect(0, 0, W, H);

      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const dotColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
      const lineColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

      dots.forEach(d => {
        const dx = mx - d.ox, dy = my - d.oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 80 - dist) / 80;
        const angle = Math.atan2(dy, dx);

        d.vx += Math.cos(angle) * force * 0.6 + Math.sin(tick * 0.008 + d.ox * 0.01) * 0.08;
        d.vy += Math.sin(angle) * force * 0.6 + Math.cos(tick * 0.008 + d.oy * 0.01) * 0.08;
        d.vx *= 0.85; d.vy *= 0.85;
        d.x = d.ox + d.vx; d.y = d.oy + d.vy;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * (1 + force * 2), 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      });

      // Connect nearby dots
      for (let i = 0; i < dots.length; i += 4) {
        for (let j = i + 1; j < dots.length && j < i + 12; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          if (Math.abs(dx) < 55 && Math.abs(dy) < 55) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    draw();
  })();

  /* ──────────────────────────────────────────────
     KEYBOARD SHORTCUT: Ctrl+Enter = Generate
  ────────────────────────────────────────────── */
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      generate(true);
      rippleEffect({ clientX: repeatBtn.getBoundingClientRect().left + 40, clientY: repeatBtn.getBoundingClientRect().top + 20 }, repeatBtn);
    }
  });

  /* ──────────────────────────────────────────────
     INIT
  ────────────────────────────────────────────── */
  updateStats("", "");

})();
