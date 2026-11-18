  // Modo oscuro: arranca siempre claro; el botón lo cambia y se acuerda de la elección
  (() => {
    const raiz = document.documentElement, btn = document.getElementById("temaBtn"), meta = document.querySelector('meta[name="theme-color"]');
    const aplicar = oscuro => {
      if (oscuro) raiz.setAttribute("data-theme", "dark"); else raiz.removeAttribute("data-theme");
      btn.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"); btn.title = oscuro ? "Modo claro" : "Modo oscuro";
      if (meta) meta.content = oscuro ? "#0c1719" : "#f1f4f3";
      document.dispatchEvent(new Event("tema"));
    };
    aplicar(raiz.getAttribute("data-theme") === "dark");
    btn.addEventListener("click", () => {
      const oscuro = raiz.getAttribute("data-theme") !== "dark"; aplicar(oscuro);
      try { localStorage.setItem("tema", oscuro ? "dark" : "light"); } catch (e) {}
    });
  })();


  // Fondo de puntitos que se unen con líneas y siguen al mouse (colores y fuerza salen del tema)
  (() => {
    const cv = document.getElementById("puntos"), ctx = cv.getContext("2d");
    const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, N = 0, D = 115, ps = [], rgb = "22,117,109", fuerza = .8, mouse = null, activo = true;
    const leerTema = () => { const c = getComputedStyle(document.documentElement); rgb = c.getPropertyValue("--puntos-rgb").trim().replace(/\s/g, "") || rgb; fuerza = parseFloat(c.getPropertyValue("--puntos-fuerza")) || fuerza; if (quieto) pintar(); };
    const nueva = () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .32, vy: (Math.random() - .5) * .32, r: Math.random() * 1.2 + 1 });
    function medir() {
      const dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      N = Math.round(Math.min(90, Math.max(30, W * H / 14000))); D = W < 600 ? 100 : 130;
      while (ps.length < N) ps.push(nueva()); ps.length = N;
      ps.forEach(p => { p.x = Math.min(p.x, W); p.y = Math.min(p.y, H); });
      if (quieto) pintar();
    }
    function pintar() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fillStyle = `rgba(${rgb},${Math.min(1, .8 * fuerza)})`; ctx.fill();
        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
          if (d < D) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = `rgba(${rgb},${.42 * fuerza * (1 - d / D)})`; ctx.lineWidth = .6; ctx.stroke(); }
        }
        if (mouse) {
          const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (d < 160) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.strokeStyle = `rgba(${rgb},${.55 * fuerza * (1 - d / 160)})`; ctx.lineWidth = .6; ctx.stroke(); }
        }
      }
    }
    function cuadro() {
      if (activo) {
        for (const p of ps) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
        pintar();
      }
      requestAnimationFrame(cuadro);
    }
    medir(); leerTema();
    addEventListener("resize", medir);
    document.addEventListener("tema", leerTema);
    document.addEventListener("visibilitychange", () => { activo = !document.hidden; });
    if (quieto) return;
    addEventListener("pointermove", e => { mouse = e.pointerType === "mouse" ? { x: e.clientX, y: e.clientY } : null; }, { passive: true });
    document.addEventListener("mouseleave", () => { mouse = null; });
    requestAnimationFrame(cuadro);
  })();

(() => {
  // Medición simple y sin cookies (Umami). Se activa pegando el "Website ID" del sitio en UMAMI_ID.
  const UMAMI_ID = "";
  if (UMAMI_ID) { const sc = document.createElement("script"); sc.defer = true; sc.src = "https://cloud.umami.is/script.js"; sc.dataset.websiteId = UMAMI_ID; document.head.appendChild(sc); }
  // Cada clic a WhatsApp se anota con la página desde donde salió
  document.addEventListener("click", e => { const a = e.target.closest('a[href*="wa.me"]'); if (a && window.umami) umami.track("whatsapp", { pagina: location.pathname }); });
})();
