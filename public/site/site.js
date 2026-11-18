// New Legacy marketing site: behaviour for the homepage and case studies.
// Ported from docs/design/mocks/mock.js. Runs once per full page load.
(() => {
  if (window.__nlSite) return;
  window.__nlSite = true;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header + entrance progress
  const header = document.querySelector(".site-header");
  const entrance = document.querySelector(".entrance");
  let ticking = false;
  function onScroll() {
    ticking = false;
    if (entrance && !reduced) {
      const r = entrance.getBoundingClientRect();
      const span = entrance.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
      entrance.style.setProperty("--p", p.toFixed(4));
      entrance.classList.toggle("late", p > .5);
      header.classList.toggle("solid", r.bottom < 80 || p > .97);
    } else {
      header.classList.toggle("solid", scrollY > 40);
    }
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Hero index preview
  const preview = document.querySelector(".index-preview");
  if (preview) {
    const img = preview.querySelector("img");
    document.querySelectorAll(".apps a").forEach((a) => {
      const show = () => { img.src = a.dataset.preview; preview.classList.add("show"); };
      a.addEventListener("mouseenter", show);
      a.addEventListener("focus", show);
      a.addEventListener("mouseleave", () => preview.classList.remove("show"));
      a.addEventListener("blur", () => preview.classList.remove("show"));
    });
  }

  // Product viewer tabs
  document.querySelectorAll("[data-viewer]").forEach((viewer) => {
    const shots = [...viewer.querySelectorAll(".shot")];
    const tabs = [...viewer.querySelectorAll(".tabs button")];
    const caption = viewer.querySelector(".tab-caption");
    const url = viewer.querySelector(".url");
    const hint = viewer.querySelector(".scroll-hint");
    function select(i) {
      shots.forEach((s, j) => s.classList.toggle("on", i === j));
      tabs.forEach((t, j) => t.setAttribute("aria-selected", String(i === j)));
      if (caption) caption.textContent = tabs[i].dataset.caption || "";
      if (url && tabs[i].dataset.url) url.textContent = tabs[i].dataset.url;
      const shot = shots[i];
      shot.scrollTop = 0;
      const check = () => { if (hint) hint.style.opacity = shot.scrollHeight > shot.clientHeight + 40 ? "1" : "0"; };
      const im = shot.querySelector("img");
      im && !im.complete ? im.addEventListener("load", check, { once: true }) : check();
    }
    shots.forEach((s) => s.addEventListener("scroll", () => { if (hint && s.scrollTop > 30) hint.style.opacity = "0"; }, { passive: true }));
    tabs.forEach((t, i) => t.addEventListener("click", () => select(i)));
    select(0);
  });

  // Live phones: lazy-load iframe, click shield to interact
  const phones = [...document.querySelectorAll(".phone[data-live]")];
  const sizePhone = (p) => { const g = p.querySelector(".glass"); p.style.setProperty("--k", (g.clientWidth / 390).toFixed(4)); };
  const ro = new ResizeObserver((es) => es.forEach((e) => sizePhone(e.target.closest(".phone"))));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const f = e.target.querySelector("iframe");
    if (f && !f.src) f.src = f.dataset.src;
    io.unobserve(e.target);
  }), { rootMargin: "600px 600px" });
  phones.forEach((p) => {
    ro.observe(p.querySelector(".glass"));
    io.observe(p);
    p.querySelector(".shield")?.addEventListener("click", () => {
      const f = p.querySelector("iframe");
      if (!f.src) f.src = f.dataset.src;
      p.classList.add("active");
      f.focus();
    });
  });
  document.addEventListener("pointerdown", (e) => {
    phones.forEach((p) => { if (!p.contains(e.target)) p.classList.remove("active"); });
  });

  // Live site track arrows
  const track = document.querySelector(".site-track");
  document.querySelectorAll("[data-track]").forEach((b) => b.addEventListener("click", () => {
    // step exactly one card (card width + gap) so snapping never skips one
    const cards = [...track.querySelectorAll(".site-card:not([hidden])")];
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

  // Voices
  const vTabs = [...document.querySelectorAll(".voice-picker button")];
  vTabs.forEach((t) => t.addEventListener("click", () => {
    vTabs.forEach((x) => x.setAttribute("aria-selected", String(x === t)));
    document.querySelectorAll(".voice-panel").forEach((p) => { p.hidden = p.id !== t.getAttribute("aria-controls"); });
  }));

  // Services accordion
  document.querySelectorAll(".service-head").forEach((h) => h.addEventListener("click", () => {
    const s = h.closest(".service");
    const open = !s.classList.contains("open");
    document.querySelectorAll(".service").forEach((x) => { x.classList.remove("open"); x.querySelector(".service-head").setAttribute("aria-expanded", "false"); });
    if (open) { s.classList.add("open"); h.setAttribute("aria-expanded", "true"); }
  }));

  // Ridge draw (the one orchestrated reveal below the fold)
  const ridge = document.querySelector(".ridge-line");
  if (ridge) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { ridge.classList.add("seen"); o.disconnect(); } }, { threshold: .4 }).observe(ridge);

  // Section headings rise word by word from behind a mask as they arrive
  const headings = document.querySelectorAll(".section-head h2, .ch-name, .close h2, .foot-pitch .display, .sp-copy h3, .case-title h1, .prose h2, .feature-copy h3");
  headings.forEach((h) => {
    if (h.dataset.split) return;
    h.dataset.split = "1";
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", h.textContent.trim());
    h.replaceChildren(...words.flatMap((w, i) => {
      const outer = document.createElement("span"); outer.className = "w"; outer.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span"); inner.textContent = w; inner.style.transitionDelay = i * 55 + "ms";
      outer.append(inner);
      return i < words.length - 1 ? [outer, document.createTextNode(" ")] : [outer];
    }));
  });
  if (!reduced && "IntersectionObserver" in window) {
    const hio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("said"); hio.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    headings.forEach((h) => { h.classList.add("say"); hio.observe(h); });
  }

  // A ridge-coloured line sweeps across the top of each major section as you reach it
  document.querySelectorAll("#work, #sites, #voices, #services, #process").forEach((sec) => {
    const rule = document.createElement("div"); rule.className = "sweep"; rule.setAttribute("aria-hidden", "true");
    sec.prepend(rule);
    if (reduced) { rule.classList.add("go"); return; }
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { rule.classList.add("go"); o.disconnect(); } }, { rootMargin: "0px 0px -25% 0px" }).observe(rule);
  });

  // Desktop: product chapters stack like cards; the one underneath eases back as the next slides over it
  const chapters = [...document.querySelectorAll(".chapter")];
  const stackQuery = matchMedia("(min-width: 1080px) and (min-height: 760px)");
  function stack() {
    if (reduced || !stackQuery.matches) { chapters.forEach((c) => { c.style.removeProperty("--under"); c.style.transform = ""; c.style.filter = ""; }); return; }
    chapters.forEach((c, i) => {
      const next = chapters[i + 1];
      if (!next) { c.style.setProperty("--under", "0"); return; }
      const cover = 1 - Math.min(1, Math.max(0, (next.getBoundingClientRect().top - 72) / (innerHeight * .8)));
      c.style.setProperty("--under", cover.toFixed(3));
      // only transform while covered, so the fixed glow lines up exactly when a card is at rest
      c.style.transform = cover > 0.001 ? `scale(${(1 - cover * .06).toFixed(4)})` : "";
      c.style.filter = cover > 0.001 ? `brightness(${(1 - cover * .55).toFixed(3)})` : "";
    });
  }
  addEventListener("scroll", () => requestAnimationFrame(stack), { passive: true });
  addEventListener("resize", stack);
  stack();

  // Reveal on scroll: sections settle in once as they arrive
  const revealables = document.querySelectorAll(".section-head, .chapter .ch-copy > *, .site-card, .service, .climb, .stage-panel:not([hidden]), .voices-grid, .numbers > div, .feature, .foot-top");
  if (!reduced && "IntersectionObserver" in window) {
    const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    revealables.forEach((el, i) => { el.classList.add("reveal"); el.style.transitionDelay = (el.matches(".site-card, .numbers > div") ? (i % 4) * 70 : 0) + "ms"; rio.observe(el); });
  }

  // Product stages tilt up and the phone slides into place as they scroll into view
  const stages = [...document.querySelectorAll(".stage")];
  function stageProgress() {
    if (reduced) return;
    stages.forEach((st) => {
      const r = st.getBoundingClientRect();
      const v = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .6)));
      st.style.setProperty("--v", (v * v * (3 - 2 * v)).toFixed(3));
    });
  }
  addEventListener("scroll", () => requestAnimationFrame(stageProgress), { passive: true });
  stageProgress();

  // Swipe between product screens on touch
  document.querySelectorAll("[data-viewer]").forEach((viewer) => {
    const screen = viewer.querySelector(".screen");
    const tabs = [...viewer.querySelectorAll(".tabs button")];
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
  });


  // Websites row: switch between service businesses and product brands
  const groupTabs = [...document.querySelectorAll(".site-groups button")];
  groupTabs.forEach((t) => t.addEventListener("click", () => {
    groupTabs.forEach((x) => x.setAttribute("aria-selected", String(x === t)));
    const track = document.querySelector(".site-track");
    let n = 0;
    track.querySelectorAll(".site-card").forEach((c) => {
      const show = c.dataset.group === t.dataset.group;
      c.hidden = !show;
      c.classList.remove("enter", "focus");
      if (show && !reduced) { void c.offsetWidth; c.style.animationDelay = (n++ * 70) + "ms"; c.classList.add("enter"); }
    });
    track.scrollTo({ left: 0 });
    track.dispatchEvent(new Event("scroll"));
  }));

  // Live sites: the phone nearest the centre is in focus
  const siteTrack = document.querySelector(".site-track");
  if (siteTrack) {
    const cards = () => [...siteTrack.querySelectorAll(".site-card:not([hidden])")];
    const focus = () => {
      const mid = siteTrack.getBoundingClientRect().left + siteTrack.clientWidth / 2;
      let best = null, bd = Infinity;
      cards().forEach((c) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = c; } });
      cards().forEach((c) => c.classList.toggle("focus", c === best));
    };
    siteTrack.addEventListener("scroll", () => requestAnimationFrame(focus), { passive: true });
    focus();
  }

  // Mobile call to action: shows after the entrance, hides at the enquiry form
  const cta = document.querySelector(".mobile-cta");
  const contact = document.querySelector("#contact");
  if (cta && entrance && contact) {
    const toggle = () => {
      const past = entrance.getBoundingClientRect().bottom < innerHeight * .5;
      const atForm = contact.getBoundingClientRect().top < innerHeight;
      cta.classList.toggle("show", past && !atForm);
    };
    addEventListener("scroll", () => requestAnimationFrame(toggle), { passive: true });
    toggle();
  }

  // Process stages along the ridge
  const peakTabs = [...document.querySelectorAll(".peaks button")];
  peakTabs.forEach((t) => t.addEventListener("click", () => {
    peakTabs.forEach((x) => x.setAttribute("aria-selected", String(x === t)));
    document.querySelectorAll(".stage-panel").forEach((p) => { p.hidden = p.id !== t.getAttribute("aria-controls"); });
  }));

  // Enquiry wizard: one question per step; single-choice steps advance on selection
  document.querySelectorAll("form.wizard").forEach((form) => {
    const steps = [...form.querySelectorAll(".wz-step")];
    const back = form.querySelector(".wz-back");
    const count = form.querySelector(".wz-count b");
    let i = 0;
    function show(n) {
      i = n;
      steps.forEach((s, j) => { s.hidden = j !== i; });
      form.style.setProperty("--step", String(i + 1));
      count.textContent = String(i + 1);
      back.disabled = i === 0;
      const first = steps[i].querySelector("input, textarea");
      if (first && document.activeElement && form.contains(document.activeElement)) first.focus({ preventScroll: true });
    }
    steps.forEach((s, j) => s.querySelectorAll('input[type="radio"]').forEach((r) => r.addEventListener("change", () => setTimeout(() => show(j + 1), 260))));
    form.querySelectorAll(".wz-next").forEach((b) => b.addEventListener("click", () => show(i + 1)));
    back.addEventListener("click", () => show(Math.max(0, i - 1)));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector('input[name="name"]'), email = form.querySelector('input[name="email"]');
      const note = steps[3].querySelector(".form-note");
      if (!name.value.trim() || !email.value.includes("@")) { note.textContent = "Add your name and an email address so we can reply."; (name.value.trim() ? email : name).focus(); return; }
      const submit = form.querySelector('button[type="submit"]');
      const label = (sel) => [...form.querySelectorAll(sel)].map((i) => { const l = i.closest("label"); return (l.querySelector("strong") || l.querySelector("span")).textContent.trim(); });
      const need = label('input[name="need"]:checked');
      const problems = label('.chips input:checked');
      const when = label('input[name="when"]:checked');
      const extra = form.querySelector(".wz-more textarea").value.trim();
      const phone = form.querySelector('input[name="phone"]').value.trim();
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
          businessName: form.querySelector('input[name="business"]').value.trim() || undefined,
          servicesInterested: need.length ? need : ["Not sure yet"],
          message: message || undefined,
          preferredContact: "email",
          sourcePath: location.pathname + "#contact",
        }),
      }).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        steps.forEach((s) => { s.hidden = true; });
        form.querySelector(".wz-head").hidden = true;
        form.style.setProperty("--step", "4");
        form.querySelector("[data-name]").textContent = name.value.trim().split(" ")[0];
        form.querySelector(".wz-done").hidden = false;
      }).catch(() => {
        submit.disabled = false;
        note.textContent = "That didn’t send. Please try again, or email contact@newlegacyai.ca.";
      });
    });
    show(0);
  });

  // Star field: colours and nebula from Codex's scene, flying forward with scroll, settling onto the ridge
  const sky = document.querySelector(".scene .sky");
  if (sky) {
    const ctx = sky.getContext("2d");
    let seed = 0x5f3759df;
    const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const hsl = (h, s, l) => `hsl(${h * 360} ${s * 100}% ${l * 100}%)`;
    const sprite = (color) => {
      const c = document.createElement("canvas"); c.width = c.height = 32;
      const g = c.getContext("2d"), r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      r.addColorStop(0, color); r.addColorStop(.25, color.replace(")", " / .55)")); r.addColorStop(.55, color.replace(")", " / .12)")); r.addColorStop(1, color.replace(")", " / 0)"));
      g.fillStyle = r; g.fillRect(0, 0, 32, 32); return c;
    };
    const stars = Array.from({ length: 1500 }, () => {
      const roll = rand();
      const color = roll < .45 ? hsl(0, 0, .75 + rand() * .22) : roll < .62 ? hsl(.62, .55, .62 + rand() * .15) : roll < .78 ? hsl(.72, .5, .66 + rand() * .12) : hsl(.6, .45, .7 + rand() * .1);
      return { x: (rand() - .5) * 2.4, y: (rand() - .5) * 1.6, z: rand(), s: .5 + rand() * 2, sp: sprite(color), tw: rand() * 6.28 };
    });
    const neb = document.createElement("canvas");
    function paintNebula(w, h) {
      neb.width = Math.ceil(w / 3); neb.height = Math.ceil(h / 3);
      const g = neb.getContext("2d"), W = neb.width, H = neb.height;
      g.globalCompositeOperation = "lighter";
      const blob = (x, y, r, c, a) => { const gr = g.createRadialGradient(x * W, y * H, 0, x * W, y * H, r * W); gr.addColorStop(0, c.replace(")", ` / ${a})`)); gr.addColorStop(1, c.replace(")", " / 0)")); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
      blob(.22, .2, .42, "rgb(107 79 200)", .5);   // violet #6b4fc8
      blob(.1, .55, .38, "rgb(26 40 82)", .9);     // navy #1a2852
      blob(.78, .26, .46, "rgb(26 40 82)", .8);
      blob(.62, .5, .34, "rgb(45 106 92)", .22);   // teal #2d6a5c, kept low
      blob(.85, .62, .36, "rgb(120 140 240)", .32); // periwinkle lift toward the ridge glow
      blob(.4, .35, .3, "rgb(115 89 191)", .3);
    }
    let w = 0, h = 0, raf = 0, visible = true;
    const resize = () => {
      const r = sky.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 1.75);
      w = r.width; h = r.height; sky.width = Math.round(w * d); sky.height = Math.round(h * d);
      ctx.setTransform(d, 0, 0, d, 0, 0); paintNebula(w, h);
    };
    function frame(t) {
      raf = 0;
      const p = Number(getComputedStyle(entrance).getPropertyValue("--p")) || 0;
      const time = reduced ? 0 : t / 1000;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#06071a"; ctx.fillRect(0, 0, w, h);
      // nebula drifts slowly and sinks as the ridge rises
      ctx.globalAlpha = 1 - p * .35;
      const dx = Math.sin(time * .05) * 18, dy = p * h * .12;
      ctx.drawImage(neb, -30 + dx, -30 + dy, w + 60, h + 60);
      ctx.globalAlpha = 1;
      // lavender haze: centred early, then settles onto the horizon so the photo glow continues it
      const hx = w * (.55 - p * .05), hy = h * (.45 + p * .33);
      const haze = ctx.createRadialGradient(hx, hy, 0, hx, hy, Math.max(w, h) * (.62 - p * .12));
      haze.addColorStop(0, `rgba(122,112,205,${.5 + p * .1})`);
      haze.addColorStop(.35, "rgba(84,72,160,.22)");
      haze.addColorStop(1, "rgba(6,7,26,0)");
      ctx.fillStyle = haze; ctx.fillRect(0, 0, w, h);
      // stars: perspective fly-through driven by scroll, plus a slow drift
      ctx.globalCompositeOperation = "lighter";
      const f = Math.min(w, h) * .9, cx = w * .52, cy = h * (.42 + p * .1), travel = p * .55 + time * .004;
      for (const s of stars) {
        let z = (s.z - travel) % 1; if (z <= 0) z += 1;
        const zz = .08 + z * 1.1;
        const x = cx + (s.x * f) / zz, y = cy + (s.y * f) / zz;
        if (x < -10 || x > w + 10 || y < -10 || y > h + 10) continue;
        const size = Math.min(9, (s.s * 2.4) / zz);
        const fade = Math.min(1, z * 6) * (1 - p * .35) * (.75 + Math.sin(time * 1.5 + s.tw) * .25);
        ctx.globalAlpha = Math.max(0, Math.min(1, fade * (1.1 - zz * .55)));
        ctx.drawImage(s.sp, x - size, y - size, size * 2, size * 2);
      }
      ctx.globalAlpha = 1;
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    new ResizeObserver(() => { resize(); kick(); }).observe(sky);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(entrance);
    addEventListener("scroll", kick, { passive: true });
    document.addEventListener("visibilitychange", kick);
  }
})();
