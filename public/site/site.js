// New Legacy marketing site: behaviour for the homepage and case studies.
// One scroll loop drives every scroll-linked effect: all reads first, then all writes, once per frame.
(() => {
  if (window.__nlSite) return;
  window.__nlSite = true;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const header = $(".site-header");
  const entrance = $(".entrance");
  const contact = $("#contact");
  const cta = $(".mobile-cta");
  const chapters = $$(".chapter");
  const stages = $$(".stage");
  const stackQuery = matchMedia("(min-width: 1080px) and (min-height: 760px)");
  let p = 0; // entrance progress, shared with the star field
  const HOLD_FROM = 0.62; // the hero is fully settled from here to the end of the entrance

  // ---------- the scroll loop ----------
  const nearStages = new Set();
  if ("IntersectionObserver" in window) {
    const sio = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting ? nearStages.add(e.target) : nearStages.delete(e.target)), { rootMargin: "20% 0px" });
    stages.forEach((s) => sio.observe(s));
  }
  let queued = false;
  function frame() {
    queued = false;
    const vh = innerHeight;
    // reads
    const er = entrance && entrance.getBoundingClientRect();
    const stageTops = [...nearStages].map((s) => [s, s.getBoundingClientRect().top]);
    const stacking = !reduced && stackQuery.matches;
    const chapterTops = stacking ? chapters.map((c) => c.getBoundingClientRect().top) : null;
    const contactTop = contact ? contact.getBoundingClientRect().top : Infinity;
    // writes
    if (entrance && !reduced) {
      const span = entrance.offsetHeight - vh;
      p = Math.min(1, Math.max(0, -er.top / Math.max(1, span)));
      entrance.style.setProperty("--p", p.toFixed(4));
      window.__nlP = p;
      entrance.classList.toggle("late", p > .45);
      header.classList.toggle("solid", er.bottom < 80 || p > .97);
    } else {
      header.classList.toggle("solid", scrollY > 40);
    }
    if (!reduced) {
      for (const [s, top] of stageTops) {
        const v = Math.min(1, Math.max(0, (vh - top) / (vh * .55)));
        s.style.setProperty("--v", (v * v * (3 - 2 * v)).toFixed(3));
      }
    }
    if (stacking) {
      chapters.forEach((c, i) => {
        const nextTop = chapterTops[i + 1];
        const cover = nextTop === undefined ? 0 : 1 - Math.min(1, Math.max(0, (nextTop - 72) / (vh * .7)));
        c.style.transform = cover > .002 ? `scale(${(1 - cover * .07).toFixed(4)}) translateY(${(-cover * 24).toFixed(1)}px)` : "";
        c.style.opacity = cover > .002 ? Math.max(0, 1 - cover * 1.6).toFixed(3) : "";
      });
    } else if (chapters[0] && chapters[0].style.transform) {
      chapters.forEach((c) => { c.style.transform = ""; c.style.opacity = ""; });
    }
    if (cta && er) cta.classList.toggle("show", er.bottom < vh * .5 && contactTop > vh);
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  frame();

  // ---------- the hero holds: when you stop scrolling partway through the entrance, settle on the hero ----------
  if (entrance && !reduced) {
    let lastY = scrollY, dir = 1, idle = 0, snapping = false;
    const settle = () => {
      if (snapping) { snapping = false; return; }
      const span = entrance.offsetHeight - innerHeight;
      const top = entrance.offsetTop;
      const pr = (scrollY - top) / Math.max(1, span);
      // moving down and stopped between the first beat and the hold: land on the settled hero
      if (dir > 0 && pr > .16 && pr < HOLD_FROM + .04) {
        snapping = true;
        scrollTo({ top: top + span * (HOLD_FROM + .1), behavior: "smooth" });
      }
      // moving up and stopped in the middle: go back to the start of the entrance
      else if (dir < 0 && pr > .05 && pr < .4) {
        snapping = true;
        scrollTo({ top: top, behavior: "smooth" });
      }
    };
    addEventListener("scroll", () => {
      const y = scrollY; if (y !== lastY) dir = y > lastY ? 1 : -1; lastY = y;
      clearTimeout(idle); idle = setTimeout(settle, 140);
    }, { passive: true });
  }

  // ---------- hero deck: three product screens stacked, rotating; hovering a pill brings that one forward ----------
  const deck = $(".hero-deck");
  if (deck) {
    const cards = $$("figure", deck);
    let order = cards.map((_, i) => i), timer = 0, held = false;
    const paint = () => cards.forEach((c, i) => { c.dataset.pos = String(order.indexOf(i)); });
    const rotate = () => { order.push(order.shift()); paint(); };
    const start = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => { if (!held && entrance.classList.contains("late")) rotate(); }, 3200); };
    const bring = (app) => {
      const i = cards.findIndex((c) => c.dataset.app === app);
      if (i < 0) return;
      order = [i, ...order.filter((x) => x !== i)];
      paint(); deck.classList.add("held");
    };
    $$(".apps a").forEach((a) => {
      const on = () => { held = true; bring(a.dataset.app); };
      const off = () => { held = false; deck.classList.remove("held"); start(); };
      a.addEventListener("mouseenter", on); a.addEventListener("focus", on);
      a.addEventListener("mouseleave", off); a.addEventListener("blur", off);
    });
    paint(); start();
  }

  // ---------- product viewer tabs ----------
  $$("[data-viewer]").forEach((viewer) => {
    const shots = $$(".shot", viewer);
    const tabs = $$(".tabs button", viewer);
    const caption = $(".tab-caption", viewer);
    const url = $(".url", viewer);
    const hint = $(".scroll-hint", viewer);
    function select(i) {
      shots.forEach((s, j) => s.classList.toggle("on", i === j));
      tabs.forEach((t, j) => t.setAttribute("aria-selected", String(i === j)));
      if (caption) caption.textContent = tabs[i].dataset.caption || "";
      if (url && tabs[i].dataset.url) url.textContent = tabs[i].dataset.url;
      const shot = shots[i];
      shot.scrollTop = 0;
      const check = () => { if (hint) hint.style.opacity = shot.scrollHeight > shot.clientHeight + 40 ? "1" : "0"; };
      const im = $("img", shot);
      im && !im.complete ? im.addEventListener("load", check, { once: true }) : check();
    }
    shots.forEach((s) => s.addEventListener("scroll", () => { if (hint && s.scrollTop > 30) hint.style.opacity = "0"; }, { passive: true }));
    tabs.forEach((t, i) => t.addEventListener("click", () => select(i)));
    // swipe between screens on touch
    const screen = $(".screen", viewer);
    let x0 = null, y0 = null;
    screen.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    screen.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      const cur = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      const next = (cur + (dx < 0 ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click();
      tabs[next].scrollIntoView({ block: "nearest", inline: "center", behavior: reduced ? "auto" : "smooth" });
    });
    select(0);
  });

  // ---------- live phones: a site loads only once its phone has been on screen for a moment ----------
  const phones = $$(".phone[data-live]");
  const sizePhone = (ph) => { const g = $(".glass", ph); ph.style.setProperty("--k", (g.clientWidth / 390).toFixed(4)); };
  const ro = new ResizeObserver((es) => es.forEach((e) => sizePhone(e.target.closest(".phone"))));
  const load = (ph) => { const f = $("iframe", ph); if (f && !f.src) f.src = f.dataset.src; };
  const pending = new Map();
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) pending.set(e.target, setTimeout(() => { load(e.target); io.unobserve(e.target); }, 450));
    else { clearTimeout(pending.get(e.target)); pending.delete(e.target); }
  }), { threshold: .35 });
  phones.forEach((ph) => {
    ro.observe($(".glass", ph));
    io.observe(ph);
    $(".shield", ph)?.addEventListener("click", () => { load(ph); ph.classList.add("active"); $("iframe", ph).focus(); });
  });
  document.addEventListener("pointerdown", (e) => phones.forEach((ph) => { if (!ph.contains(e.target)) ph.classList.remove("active"); }));

  // ---------- websites row: arrows step one card; the phone nearest the centre is in focus ----------
  const track = $(".site-track");
  if (track) {
    const cards = $$(".site-card", track);
    $$("[data-track]").forEach((b) => b.addEventListener("click", () => {
      const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let cur = 0, bd = Infinity;
      cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; cur = i; } });
      const next = Math.max(0, Math.min(cards.length - 1, cur + Number(b.dataset.track)));
      const target = matchMedia("(max-width: 820px)").matches
        ? cards[next].offsetLeft + cards[next].offsetWidth / 2 - track.clientWidth / 2
        : track.scrollLeft + Number(b.dataset.track) * step;
      track.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
    }));
    let fq = false;
    const focus = () => {
      fq = false;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = null, bd = Infinity;
      cards.forEach((c) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = c; } });
      cards.forEach((c) => c.classList.toggle("focus", c === best));
    };
    track.addEventListener("scroll", () => { if (!fq) { fq = true; requestAnimationFrame(focus); } }, { passive: true });
    focus();
  }

  // ---------- voices, services, process ----------
  const vTabs = $$(".voice-picker button");
  vTabs.forEach((t) => t.addEventListener("click", () => {
    vTabs.forEach((x) => x.setAttribute("aria-selected", String(x === t)));
    $$(".voice-panel").forEach((pn) => { pn.hidden = pn.id !== t.getAttribute("aria-controls"); });
  }));
  $$(".service-head").forEach((h) => h.addEventListener("click", () => {
    const s = h.closest(".service");
    const open = !s.classList.contains("open");
    $$(".service").forEach((x) => { x.classList.remove("open"); $(".service-head", x).setAttribute("aria-expanded", "false"); });
    if (open) { s.classList.add("open"); h.setAttribute("aria-expanded", "true"); }
  }));
  const peakTabs = $$(".peaks button");
  peakTabs.forEach((t) => t.addEventListener("click", () => {
    peakTabs.forEach((x) => x.setAttribute("aria-selected", String(x === t)));
    $$(".stage-panel").forEach((pn) => { pn.hidden = pn.id !== t.getAttribute("aria-controls"); });
  }));

  // ---------- arrivals: headings rise word by word, sections settle, lines sweep, the ridge draws ----------
  const headings = $$(".section-head h2, .ch-name, .close h2, .foot-pitch .display, .sp-copy h3, .case-title h1, .prose h2, .feature-copy h3");
  headings.forEach((h) => {
    if (h.dataset.split) return;
    h.dataset.split = "1";
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", h.textContent.trim());
    h.replaceChildren(...words.flatMap((w, i) => {
      const outer = document.createElement("span"); outer.className = "w"; outer.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span"); inner.textContent = w; inner.style.transitionDelay = i * 45 + "ms";
      outer.append(inner);
      return i < words.length - 1 ? [outer, document.createTextNode(" ")] : [outer];
    }));
  });
  $$("#work, #sites, #voices, #services, #process").forEach((sec) => {
    const rule = document.createElement("div"); rule.className = "sweep"; rule.setAttribute("aria-hidden", "true");
    sec.prepend(rule);
  });
  const ridge = $(".ridge-line");
  const arrivals = [
    ...headings.map((el) => [el, "say", "said"]),
    ...$$(".section-head, .chapter .ch-copy > *, .site-card, .service, .climb, .stage-panel:not([hidden]), .voices-grid, .numbers > div, .feature, .foot-top").map((el) => [el, "reveal", "in"]),
    ...$$(".sweep").map((el) => [el, "", "go"]),
    ...$$(".illus").map((el) => [el, "", "play"]),
    ...(ridge ? [[ridge, "", "seen"]] : []),
  ];
  if (reduced || !("IntersectionObserver" in window)) {
    arrivals.forEach(([el, , on]) => el.classList.add(on));
  } else {
    const aio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add(...e.target.dataset.arrive.split(" ")); aio.unobserve(e.target);
    }), { rootMargin: "0px 0px -9% 0px", threshold: .06 });
    let k = 0;
    arrivals.forEach(([el, pre, on]) => {
      if (pre) el.classList.add(pre);
      el.dataset.arrive = el.dataset.arrive ? el.dataset.arrive + " " + on : on;
      if (el.matches(".site-card, .numbers > div")) el.style.transitionDelay = (k++ % 4) * 60 + "ms";
      aio.observe(el);
    });
  }

  // ---------- enquiry wizard: one question per step; single-choice steps advance on selection ----------
  $$("form.wizard").forEach((form) => {
    const steps = $$(".wz-step", form);
    const back = $(".wz-back", form);
    const count = $(".wz-count b", form);
    let i = 0;
    function show(n) {
      i = n;
      steps.forEach((s, j) => { s.hidden = j !== i; });
      form.style.setProperty("--step", String(i + 1));
      count.textContent = String(i + 1);
      back.disabled = i === 0;
      const first = $("input, textarea", steps[i]);
      if (first && document.activeElement && form.contains(document.activeElement)) first.focus({ preventScroll: true });
    }
    steps.forEach((s, j) => $$('input[type="radio"]', s).forEach((r) => r.addEventListener("change", () => setTimeout(() => show(j + 1), 240))));
    $$(".wz-next", form).forEach((b) => b.addEventListener("click", () => show(i + 1)));
    back.addEventListener("click", () => show(Math.max(0, i - 1)));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $('input[name="name"]', form), email = $('input[name="email"]', form);
      const note = $(".form-note", steps[3]);
      if (!name.value.trim() || !email.value.includes("@")) { note.textContent = "Add your name and an email address so we can reply."; (name.value.trim() ? email : name).focus(); return; }
      const submit = $('button[type="submit"]', form);
      const label = (sel) => $$(sel, form).map((x) => { const l = x.closest("label"); return ($("strong", l) || $("span", l)).textContent.trim(); });
      const need = label('input[name="need"]:checked');
      const problems = label(".chips input:checked");
      const when = label('input[name="when"]:checked');
      const extra = $(".wz-more textarea", form).value.trim();
      const phone = $('input[name="phone"]', form).value.trim();
      const message = [
        problems.length ? "Getting in the way: " + problems.join(", ") : "",
        extra ? "Details: " + extra : "",
        when.length ? "Timing: " + when[0] : "",
      ].filter(Boolean).join("\n");
      submit.disabled = true;
      note.textContent = "Sending…";
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          phone: phone || undefined,
          businessName: $('input[name="business"]', form).value.trim() || undefined,
          servicesInterested: need.length ? need : ["Not sure yet"],
          message: message || undefined,
          preferredContact: "email",
          sourcePath: location.pathname + "#contact",
        }),
      }).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        steps.forEach((s) => { s.hidden = true; });
        $(".wz-head", form).hidden = true;
        form.style.setProperty("--step", "4");
        $("[data-name]", form).textContent = name.value.trim().split(" ")[0];
        $(".wz-done", form).hidden = false;
      }).catch(() => {
        submit.disabled = false;
        note.textContent = "That didn’t send. Please try again, or email contact@newlegacyai.ca.";
      });
    });
    show(0);
  });

  // ---------- star field: Codex's colours, flying forward with scroll and settling onto the ridge ----------
  const sky = $(".scene .sky");
  if (sky && entrance) {
    const ctx = sky.getContext("2d", { alpha: false });
    let seed = 0x5f3759df;
    const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const hsl = (h, s, l) => `hsl(${h * 360} ${s * 100}% ${l * 100}%)`;
    const sprite = (color) => {
      const c = document.createElement("canvas"); c.width = c.height = 32;
      const g = c.getContext("2d"), r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      r.addColorStop(0, color); r.addColorStop(.25, color.replace(")", " / .55)")); r.addColorStop(.55, color.replace(")", " / .12)")); r.addColorStop(1, color.replace(")", " / 0)"));
      g.fillStyle = r; g.fillRect(0, 0, 32, 32); return c;
    };
    const palette = [hsl(0, 0, .9), hsl(0, 0, .8), hsl(.62, .55, .7), hsl(.72, .5, .72), hsl(.6, .45, .76)].map(sprite);
    const small = matchMedia("(max-width: 820px)").matches;
    const stars = Array.from({ length: small ? 520 : 900 }, () => {
      const roll = rand();
      const sp = roll < .45 ? palette[rand() < .5 ? 0 : 1] : roll < .62 ? palette[2] : roll < .78 ? palette[3] : palette[4];
      return { x: (rand() - .5) * 2.4, y: (rand() - .5) * 1.6, z: rand(), s: .5 + rand() * 2, sp, tw: rand() * 6.28 };
    });
    const neb = document.createElement("canvas");
    function paintNebula(w, h) {
      neb.width = Math.ceil(w / 4); neb.height = Math.ceil(h / 4);
      const g = neb.getContext("2d"), W = neb.width, H = neb.height;
      g.fillStyle = "#06071a"; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = "lighter";
      const blob = (x, y, r, c, a) => { const gr = g.createRadialGradient(x * W, y * H, 0, x * W, y * H, r * W); gr.addColorStop(0, c.replace(")", ` / ${a})`)); gr.addColorStop(1, c.replace(")", " / 0)")); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
      blob(.22, .2, .42, "rgb(107 79 200)", .5);
      blob(.1, .55, .38, "rgb(26 40 82)", .9);
      blob(.78, .26, .46, "rgb(26 40 82)", .8);
      blob(.62, .5, .34, "rgb(45 106 92)", .22);
      blob(.85, .62, .36, "rgb(120 140 240)", .32);
      blob(.4, .35, .3, "rgb(115 89 191)", .3);
    }
    let w = 0, h = 0, raf = 0, visible = true;
    const resize = () => {
      const r = sky.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, small ? 1.5 : 1.25);
      w = r.width; h = r.height; sky.width = Math.round(w * d); sky.height = Math.round(h * d);
      ctx.setTransform(d, 0, 0, d, 0, 0); paintNebula(w, h);
    };
    function draw(t) {
      raf = 0;
      const time = reduced ? 0 : t / 1000;
      const p = Math.min(1, window.__nlP / HOLD_FROM || 0); // visuals finish at the hold, then stay put
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.drawImage(neb, -30 + Math.sin(time * .05) * 18, -30 + p * h * .12, w + 60, h + 60);
      const hx = w * (.55 - p * .05), hy = h * (.45 + p * .33);
      const haze = ctx.createRadialGradient(hx, hy, 0, hx, hy, Math.max(w, h) * (.62 - p * .12));
      haze.addColorStop(0, `rgba(122,112,205,${.5 + p * .1})`);
      haze.addColorStop(.35, "rgba(84,72,160,.22)");
      haze.addColorStop(1, "rgba(6,7,26,0)");
      ctx.fillStyle = haze; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const f = Math.min(w, h) * .9, cx = w * .52, cy = h * (.42 + p * .1), travel = p * .55 + time * .004, dim = 1 - p * .35;
      for (const s of stars) {
        let z = (s.z - travel) % 1; if (z <= 0) z += 1;
        const zz = .08 + z * 1.1;
        const x = cx + (s.x * f) / zz, y = cy + (s.y * f) / zz;
        if (x < -10 || x > w + 10 || y < -10 || y > h + 10) continue;
        const size = Math.min(5.5, (s.s * 2.2) / zz);
        const a = Math.min(1, z * 6) * Math.min(1, (zz - .08) * 5) * dim * (.75 + Math.sin(time * 1.5 + s.tw) * .25) * (1.1 - zz * .55);
        if (a <= .02) continue;
        ctx.globalAlpha = a > 1 ? 1 : a;
        ctx.drawImage(s.sp, x - size, y - size, size * 2, size * 2);
      }
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(draw);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    new ResizeObserver(() => { resize(); kick(); }).observe(sky);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(entrance);
    addEventListener("scroll", kick, { passive: true });
    document.addEventListener("visibilitychange", kick);
  }
})();
