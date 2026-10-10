// colemitchell.io desktop: menus, windows, icons, and Atkinson-dithered photos.
(() => {
  const root = document.documentElement;
  const desktop = document.querySelector(".desktop");
  const zoomLayer = document.querySelector(".zoom-layer");
  const windows = new Map([...document.querySelectorAll(".window")].map((w) => [w.id, w]));
  const icons = [...document.querySelectorAll(".icon")];
  const deskQuery = matchMedia("(min-width: 960px) and (min-height: 600px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const ICON_COLUMN = 116;
  const openIds = new Set(["experience", "about"]);
  const geometry = new Map();
  let zTop = 10;
  let lastPointerType = "mouse";

  const isDesk = () => root.classList.contains("is-desktop");
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const deskSize = () => ({ W: desktop.clientWidth, H: desktop.clientHeight });

  document.addEventListener("pointerdown", (e) => (lastPointerType = e.pointerType), true);

  // ---------- Clock ----------

  const clock = document.querySelector(".clock");
  const tick = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    clock.dateTime = now.toISOString();
  };
  tick();
  setInterval(tick, 15000);

  // ---------- Menus ----------

  const menuTitles = [...document.querySelectorAll(".menu-title")];
  let openMenu = null;

  function setMenu(title) {
    if (openMenu) {
      openMenu.setAttribute("aria-expanded", "false");
      openMenu.nextElementSibling.hidden = true;
    }
    openMenu = title;
    if (title) {
      title.setAttribute("aria-expanded", "true");
      title.nextElementSibling.hidden = false;
    }
  }

  const menuItems = (title) =>
    [...title.nextElementSibling.querySelectorAll("a, button:enabled")].filter((el) => el.offsetParent);

  menuTitles.forEach((title, i) => {
    title.addEventListener("click", () => setMenu(openMenu === title ? null : title));
    title.addEventListener("pointerenter", () => {
      if (openMenu && openMenu !== title) setMenu(title);
    });
    title.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMenu(title);
        menuItems(title)[0]?.focus();
      }
    });
    title.nextElementSibling.addEventListener("keydown", (e) => {
      const items = menuItems(title);
      const at = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        items[(at + step + items.length) % items.length]?.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const next = menuTitles[(i + (e.key === "ArrowRight" ? 1 : -1) + menuTitles.length) % menuTitles.length];
        setMenu(next);
        menuItems(next)[0]?.focus();
      }
    });
  });

  document.addEventListener("pointerdown", (e) => {
    if (openMenu && !e.target.closest(".menubar")) setMenu(null);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openMenu) {
      const title = openMenu;
      setMenu(null);
      title.focus();
    }
  });

  document.querySelector(".menus").addEventListener("click", (e) => {
    const item = e.target.closest(".menu-list a, .menu-list button");
    if (!item) return;
    if (item.dataset.open) {
      e.preventDefault();
      openWindow(item.dataset.open);
    } else if (item.dataset.action) {
      actions[item.dataset.action]();
    }
    setMenu(null);
  });

  const aboutSite = document.getElementById("about-site");
  const actions = {
    "about-site": () => aboutSite.showModal(),
    "close-window": () => {
      const front = frontWindow();
      if (front) closeWindow(front);
    },
    "clean-up": () => {
      geometry.clear();
      for (const id of openIds) place(windows.get(id));
    },
    restart: () => {
      root.classList.add("is-restarting");
      setTimeout(() => location.reload(), 400);
    },
  };

  // ---------- Window geometry ----------

  function defaultGeometry(id) {
    const { W, H } = deskSize();
    const avail = W - ICON_COLUMN;
    switch (id) {
      case "about": {
        const w = clamp(avail * 0.42, 420, 560);
        return { x: 36, y: 28, w, h: Math.min(660, H - 56) };
      }
      case "experience": {
        const w = clamp(avail * 0.5, 460, 680);
        return { x: avail - w - 12, y: 60, w, h: H - 92 };
      }
      case "resume": {
        const w = Math.min(780, avail - 72);
        return { x: Math.round((avail - w) / 2), y: 18, w, h: H - 36 };
      }
      case "skills":
        return { x: 96, y: 84, w: 420, h: Math.min(540, H - 120) };
      case "trash":
        return { x: avail - 360, y: H - 280, w: 320, h: 220 };
      default: {
        const k = id === "education" ? 0 : 1;
        const w = Math.min(600, avail - 120);
        return { x: 72 + k * 40, y: 44 + k * 36, w, h: Math.min(620, H - 88 - k * 36) };
      }
    }
  }

  function fit({ x, y, w, h }) {
    const { W, H } = deskSize();
    w = clamp(w, 260, W - 16);
    h = clamp(h, 140, H - 16);
    return { x: clamp(x, 80 - w, W - 80), y: clamp(y, 0, H - 24), w, h };
  }

  function place(win) {
    const g = fit(geometry.get(win.id) || defaultGeometry(win.id));
    geometry.set(win.id, g);
    Object.assign(win.style, { left: `${g.x}px`, top: `${g.y}px`, width: `${g.w}px`, height: `${g.h}px` });
  }

  const rectIn = (el) => {
    const d = desktop.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - d.left, y: r.top - d.top, w: r.width, h: r.height };
  };

  // ---------- Window state ----------

  function frontWindow() {
    let front = null;
    for (const id of openIds) {
      const win = windows.get(id);
      if (!front || Number(win.style.zIndex) > Number(front.style.zIndex)) front = win;
    }
    return front;
  }

  function focusWindow(win) {
    if (!isDesk()) return;
    if (!win.classList.contains("is-active")) win.style.zIndex = ++zTop;
    for (const other of windows.values()) other.classList.toggle("is-active", other === win);
  }

  function iconFor(id) {
    return icons.find((icon) => icon.dataset.open === id);
  }

  function openWindow(id, { animate = true } = {}) {
    const win = windows.get(id);
    if (!win) return;
    history.replaceState(null, "", `#${id}`);

    if (!isDesk()) {
      setShaded(win, false);
      win.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
      return;
    }

    const show = () => {
      win.hidden = false;
      place(win);
      focusWindow(win);
      win.focus({ preventScroll: true });
      ditherIn(win);
    };

    if (!win.hidden) return show();
    openIds.add(id);
    const icon = iconFor(id);
    if (animate && icon) {
      zoomRects(rectIn(icon.querySelector("svg")), fit(geometry.get(id) || defaultGeometry(id)), show);
    } else {
      show();
    }
  }

  function closeWindow(win) {
    const from = rectIn(win);
    win.hidden = true;
    win.classList.remove("is-active");
    openIds.delete(win.id);
    history.replaceState(null, "", location.pathname);
    const icon = iconFor(win.id);
    const next = frontWindow();
    if (next) focusWindow(next);
    if (icon) zoomRects(from, rectIn(icon.querySelector("svg")), () => {});
  }

  function setShaded(win, shaded) {
    win.classList.toggle("is-shaded", shaded);
    if (!isDesk()) win.querySelector(".close").setAttribute("aria-expanded", String(!shaded));
  }

  function toggleZoom(win) {
    const { W, H } = deskSize();
    if (win.dataset.unzoomed) {
      geometry.set(win.id, JSON.parse(win.dataset.unzoomed));
      delete win.dataset.unzoomed;
    } else {
      win.dataset.unzoomed = JSON.stringify(geometry.get(win.id));
      geometry.set(win.id, { x: 8, y: 8, w: W - ICON_COLUMN - 8, h: H - 16 });
    }
    place(win);
  }

  // The classic "zooming rectangles" that trace a window opening from its icon.
  function zoomRects(from, to, done) {
    if (reducedMotion.matches) return done();
    const steps = 8;
    let i = 0;
    const step = () => {
      i += 1;
      const t = i / steps;
      const ease = 1 - (1 - t) * (1 - t);
      const rect = document.createElement("div");
      rect.className = "zoom-rect";
      Object.assign(rect.style, {
        left: `${from.x + (to.x - from.x) * ease}px`,
        top: `${from.y + (to.y - from.y) * ease}px`,
        width: `${from.w + (to.w - from.w) * ease}px`,
        height: `${from.h + (to.h - from.h) * ease}px`,
      });
      zoomLayer.append(rect);
      setTimeout(() => rect.remove(), 70);
      if (i < steps) setTimeout(step, 16);
      else done();
    };
    step();
  }

  // Drag and resize move a dotted outline, then the window jumps there on release.
  function trackOutline(e, win, onMove) {
    const start = { x: e.clientX, y: e.clientY };
    const origin = { ...geometry.get(win.id) };
    let ghost = null;
    let target = origin;
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);

    const move = (ev) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!ghost && Math.abs(dx) + Math.abs(dy) < 4) return;
      if (!ghost) {
        ghost = document.createElement("div");
        ghost.className = "ghost";
        zoomLayer.append(ghost);
        desktop.classList.add("is-dragging");
      }
      target = fit(onMove(origin, dx, dy));
      Object.assign(ghost.style, {
        left: `${target.x}px`,
        top: `${target.y}px`,
        width: `${target.w}px`,
        height: `${target.h}px`,
      });
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      desktop.classList.remove("is-dragging");
      if (!ghost) return;
      ghost.remove();
      delete win.dataset.unzoomed;
      geometry.set(win.id, target);
      place(win);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  }

  for (const win of windows.values()) {
    const titlebar = win.querySelector(".titlebar");

    win.addEventListener("pointerdown", () => focusWindow(win), true);
    win.addEventListener("focusin", () => focusWindow(win));

    win.querySelector(".close").addEventListener("click", () => {
      if (isDesk()) closeWindow(win);
      else setShaded(win, !win.classList.contains("is-shaded"));
    });
    win.querySelector(".zoom").addEventListener("click", () => toggleZoom(win));

    titlebar.addEventListener("dblclick", (e) => {
      if (!e.target.closest(".box")) setShaded(win, !win.classList.contains("is-shaded"));
    });
    titlebar.addEventListener("pointerdown", (e) => {
      if (!isDesk() || e.button !== 0 || e.target.closest(".box")) return;
      trackOutline(e, win, (g, dx, dy) => ({ ...g, x: g.x + dx, y: g.y + dy }));
    });
    win.querySelector(".grow").addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      trackOutline(e, win, (g, dx, dy) => ({ ...g, w: g.w + dx, h: g.h + dy }));
    });
  }

  // ---------- Desktop icons ----------

  function selectIcon(icon) {
    icons.forEach((other) => other.classList.toggle("is-selected", other === icon));
  }

  icons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.preventDefault();
      const keyboard = e.detail === 0;
      if (!isDesk() || keyboard || lastPointerType !== "mouse") {
        openWindow(icon.dataset.open);
        return;
      }
      selectIcon(icon);
    });
    icon.addEventListener("dblclick", (e) => {
      e.preventDefault();
      if (isDesk()) openWindow(icon.dataset.open);
    });
  });

  desktop.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".icon")) selectIcon(null);
  });

  // Finder rows highlight when clicked, like selecting a file.
  document.querySelector(".listview tbody").addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    row.parentElement.querySelectorAll("tr").forEach((r) => r.classList.toggle("is-selected", r === row));
  });

  // ---------- Layout mode ----------

  function applyMode() {
    const desk = deskQuery.matches;
    root.classList.toggle("is-desktop", desk);
    selectIcon(null);
    for (const [id, win] of windows) {
      if (desk) {
        win.hidden = !openIds.has(id);
        if (!win.hidden) place(win);
        win.querySelector(".close").removeAttribute("aria-expanded");
      } else {
        win.hidden = win.classList.contains("desktop-only");
        win.removeAttribute("style");
        win.classList.remove("is-active");
        win.querySelector(".close").setAttribute("aria-expanded", String(!win.classList.contains("is-shaded")));
      }
    }
    if (desk) {
      for (const id of openIds) focusWindow(windows.get(id));
    }
    ditherAll();
  }

  deskQuery.addEventListener("change", applyMode);

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isDesk()) for (const id of openIds) place(windows.get(id));
      ditherAll();
    }, 150);
  });

  // ---------- Atkinson dithering ----------

  const originals = new Map();

  function loadOriginal(src) {
    if (!originals.has(src)) {
      const img = new Image();
      img.src = src;
      originals.set(src, img.decode().then(() => img));
    }
    return originals.get(src);
  }

  // Bill Atkinson's error diffusion: pass 6/8 of the error to nearby pixels, drop the rest.
  function atkinson(image) {
    const { data, width, height } = image;
    const lum = new Float32Array(width * height);
    for (let i = 0; i < lum.length; i++) {
      const p = i * 4;
      const v = (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]) / 255;
      lum[i] = 255 * Math.pow(v, 0.9);
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const value = lum[i] < 128 ? 0 : 255;
        const err = (lum[i] - value) / 8;
        lum[i] = value;
        if (x + 1 < width) lum[i + 1] += err;
        if (x + 2 < width) lum[i + 2] += err;
        if (y + 1 < height) {
          if (x > 0) lum[i + width - 1] += err;
          lum[i + width] += err;
          if (x + 1 < width) lum[i + width + 1] += err;
        }
        if (y + 2 < height) lum[i + 2 * width] += err;
      }
    }
    for (let i = 0; i < lum.length; i++) {
      const p = i * 4;
      data[p] = data[p + 1] = data[p + 2] = lum[i];
      data[p + 3] = 255;
    }
  }

  async function dither(img) {
    const width = Math.round(img.getBoundingClientRect().width);
    if (!width || Number(img.dataset.ditherWidth) === width) return;
    img.dataset.ditherWidth = width;
    img.dataset.src ||= img.getAttribute("src");

    const source = await loadOriginal(img.dataset.src).catch(() => null);
    if (!source || Number(img.dataset.ditherWidth) !== width) return;
    const height = Math.round((width * source.naturalHeight) / source.naturalWidth);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
    try {
      const pixels = ctx.getImageData(0, 0, width, height);
      atkinson(pixels);
      ctx.putImageData(pixels, 0, 0);
      img.src = canvas.toDataURL();
      img.classList.add("is-dithered");
    } catch {
      // Canvas is tainted (e.g. opened from file://); keep the grayscale fallback.
    }
  }

  function ditherIn(scope) {
    scope.querySelectorAll("img[data-dither]").forEach((img) => dither(img));
  }

  function ditherAll() {
    for (const win of windows.values()) if (!win.hidden) ditherIn(win);
  }

  // ---------- Start ----------

  const hashId = location.hash.slice(1);
  if (windows.has(hashId) && deskQuery.matches) openIds.add(hashId);
  applyMode();
  if (isDesk() && windows.has(hashId)) focusWindow(windows.get(hashId));
  root.classList.add("is-ready");
})();
