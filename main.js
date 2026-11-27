(function () {
  /* === 1. Scroll Reveal Menonjol + Parallax Editorial Halus + Progress Bar === */
  const progressBar = document.getElementById("scrollProgressBar");
  const heroPhotoImg = document.querySelector(".hero-photo img");
  const verticalNote = document.querySelector(".vertical-note");
  let scrollTicking = false;

  function applyScrollEffects() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    if (progressBar) progressBar.style.width = pct + "%";

    // Parallax halus pada foto hero & catatan vertikal Jepang
    if (scrollTop < 700) {
      if (heroPhotoImg) {
        heroPhotoImg.style.transform = "translateY(" + (scrollTop * 0.06) + "px) scale(1.04)";
      }
      if (verticalNote) {
        verticalNote.style.transform = "translateY(" + (scrollTop * 0.12) + "px)";
      }
    }
    scrollTicking = false;
  }

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(applyScrollEffects);
      scrollTicking = true;
    }
  }, { passive: true });
  applyScrollEffects();

  // Tambahkan efek cascade bertahap yang terasa mengalir pada tiap kelompok elemen
  document.querySelectorAll(".meaning-row, .omamori-grid, .etika-list, .studio-grid, .diy-wrap, .color-grid, .glossary-grid, .team-grid").forEach((group) => {
    Array.from(group.children).forEach((child, idx) => {
      child.classList.add("reveal-item");
      child.style.setProperty("--stagger", (idx % 6) * 85 + "ms");
    });
  });

  const revealTargets = document.querySelectorAll(".reveal, .reveal-item");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -36px 0px" });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("visible"));
  }

  /* === 2. Mesin Efek Suara Alat Musik Tradisional Jepang (Web Audio API) === */
  let audioCtx = null;
  let soundOn = true;
  // Tangga nada Hirajōshi Jepang (D4, E4, F4, A4, Bb4, D5, E5, F5, A5)
  const kotoScale = [293.66, 329.63, 349.23, 440.0, 466.16, 587.33, 659.25, 698.46, 880.0];

  function getAudio() {
    if (!soundOn) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  // 1) KOTO (Harpa petik Jepang) : untuk balik kartu, era, langkah DIY, & motif kain
  function playKoto(idx = 0, vol = 0.085) {
    const ctx = getAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freq = kotoScale[Math.abs(idx) % kotoScale.length];

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(freq, now);
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 6.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.55);

    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.85);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.88);
    osc2.stop(now + 0.88);
  }

  // 2) KOTO GLISSANDO (Petikan harpa beruntun lembut) : untuk putar 360° & acak desain
  function playChord() {
    if (!soundOn) return;
    [2, 3, 5, 6, 8].forEach((n, i) => setTimeout(() => playKoto(n, 0.06), i * 62));
  }

  // 3) HYŌSHIGI (Ketukan kayu tradisional Jepang) : untuk filter, checklist, & tombol ringan
  function playHyoshigi(pitch = 1) {
    const ctx = getAudio();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1150 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(720 * pitch, now + 0.045);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400 * pitch, now);
    filter.Q.setValueAtTime(4.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.085);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.095);
  }

  // 4) FŪRIN / SUZU (Lonceng angin kaca & lonceng kuil Shinto) : untuk mode gelap, ikat ulang, & Otakiage
  function playFurin(baseFreq = 1318.5) {
    const ctx = getAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const partials = [1, 2.76, 4.07];
    partials.forEach((ratio, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq * ratio, now);
      const v = idx === 0 ? 0.055 : 0.018 / idx;
      gain.gain.setValueAtTime(0.0006, now);
      gain.gain.exponentialRampToValueAtTime(v, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0004, now + (idx === 0 ? 1.15 : 0.55));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  // 5) SHAKUHACHI / ANGIN HALUS (Seruling bambu menurun lembut) : saat tali dibuka & doa melayang kabur
  function playPrayerDrift() {
    const ctx = getAudio();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Nada seruling bambu menurun lembut
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(698.46, now);
    osc.frequency.exponentialRampToValueAtTime(440.0, now + 1.1);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.3);

    // Disusul 3 petikan koto menurun pelan
    [6, 4, 2].forEach((n, i) => setTimeout(() => playKoto(n, 0.045), 140 + i * 160));
  }

  // Wrapper kompatibel agar panggilan playTone lama memetik Koto
  function playTone(idx = 0) {
    playKoto(idx + 2, 0.075);
  }

  const soundBtn = document.getElementById("soundToggle");
  const soundIconSvg = document.getElementById("soundIconSvg");
  const soundOnPath = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
  const soundOffPath = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    if (soundIconSvg) soundIconSvg.innerHTML = soundOn ? soundOnPath : soundOffPath;
    if (soundOn) playChord();
  });

  /* === 2B. Gerbang Pembuka Interaktif (Omamori no Sekai) === */
  const openingGate = document.getElementById("openingGate");
  const gateCharmBtn = document.getElementById("gateCharmBtn");
  const gateRipple = document.getElementById("gateRipple");
  const gateQuote = document.getElementById("gateQuote");
  const gateQuoteSub = document.getElementById("gateQuoteSub");
  const symBtns = document.querySelectorAll(".sym-btn");
  const gateEnterBtn = document.getElementById("gateEnterBtn");
  const replayGateBtn = document.getElementById("replayGateBtn");

  const openingBlessings = [
    {
      quote: "“Satu simpul kecil menyimpan doa yang panjang. Semoga langkahmu hari ini selalu tenang.”",
      sub: "守 · Mamoru : Perlindungan & Ketenangan",
      play: () => playKoto(5, 0.08)
    },
    {
      quote: "“Setiap pertemuan baik berawal dari hati yang terbuka dan niat yang hangat.”",
      sub: "縁 · En : Ikatan & Pertemuan Bermakna",
      play: () => playFurin(1318.5)
    },
    {
      quote: "“Keberuntungan kerap hadir pelan, menyertai mereka yang tekun merawat harapannya.”",
      sub: "福 · Fuku : Keberuntungan & Kebahagiaan",
      play: () => playChord()
    },
    {
      quote: "“Di tengah hari yang ramai, semoga selalu ada ruang hening untuk merasa aman.”",
      sub: "安 · An : Kedamaian & Keselamatan",
      play: () => { playKoto(2, 0.075); setTimeout(() => playFurin(1174.66), 140); }
    }
  ];

  let symIdx = 0;

  function triggerRipple() {
    gateRipple.classList.remove("pulse");
    void gateRipple.offsetWidth;
    gateRipple.classList.add("pulse");
  }

  function selectSymbol(idx) {
    symIdx = idx % openingBlessings.length;
    const b = openingBlessings[symIdx];
    gateQuote.textContent = b.quote;
    gateQuoteSub.textContent = b.sub;
    symBtns.forEach((btn, i) => btn.classList.toggle("active", i === symIdx));
    gateQuote.classList.remove("fade-swap");
    void gateQuote.offsetWidth;
    gateQuote.classList.add("fade-swap");
    triggerRipple();
    b.play();
  }

  symBtns.forEach((btn) => {
    btn.addEventListener("click", () => selectSymbol(Number(btn.dataset.sym)));
  });

  gateCharmBtn.addEventListener("click", () => {
    selectSymbol((symIdx + 1) % openingBlessings.length);
  });

  gateEnterBtn.addEventListener("click", () => {
    playChord();
    setTimeout(() => playFurin(1396.9), 220);
    openingGate.classList.add("dismissed");
    document.body.classList.remove("gate-locked");
  });

  if (replayGateBtn) {
    replayGateBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      openingGate.classList.remove("dismissed");
      document.body.classList.add("gate-locked");
      playFurin(1318.5);
    });
  }

  /* === 3. Mode Gelap / Terang === */
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  const sunPath = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  function setTheme(mode) {
    root.setAttribute("data-theme", mode);
    const isDark = mode === "dark";
    themeBtn.setAttribute("aria-pressed", String(isDark));
    if (themeIcon) themeIcon.innerHTML = isDark ? sunPath : moonPath;
    try { localStorage.setItem("omamori-theme", mode); } catch (e) {}
  }
  try {
    const saved = localStorage.getItem("omamori-theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
  } catch (e) {}
  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
    playFurin(next === "dark" ? 1046.5 : 1396.9);
  });

  /* === 4. Linimasa Sejarah & Evolusi Bentuk/Material === */
  const tracks = {
    history: [
      {
        label: "Periode Jomon",
        period: "Sekitar 18.000 – 300 SM",
        heading: "Cikal Bakal dari Manik Batu Magatama",
        body: "Masyarakat Jepang kuno mengenakan manik batu berbentuk koma bernama magatama untuk menangkal roh jahat dan bencana alam.",
        detail: "Akar awal kepercayaan bahwa benda kecil yang dibawa dekat tubuh dapat memberi perlindungan."
      },
      {
        label: "Nara & Heian",
        period: "710 – 1185 M",
        heading: "Jimat Kuil bagi Bangsawan dan Samurai",
        body: "Seiring masuknya ajaran Buddha, termasuk ritual doa kito aliran Shingon sejak abad ke-9, kuil mulai membagikan jimat doa. Di era Heian, bangsawan dan samurai membawanya untuk keselamatan di medan perang.",
        detail: "Mulai lahir ritual pemberkatan resmi oleh biksu dan pendeta kuil."
      },
      {
        label: "Periode Edo",
        period: "1603 – 1868 M (Tokugawa)",
        heading: "Lahirnya Bentuk Kantong Kain Modern",
        body: "Tradisi jimat Buddha dan ofuda Shinto berpadu membentuk kantong kain brokat yang praktis dibawa. Ramainya perjalanan ziarah membuat masyarakat umum membawa omamori dalam kehidupan sehari-hari.",
        detail: "Setiap daerah dan kuil mulai mengembangkan ciri khas motif serta spesialisasi doanya sendiri."
      },
      {
        label: "Meiji – Kini",
        period: "1868 M – Sekarang",
        heading: "Ragam Harapan Kehidupan Modern",
        body: "Omamori terus berkembang mengikuti kebutuhan zaman: mulai dari kelulusan ujian, karier, percintaan, keselamatan berkendara, hingga hadiah bermakna bagi orang terdekat.",
        detail: "Menjadi ikon budaya Jepang yang memadukan tradisi spiritual, seni tekstil, dan kehidupan harian."
      }
    ],
    material: [
      {
        label: "Batu & Kayu Alam",
        period: "Tahap 01 · Material Alami Awal",
        heading: "Dari Batu Magatama hingga Papan Kayu Kifuda",
        body: "Sebelum berbentuk kantong, benda pelindung dibuat dari batu alam seperti magatama, potongan kayu suci (kifuda), atau benda alam yang dianggap menyimpan energi perlindungan.",
        detail: "Hingga sekarang, papan kayu kecil bertuliskan doa masih menjadi inti di dalam banyak omamori tradisional."
      },
      {
        label: "Kertas Doa & Ofuda",
        period: "Tahap 02 · Media Kertas Suci",
        heading: "Lembaran Kertas Washi Bertuliskan Doa",
        body: "Berkembangnya tradisi menulis sutra Buddha dan ofuda Shinto menghadirkan jimat berbahan kertas lipat yang memuat nama dewa atau kaligrafi doa khusus.",
        detail: "Karena kertas mudah rusak saat dibawa bepergian, muncul kebutuhan akan pelindung luar yang lebih kuat."
      },
      {
        label: "Kantong Kain Brokat",
        period: "Tahap 03 · Era Sutra & Tenun",
        heading: "Kain Sutra Brokat & Simpul Nijūkanō",
        body: "Untuk melindungi kertas atau kayu doa di dalamnya, dibuatlah kantong kecil dari kain katun hingga sutra brokat bersulam indah yang diikat dengan simpul khusus nijūkanō yang melambangkan harapan agar doa terkabul.",
        detail: "Gaya Kyoto cenderung lembut dengan pewarnaan halus, sedangkan gaya Tokyo sering tampil lebih tegas dan grafis."
      },
      {
        label: "Bentuk Khusus & Praktis",
        period: "Tahap 04 · Adaptasi Keseharian",
        heading: "Plakat Kayu Mini, Lonceng, Kartu & Stiker",
        body: "Selain kantong kain, kuil mulai membuat omamori dalam rupa plakat kayu mini bergaya ema, lonceng kecil, kartu tipis khusus dompet, hingga stiker keselamatan untuk ditempel di kendaraan.",
        detail: "Bentuknya menyesuaikan benda modern agar mudah dibawa tanpa cepat rusak."
      },
      {
        label: "Gaya Modern & Kontemporer",
        period: "Tahap 05 · Desain Masa Kini",
        heading: "Cincin, Akrilik, Logam & Motif Budaya Pop",
        body: "Banyak kuil kini menghadirkan desain modern yang memikat generasi muda, seperti omamori berbentuk cincin di Kuil Shimogamo Kyoto, gantungan logam/akrilik minimalis, hingga kolaborasi motif karakter populer.",
        detail: "Meski bentuk luarnya makin beragam dan estetik, esensi niat baik dan doa di dalamnya tetap dijaga."
      }
    ]
  };

  let activeTrack = "history";
  let eraIdx = 0;
  const trackBtns = document.querySelectorAll(".track-btn");
  const eraNav = document.getElementById("eraNav");
  const eraContent = document.getElementById("eraContent");
  const eraPeriod = document.getElementById("eraPeriod");
  const eraHeading = document.getElementById("eraHeading");
  const eraBody = document.getElementById("eraBody");
  const eraDetail = document.getElementById("eraDetail");
  const eraCount = document.getElementById("eraCount");

  function buildEraNav() {
    const list = tracks[activeTrack];
    eraNav.innerHTML = "";
    list.forEach((item, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "era-btn" + (i === eraIdx ? " active" : "");
      b.innerHTML = '<span class="num">0' + (i + 1) + "</span>" + item.label;
      b.addEventListener("click", () => showEra(i, true));
      eraNav.appendChild(b);
    });
  }

  function showEra(n, withSound) {
    const list = tracks[activeTrack];
    eraIdx = (n + list.length) % list.length;
    const e = list[eraIdx];
    eraPeriod.textContent = e.period;
    eraHeading.textContent = e.heading;
    eraBody.textContent = e.body;
    eraDetail.textContent = e.detail;
    eraCount.textContent = "0" + (eraIdx + 1) + " / 0" + list.length;
    eraNav.querySelectorAll(".era-btn").forEach((b, i) => b.classList.toggle("active", i === eraIdx));
    eraContent.classList.remove("fade-swap");
    void eraContent.offsetWidth;
    eraContent.classList.add("fade-swap");
    if (withSound) playTone(eraIdx);
  }

  trackBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTrack = btn.dataset.track;
      eraIdx = 0;
      trackBtns.forEach((b) => b.classList.toggle("active", b === btn));
      buildEraNav();
      showEra(0, true);
    });
  });

  document.getElementById("prevEra").addEventListener("click", () => showEra(eraIdx - 1, true));
  document.getElementById("nextEra").addEventListener("click", () => showEra(eraIdx + 1, true));
  buildEraNav();
  showEra(0, false);

  /* === 5. Filter & Flip 9 Kartu Jenis Omamori === */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const flipCards = document.querySelectorAll(".flip-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
      flipCards.forEach((c) => c.classList.toggle("hidden", f !== "all" && c.dataset.cat !== f));
      playHyoshigi(1.05);
    });
  });

  flipCards.forEach((card, i) => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      playTone(i % kotoScale.length, 0.38, 0.048);
    });
  });

  /* === 6. Studio Rakit Replika Omamori Sendiri (9+Custom Kain, 9 Motif, 9+Custom Tali) === */
  const fabricMap = {
    sakura: { name: "Sakura", bg: "#edd2d5", ink: "#6e353a" },
    matcha: { name: "Matcha", bg: "#d5e2ce", ink: "#354d32" },
    asagi: { name: "Asagi", bg: "#cee0ea", ink: "#2d4b5e" },
    kuchinashi: { name: "Kuchinashi", bg: "#efe1be", ink: "#664d1f" },
    fuji: { name: "Fuji", bg: "#dfd6e8", ink: "#4c3b61" },
    sango: { name: "Sango", bg: "#f0cfc2", ink: "#7a3e2c" },
    wakakusa: { name: "Wakakusa", bg: "#dce6c6", ink: "#47572d" },
    shironeri: { name: "Shironeri", bg: "#edeae2", ink: "#3c3732" },
    sumi: { name: "Sumi", bg: "#35312d", ink: "#f2ece2" }
  };
  const patternNames = {
    seigaiha: "Seigaiha",
    asanoha: "Asanoha",
    ichimatsu: "Ichimatsu",
    shippo: "Shippō",
    kikko: "Kikkō",
    yagasuri: "Yagasuri",
    tenun: "Tenun Garis",
    bintik: "Bintik Halus",
    polos: "Polos Washi"
  };

  const repState = {
    fabric: "sakura",
    customFabricHex: null,
    pattern: "seigaiha",
    cord: "#b84a39",
    knot: "nijukano",
    kanji: "縁結び",
    blessingName: "En-musubi",
    deg: 0
  };
  const knotNames = {
    nijukano: "Nijūkanō",
    sakura: "Kepang Sakura",
    ume: "Ume-musubi",
    tassel: "Simpul Rumbai"
  };

  const replica3d = document.getElementById("replica3d");
  const repFront = document.getElementById("repFront");
  const repBack = document.getElementById("repBack");
  const repKanji = document.getElementById("repKanji");
  const repWishDisplay = document.getElementById("repWishDisplay");
  const repSummary = document.getElementById("repSummary");
  const repSelect = document.getElementById("repBlessingSelect");
  const repWishInput = document.getElementById("repWishInput");
  const customFabricInput = document.getElementById("customFabricInput");
  const customFabricWrap = document.getElementById("customFabricWrap");
  const customCordInput = document.getElementById("customCordInput");
  const customCordWrap = document.getElementById("customCordWrap");

  function updateReplica() {
    let bg = "#edd2d5";
    let ink = "#6e353a";
    let fabLabel = "Sakura";
    if (repState.customFabricHex) {
      bg = repState.customFabricHex;
      ink = "#25221f";
      fabLabel = "Custom (" + repState.customFabricHex.toUpperCase() + ")";
    } else {
      const fab = fabricMap[repState.fabric];
      bg = fab.bg;
      ink = fab.ink;
      fabLabel = fab.name;
    }
    replica3d.style.setProperty("--rep-bg", bg);
    replica3d.style.setProperty("--rep-ink", ink);
    replica3d.style.setProperty("--rep-cord", repState.cord);
    repFront.setAttribute("data-pattern", repState.pattern);
    repBack.setAttribute("data-pattern", repState.pattern);
    repKanji.textContent = repState.kanji;
    renderReplicaCord();
    repSummary.textContent = "Kain " + fabLabel + " · Motif " + patternNames[repState.pattern] + " · " + knotNames[repState.knot] + " · " + repState.blessingName;
  }

  function buildCordMarkup(color, knotType) {
    // Tali gantungan melengkung di atas kantong dengan tekstur kepang halus
    const loopBase = `
      <path d="M52 72 C44 26, 56 10, 75 10 C94 10, 106 26, 98 72" fill="none" stroke="${color}" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M52 72 C44 26, 56 10, 75 10 C94 10, 106 26, 98 72" fill="none" stroke="rgba(255,250,242,0.55)" stroke-width="2" stroke-dasharray="5 6" stroke-linecap="round"/>
    `;
    if (knotType === "sakura") {
      return loopBase + `
        <path d="M40 86 C54 74, 96 74, 110 86" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
        <path d="M46 92 C62 80, 88 80, 104 92" fill="none" stroke="#f5ead8" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M54 88 C66 96, 84 96, 96 88" fill="none" stroke="${color}" stroke-width="5.5" stroke-linecap="round"/>
        <g transform="translate(103 78)">
          <circle cx="0" cy="-9" r="5.5" fill="#f3b6c0" stroke="${color}" stroke-width="1"/>
          <circle cx="8.5" cy="-3" r="5.5" fill="#f3b6c0" stroke="${color}" stroke-width="1"/>
          <circle cx="5.2" cy="7" r="5.5" fill="#f3b6c0" stroke="${color}" stroke-width="1"/>
          <circle cx="-5.2" cy="7" r="5.5" fill="#f3b6c0" stroke="${color}" stroke-width="1"/>
          <circle cx="-8.5" cy="-3" r="5.5" fill="#f3b6c0" stroke="${color}" stroke-width="1"/>
          <circle cx="0" cy="0" r="3.2" fill="${color}"/>
        </g>
      `;
    }
    if (knotType === "ume") {
      return loopBase + `
        <g fill="none" stroke="${color}" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="75" cy="74" r="7.5"/>
          <circle cx="85" cy="81" r="7.5"/>
          <circle cx="81" cy="92" r="7.5"/>
          <circle cx="69" cy="92" r="7.5"/>
          <circle cx="65" cy="81" r="7.5"/>
          <circle cx="75" cy="84" r="4.5" fill="#fcfbf8" stroke="${color}" stroke-width="3"/>
        </g>
      `;
    }
    if (knotType === "tassel") {
      return loopBase + `
        <rect x="64" y="75" width="22" height="10" rx="5" fill="${color}"/>
        <path d="M58 80 C44 74, 42 90, 56 87" fill="none" stroke="${color}" stroke-width="4.8" stroke-linecap="round"/>
        <path d="M92 80 C106 74, 108 90, 94 87" fill="none" stroke="${color}" stroke-width="4.8" stroke-linecap="round"/>
        <path d="M70 85 L65 114 M75 85 L75 117 M80 85 L85 114" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
        <circle cx="75" cy="88" r="4" fill="#f5ead8" stroke="${color}" stroke-width="2"/>
      `;
    }
    // Default: Nijukano klasik Jepang (pita simpul ganda + ekor tali)
    return loopBase + `
      <path d="M62 82 C42 66, 36 96, 58 92 C66 90, 70 86, 75 82 C80 86, 84 90, 92 92 C114 96, 108 66, 88 82" fill="none" stroke="${color}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M68 88 L56 106 M82 88 L94 106" stroke="${color}" stroke-width="4.2" stroke-linecap="round"/>
      <rect x="67" y="76" width="16" height="13" rx="5" fill="${color}" stroke="rgba(255,250,242,0.5)" stroke-width="1.2"/>
      <path d="M62 82 C48 72, 44 89, 58 88 M88 82 C102 72, 106 89, 92 88" fill="none" stroke="rgba(255,250,242,0.45)" stroke-width="1.6" stroke-linecap="round"/>
    `;
  }

  function renderReplicaCord() {
    const markup = buildCordMarkup(repState.cord, repState.knot);
    const cf = document.getElementById("repCordFront");
    const cb = document.getElementById("repCordBack");
    if (cf) cf.innerHTML = markup;
    if (cb) cb.innerHTML = markup;
  }

  function rotateReplica(delta) {
    repState.deg += delta;
    replica3d.style.transform = "rotateY(" + repState.deg + "deg)";
  }

  replica3d.addEventListener("click", () => { rotateReplica(180); playTone(2); });
  replica3d.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      rotateReplica(180);
      playTone(2);
    }
  });
  document.getElementById("btnRepFlip").addEventListener("click", () => { rotateReplica(180); playTone(2); });
  document.getElementById("btnRepSpin").addEventListener("click", () => { rotateReplica(360); playChord(); });

  document.querySelectorAll("#fabricOpts .opt-chip").forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      repState.fabric = btn.dataset.fabric;
      repState.customFabricHex = null;
      document.querySelectorAll("#fabricOpts .opt-chip").forEach((b) => b.classList.toggle("active", b === btn));
      customFabricWrap.classList.remove("active");
      updateReplica();
      playTone(idx);
    });
  });

  customFabricInput.addEventListener("input", () => {
    repState.customFabricHex = customFabricInput.value;
    document.querySelectorAll("#fabricOpts .opt-chip").forEach((b) => b.classList.remove("active"));
    customFabricWrap.classList.add("active");
    updateReplica();
  });

  document.querySelectorAll("#patternOpts .opt-chip").forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      repState.pattern = btn.dataset.pattern;
      document.querySelectorAll("#patternOpts .opt-chip").forEach((b) => b.classList.toggle("active", b === btn));
      updateReplica();
      playTone(idx + 1);
    });
  });

  document.querySelectorAll("#cordOpts .opt-chip").forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      repState.cord = btn.dataset.cord;
      document.querySelectorAll("#cordOpts .opt-chip").forEach((b) => b.classList.toggle("active", b === btn));
      customCordWrap.classList.remove("active");
      updateReplica();
      playHyoshigi(0.95 + idx * 0.04);
    });
  });

  customCordInput.addEventListener("input", () => {
    repState.cord = customCordInput.value;
    document.querySelectorAll("#cordOpts .opt-chip").forEach((b) => b.classList.remove("active"));
    customCordWrap.classList.add("active");
    updateReplica();
  });

  document.querySelectorAll("#knotOpts .opt-chip").forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      repState.knot = btn.dataset.knot;
      document.querySelectorAll("#knotOpts .opt-chip").forEach((b) => b.classList.toggle("active", b === btn));
      updateReplica();
      playKoto(idx + 3, 0.075);
    });
  });

  repSelect.addEventListener("change", () => {
    const parts = repSelect.value.split("|");
    repState.kanji = parts[0];
    repState.blessingName = parts[1];
    updateReplica();
    playTone(3);
  });

  repWishInput.addEventListener("input", () => {
    const val = repWishInput.value.trim();
    repWishDisplay.textContent = val || "Tulis harapan pribadimu di kolom sebelah.";
  });

  document.getElementById("btnRepRandom").addEventListener("click", () => {
    const fabKeys = Object.keys(fabricMap);
    const patKeys = Object.keys(patternNames);
    const cordBtns = Array.from(document.querySelectorAll("#cordOpts .opt-chip"));

    repState.fabric = fabKeys[Math.floor(Math.random() * fabKeys.length)];
    repState.customFabricHex = null;
    repState.pattern = patKeys[Math.floor(Math.random() * patKeys.length)];
    const pickedCord = cordBtns[Math.floor(Math.random() * cordBtns.length)];
    repState.cord = pickedCord.dataset.cord;
    const knotKeys = Object.keys(knotNames);
    repState.knot = knotKeys[Math.floor(Math.random() * knotKeys.length)];
    document.querySelectorAll("#knotOpts .opt-chip").forEach((b) => b.classList.toggle("active", b.dataset.knot === repState.knot));

    const randOptIdx = Math.floor(Math.random() * repSelect.options.length);
    repSelect.selectedIndex = randOptIdx;
    const parts = repSelect.value.split("|");
    repState.kanji = parts[0];
    repState.blessingName = parts[1];

    document.querySelectorAll("#fabricOpts .opt-chip").forEach((b) => b.classList.toggle("active", b.dataset.fabric === repState.fabric));
    customFabricWrap.classList.remove("active");
    document.querySelectorAll("#patternOpts .opt-chip").forEach((b) => b.classList.toggle("active", b.dataset.pattern === repState.pattern));
    cordBtns.forEach((b) => b.classList.toggle("active", b === pickedCord));
    customCordWrap.classList.remove("active");

    updateReplica();
    rotateReplica(360);
    playChord();
  });

  updateReplica();

  /* === 7. Etika Smooth Accordion + Visual Interaktif === */
  document.querySelectorAll(".etika-row").forEach((row, i) => {
    const trigger = row.querySelector(".etika-trigger");
    trigger.addEventListener("click", () => {
      const open = !row.classList.contains("open");
      row.classList.toggle("open", open);
      trigger.setAttribute("aria-expanded", String(open));
      playTone(open ? i + 2 : 0, 0.3, 0.045);
    });
  });

  // Demo 01: Coba Buka Tali -> doa-doa (kanji) melayang kabur + nada menurun lembut
  const pouchOpenStage = document.getElementById("pouchOpenStage");
  const pouchOpenStatus = document.getElementById("pouchOpenStatus");
  document.getElementById("btnTryOpen").addEventListener("click", () => {
    pouchOpenStage.classList.remove("opened");
    void pouchOpenStage.offsetWidth;
    pouchOpenStage.classList.add("opened");
    pouchOpenStatus.textContent = "Oh tidak! Saat talinya dibuka, doa-doa di dalam ikut melayang pergi dan berkahnya meredup.";
    playPrayerDrift();
  });
  document.getElementById("btnRetie").addEventListener("click", () => {
    pouchOpenStage.classList.remove("opened");
    pouchOpenStatus.textContent = "Tali simpul terikat rapat kembali. Doa dan berkah pun tersimpan tenang di dalam kantong.";
    playFurin(1318.5);
  });

  // Demo 02: Pilih lokasi penyimpanan
  const placeData = {
    bag: {
      kanji: "学業成就",
      label: "Tas Sekolah",
      text: "Gantungkan Gakugyō-jōju pada tas sekolah atau simpan rapi di kotak pensil agar dekat saat belajar dan ujian."
    },
    car: {
      kanji: "交通安全",
      label: "Kendaraan",
      text: "Letakkan Kōtsū-anzen di dalam mobil, gantungan kunci motor, atau tas travel untuk menemani perjalanan."
    },
    wallet: {
      kanji: "開運・縁結",
      label: "Dompet / Saku",
      text: "Simpan En-musubi, Kenkō, atau Kaiun di dompet maupun saku bersih agar terlindung dari debu dan selalu dekat."
    }
  };
  const placeKanji = document.getElementById("placeKanji");
  const placeLabel = document.getElementById("placeLabel");
  const placeStatus = document.getElementById("placeStatus");
  const placeVisual = document.getElementById("placeVisual");
  document.querySelectorAll(".place-opt").forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      const item = placeData[btn.dataset.place];
      document.querySelectorAll(".place-opt").forEach((b) => b.classList.toggle("active", b === btn));
      placeKanji.textContent = item.kanji;
      placeLabel.textContent = item.label;
      placeStatus.textContent = item.text;
      placeVisual.classList.remove("fade-swap");
      void placeVisual.offsetWidth;
      placeVisual.classList.add("fade-swap");
      playTone(idx + 1, 0.35, 0.045);
    });
  });

  // Demo 03: Simulasi Otakiage (1 tahun)
  const otakiStage = document.getElementById("otakiStage");
  const otakiStatus = document.getElementById("otakiStatus");
  document.getElementById("btnOtaki").addEventListener("click", () => {
    otakiStage.classList.add("burning");
    otakiStatus.textContent = "Dalam upacara Otakiage, omamori dikembalikan ke kuil untuk didoakan dan dibakar secara sakral sebagai tanda terima kasih.";
    playFurin(1174.66);
    setTimeout(() => playFurin(1567.98), 260);
  });
  document.getElementById("btnOtakiReset").addEventListener("click", () => {
    otakiStage.classList.remove("burning");
    otakiStatus.textContent = "Tahun baru dimulai. Kamu bisa memilih omamori baru sesuai harapanmu tahun ini.";
    playTone(4, 0.38, 0.045);
  });

  /* === 8. Checklist Bahan & Stepper DIY Fisik === */
  document.querySelectorAll(".mat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const checked = btn.classList.toggle("checked");
      btn.querySelector(".mat-box").textContent = checked ? "✓" : "";
      playHyoshigi(checked ? 1.18 : 0.88);
    });
  });

  const diySteps = [
    {
      title: "Buat Pola & Potong Kain",
      body: "Gambar pola persegi panjang khas omamori dengan dua sudut atas sedikit miring pada karton tipis, lalu potong 2 lembar kain mengikuti pola dengan jarak sekitar 5 mm untuk tepi jahitan."
    },
    {
      title: "Jahit Keliling Kantong",
      body: "Tempelkan kedua lembar kain saling berhadapan (sisi motif di dalam). Jahit keliling sekitar 5 mm dari tepi dan sisakan bagian bawah terbuka agar kantong bisa dibalik."
    },
    {
      title: "Balik Kain & Masukkan Kertas Harapan",
      body: "Balik kantong sehingga sisi motif berada di luar, lalu rapikan sudut-sudutnya. Tulis doa atau harapan pada kertas kartu kecil, lipat rapi, lalu masukkan ke dalam kantong."
    },
    {
      title: "Tutup Bagian Bawah Kantong",
      body: "Lipat sisa tepi kain di bagian bawah ke arah dalam, lalu tutup dengan jahitan tangan yang rapi atau lem kain supaya kertas harapan tersimpan aman di dalam."
    },
    {
      title: "Ikat Simpul Tali Khas Omamori",
      body: "Bentuk simpul pita atau simpul tali tradisional nijūkanō di bagian depan atas, kencangkan dengan jahitan kecil atau ikatan simpul di bagian belakang, lalu ikat ujung atas tali sebagai gantungan."
    }
  ];

  let stepIdx = 0;
  const diyBtns = document.querySelectorAll(".diy-num-btn");
  const diyStage = document.getElementById("diyStage");
  const diyKicker = document.getElementById("diyKicker");
  const diyTitle = document.getElementById("diyTitle");
  const diyBody = document.getElementById("diyBody");
  const diyCount = document.getElementById("diyCount");

  function showStep(n) {
    stepIdx = (n + diySteps.length) % diySteps.length;
    const s = diySteps[stepIdx];
    diyKicker.textContent = "Langkah 0" + (stepIdx + 1) + " dari 0" + diySteps.length;
    diyTitle.textContent = s.title;
    diyBody.textContent = s.body;
    diyCount.textContent = "0" + (stepIdx + 1) + " / 0" + diySteps.length;
    diyBtns.forEach((b, i) => b.classList.toggle("active", i === stepIdx));
    diyStage.classList.remove("fade-swap");
    void diyStage.offsetWidth;
    diyStage.classList.add("fade-swap");
    playTone(stepIdx, 0.36, 0.048);
  }

  /* === 9. Glosarium Interaktif === */
  document.querySelectorAll(".gloss-card").forEach((card, idx) => {
    card.addEventListener("click", () => {
      const on = card.classList.toggle("active");
      if (on) {
        playKoto(idx + 1, 0.07);
      } else {
        playHyoshigi(0.95);
      }
    });
  });

  diyBtns.forEach((b) => b.addEventListener("click", () => showStep(Number(b.dataset.step))));
  document.getElementById("prevStep").addEventListener("click", () => showStep(stepIdx - 1));
  document.getElementById("nextStep").addEventListener("click", () => showStep(stepIdx + 1));

  /* === 10. Toast Notifikasi Halus === */
  const toastBox = document.getElementById("toastBox");
  let toastTimer = null;
  function showToast(msg) {
    if (!toastBox) return;
    toastBox.textContent = msg;
    toastBox.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastBox.classList.remove("show"), 2600);
  }

  /* === 11. Scroll-Spy Navigasi Aktif Otomatis === */
  const navLinks = Array.from(document.querySelectorAll('header nav a[href^="#"]'));
  const spySections = navLinks
    .map((a) => ({ link: a, sec: document.querySelector(a.getAttribute("href")) }))
    .filter((item) => item.sec);

  function updateScrollSpy() {
    const y = window.scrollY + 140;
    let current = null;
    for (const item of spySections) {
      if (item.sec.offsetTop <= y) current = item;
    }
    navLinks.forEach((a) => a.classList.toggle("nav-active", current && a === current.link));
  }
  window.addEventListener("scroll", () => window.requestAnimationFrame(updateScrollSpy), { passive: true });
  updateScrollSpy();

  /* === 12. 3D Tilt Super Smooth pada Kartu & Foto Utama === */
  if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    const tiltTargets = document.querySelectorAll(".hero-photo, .member-card");
    tiltTargets.forEach((el) => {
      el.classList.add("tilt-surface");
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -7;
        const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 7;
        el.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-3px)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* === 13. Undian Mini Omamori Hari Ini (Omikuji) === */
  const omikujiPool = [
    { kanji: "学業成就", name: "Gakugyō-jōju", fabric: "asagi", color: "Biru Asagi", msg: "Fokusmu lagi bagus hari ini. Cicil tugas atau materi ujian sedikit demi sedikit, nanti beres lebih cepat dari dugaanmu." },
    { kanji: "商売繁盛", name: "Shōbai-hanjō", fabric: "kuchinashi", color: "Kuning Emas", msg: "Ide kecil atau rencana sampingan yang kamu simpan diam-diam itu layak dicoba minggu ini. Mulailah dari langkah paling ringan." },
    { kanji: "縁結び", name: "En-musubi", fabric: "sakura", color: "Pink Sakura", msg: "Obrolan santai di kampus hari ini bisa membuka pertemanan atau kerja sama baru yang seru. Jangan sungkan menyapa duluan." },
    { kanji: "家内安全", name: "Kanai-anzen", fabric: "matcha", color: "Hijau Matcha", msg: "Sempatkan kirim kabar singkat ke rumah hari ini. Obrolan sederhana dengan keluarga sering jadi penyemangat paling ampuh." },
    { kanji: "安産", name: "Anzan", fabric: "sakura", color: "Putih / Pink", msg: "Hal baik memang butuh waktu untuk tumbuh. Pelan-pelan saja, proses panjang yang sedang kamu jalani sudah di jalur yang tepat." },
    { kanji: "交通安全", name: "Kōtsū-anzen", fabric: "asagi", color: "Biru / Merah", msg: "Saat berangkat atau pulang nanti, santai saja di jalan. Tidak perlu terburu-buru, yang penting sampai tujuan dengan selamat." },
    { kanji: "健康祈願", name: "Kenkō-kigan", fabric: "matcha", color: "Hijau Matcha", msg: "Jangan lupa minum air putih dan tidur cukup malam ini. Tugas kuliah bisa menyusul, tapi badanmu cuma satu." },
    { kanji: "病気平癒", name: "Byōki-heiyu", fabric: "fuji", color: "Ungu Fuji", msg: "Kalau badan atau pikiran lagi capek, beri izin dirimu untuk rehat sebentar tanpa merasa bersalah. Besok lanjut lagi dengan segar." },
    { kanji: "開運厄除", name: "Yakuyoke · Kaiun", fabric: "sumi", color: "Merah / Hitam", msg: "Anggap hari ini lembaran baru. Hal-hal ribet kemarin biarkan lewat, fokus saja pada satu hal baik yang bisa kamu selesaikan hari ini." }
  ];

  let lastOmikuji = null;
  const omikujiCyl = document.getElementById("omikujiCyl");
  const omikujiTag = document.getElementById("omikujiTag");
  const omikujiTitle = document.getElementById("omikujiTitle");
  const omikujiDesc = document.getElementById("omikujiDesc");
  const btnDrawOmikuji = document.getElementById("btnDrawOmikuji");
  const btnApplyOmikuji = document.getElementById("btnApplyOmikuji");

  btnDrawOmikuji.addEventListener("click", () => {
    omikujiCyl.classList.remove("shaking", "drawn");
    void omikujiCyl.offsetWidth;
    omikujiCyl.classList.add("shaking");
    btnDrawOmikuji.disabled = true;

    // Suara goyangan kotak kayu Hyoshigi
    playHyoshigi(0.92);
    setTimeout(() => playHyoshigi(1.08), 160);
    setTimeout(() => playHyoshigi(0.98), 320);

    setTimeout(() => {
      const picked = omikujiPool[Math.floor(Math.random() * omikujiPool.length)];
      lastOmikuji = picked;
      omikujiCyl.classList.remove("shaking");
      omikujiCyl.classList.add("drawn");
      omikujiTag.textContent = "Rekomendasi Untukmu · Warna " + picked.color;
      omikujiTitle.textContent = picked.kanji + " · " + picked.name;
      omikujiDesc.textContent = picked.msg;
      btnApplyOmikuji.style.display = "inline-block";
      btnDrawOmikuji.disabled = false;
      playFurin(1318.5);
      setTimeout(() => playKoto(5, 0.075), 140);
    }, 600);
  });

  btnApplyOmikuji.addEventListener("click", () => {
    if (!lastOmikuji) return;
    repState.fabric = lastOmikuji.fabric;
    repState.customFabricHex = null;
    repState.kanji = lastOmikuji.kanji;
    repState.blessingName = lastOmikuji.name;
    document.querySelectorAll("#fabricOpts .opt-chip").forEach((b) => b.classList.toggle("active", b.dataset.fabric === repState.fabric));
    customFabricWrap.classList.remove("active");
    for (let i = 0; i < repSelect.options.length; i++) {
      if (repSelect.options[i].value.startsWith(lastOmikuji.kanji)) {
        repSelect.selectedIndex = i;
        break;
      }
    }
    updateReplica();
    document.getElementById("rakit").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => { rotateReplica(360); playChord(); }, 450);
  });

  /* === 14. Unduh Replika Omamori sebagai Gambar PNG === */
  document.getElementById("btnRepDownload").addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext("2d");
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    // Latar kertas editorial
    ctx.fillStyle = isDark ? "#241914" : "#f3f7fb";
    ctx.fillRect(0, 0, 720, 960);

    // Bingkai garis rambut
    ctx.strokeStyle = isDark ? "#4a362c" : "#d4e0ec";
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, 648, 888);

    // Header teks
    ctx.fillStyle = isDark ? "#d98c5f" : "#3d6b99";
    ctx.font = "600 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OMAMORI NO SEKAI  ·  お守りの世界", 360, 96);

    // Gambar bentuk kantong omamori
    const fabBg = repState.customFabricHex || fabricMap[repState.fabric].bg;
    const px = 225, py = 165, pw = 270, ph = 385;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(px + pw * 0.22, py);
    ctx.lineTo(px + pw * 0.78, py);
    ctx.lineTo(px + pw, py + ph * 0.15);
    ctx.lineTo(px + pw, py + ph);
    ctx.lineTo(px, py + ph);
    ctx.lineTo(px, py + ph * 0.15);
    ctx.closePath();
    ctx.fillStyle = fabBg;
    ctx.fill();
    ctx.clip();

    // Pola halus di dalam kantong
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 1.5;
    if (repState.pattern === "seigaiha" || repState.pattern === "shippo") {
      for (let y = py; y < py + ph + 30; y += 26) {
        for (let x = px; x < px + pw + 30; x += 36) {
          ctx.beginPath();
          ctx.arc(x, y, 16, Math.PI, 0);
          ctx.stroke();
        }
      }
    } else if (repState.pattern === "bintik") {
      ctx.fillStyle = "rgba(255,255,255,0.34)";
      for (let y = py + 12; y < py + ph; y += 22) {
        for (let x = px + 12; x < px + pw; x += 22) {
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (repState.pattern !== "polos") {
      for (let d = -ph; d < pw + ph; d += 20) {
        ctx.beginPath();
        ctx.moveTo(px + d, py);
        ctx.lineTo(px + d + ph, py + ph);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Garis tepi kantong
    ctx.beginPath();
    ctx.moveTo(px + pw * 0.22, py);
    ctx.lineTo(px + pw * 0.78, py);
    ctx.lineTo(px + pw, py + ph * 0.15);
    ctx.lineTo(px + pw, py + ph);
    ctx.lineTo(px, py + ph);
    ctx.lineTo(px, py + ph * 0.15);
    ctx.closePath();
    ctx.strokeStyle = "rgba(37,34,31,0.22)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tali gantungan melengkung & simpul khas omamori
    ctx.strokeStyle = repState.cord;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(318, py + 24);
    ctx.bezierCurveTo(302, py - 48, 326, py - 74, 360, py - 74);
    ctx.bezierCurveTo(394, py - 74, 418, py - 48, 402, py + 24);
    ctx.stroke();

    // Simpul pita ganda di bagian atas kantong
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(338, py + 42);
    ctx.bezierCurveTo(302, py + 16, 294, py + 66, 334, py + 58);
    ctx.bezierCurveTo(346, py + 55, 354, py + 48, 360, py + 42);
    ctx.bezierCurveTo(366, py + 48, 374, py + 55, 386, py + 58);
    ctx.bezierCurveTo(426, py + 66, 418, py + 16, 382, py + 42);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(348, py + 54);
    ctx.lineTo(328, py + 82);
    ctx.moveTo(372, py + 54);
    ctx.lineTo(392, py + 82);
    ctx.stroke();
    ctx.fillStyle = repState.cord;
    ctx.beginPath();
    ctx.roundRect(346, py + 30, 28, 22, 8);
    ctx.fill();

    // Tag kertas kanji vertikal
    ctx.fillStyle = "rgba(252,251,248,0.94)";
    ctx.fillRect(318, py + 95, 84, 210);
    ctx.strokeStyle = "rgba(37,34,31,0.2)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(318, py + 95, 84, 210);

    ctx.fillStyle = "#25221f";
    ctx.font = "700 34px Georgia, serif";
    const chars = Array.from(repState.kanji);
    const startY = py + 145 + (4 - chars.length) * 16;
    chars.forEach((ch, idx) => {
      ctx.fillText(ch, 360, startY + idx * 44);
    });

    // Judul & Harapan Pribadi
    ctx.fillStyle = isDark ? "#f3e8dc" : "#1b2838";
    ctx.font = "600 28px Georgia, serif";
    ctx.fillText(repState.blessingName, 360, 622);

    ctx.fillStyle = isDark ? "#bfa998" : "#5a6d82";
    ctx.font = "500 18px sans-serif";
    ctx.fillText(repSummary.textContent, 360, 658);

    // Bungkus teks harapan (word wrap)
    const wish = (repWishInput.value.trim() || "Semoga tugas dan ujian semester ini lancar, nilai aman, dan tetap sempat istirahat.");
    ctx.fillStyle = isDark ? "#f3e8dc" : "#1b2838";
    ctx.font = "italic 22px Georgia, serif";
    const words = ("“" + wish + "”").split(" ");
    let line = "";
    let ly = 724;
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + " ";
      if (ctx.measureText(test).width > 540 && i > 0) {
        ctx.fillText(line.trim(), 360, ly);
        line = words[i] + " ";
        ly += 34;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), 360, ly);

    // Footer cap pameran
    ctx.fillStyle = isDark ? "#bfa998" : "#5a6d82";
    ctx.font = "500 15px sans-serif";
    ctx.fillText("Pameran Taishu Bunka · Stan Omamori no Sekai", 360, 882);

    const link = document.createElement("a");
    link.download = "omamori-no-sekai-replika.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    playChord();
    setTimeout(() => playFurin(1396.9), 200);
    showToast("Replika omamori (PNG) berhasil diunduh");
  });

  /* === 15. Bagikan Halaman === */
  document.getElementById("btnSharePage").addEventListener("click", () => {
    const shareUrl = window.location.href;
    const shareTitle = "Omamori no Sekai | Panduan Pameran Taishu Bunka";
    if (navigator.share) {
      navigator.share({ title: shareTitle, text: "Kenali sejarah, 9 jenis, dan rakit replika omamori di stan Omamori no Sekai!", url: shareUrl }).catch(() => {});
      playFurin(1318.5);
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        playHyoshigi(1.1);
        showToast("Tautan halaman berhasil disalin");
      }).catch(() => fallbackCopy(shareUrl));
    } else {
      fallbackCopy(shareUrl);
    }
  });

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    playHyoshigi(1.1);
    showToast("Tautan halaman berhasil disalin");
  }


  /* === 16. Pop-Up Editorial Interaktif === */
  const editorialModal = document.getElementById("editorialModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalStamp = document.getElementById("modalStamp");
  const modalKicker = document.getElementById("modalKicker");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalActions = document.getElementById("modalActions");

  function openModal({ stamp, kicker, title, desc, actions = [] }) {
    modalStamp.textContent = stamp || "福";
    modalKicker.textContent = kicker || "Omamori no Sekai";
    modalTitle.textContent = title || "";
    modalDesc.textContent = desc || "";
    modalActions.innerHTML = "";
    actions.forEach((act) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ctrl-btn";
      if (act.primary) {
        btn.style.background = "var(--sumi)";
        btn.style.color = "var(--kinari)";
        btn.style.borderColor = "var(--sumi)";
      }
      btn.textContent = act.label;
      btn.addEventListener("click", () => {
        if (act.onClick) act.onClick();
        closeModal();
      });
      modalActions.appendChild(btn);
    });
    editorialModal.classList.add("open");
  }

  function closeModal() {
    editorialModal.classList.remove("open");
  }

  modalCloseBtn.addEventListener("click", () => { playHyoshigi(0.9); closeModal(); });
  editorialModal.addEventListener("click", (e) => {
    if (e.target === editorialModal) { playHyoshigi(0.9); closeModal(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && editorialModal.classList.contains("open")) closeModal();
  });

  // Pop-Up saat selesai tarik undian Omikuji (terhubung ke btnDrawOmikuji)
  const origApplyBtn = document.getElementById("btnApplyOmikuji");
  btnDrawOmikuji.addEventListener("click", () => {
    setTimeout(() => {
      if (!lastOmikuji) return;
      openModal({
        stamp: lastOmikuji.kanji.slice(0, 1),
        kicker: "Hasil Undian Omikuji · Warna " + lastOmikuji.color,
        title: lastOmikuji.kanji + " · " + lastOmikuji.name,
        desc: lastOmikuji.msg,
        actions: [
          { label: "Rakit Omamori Ini →", primary: true, onClick: () => origApplyBtn.click() },
          { label: "Tutup", onClick: () => playHyoshigi(0.95) }
        ]
      });
    }, 720);
  });

  // Pop-Up pratinjau kartu dari Studio Rakit
  document.getElementById("btnRepPopup").addEventListener("click", () => {
    const wish = repWishInput.value.trim() || "Semoga tugas dan ujian semester ini lancar, nilai aman, dan tetap sempat istirahat.";
    playFurin(1318.5);
    openModal({
      stamp: repState.kanji.slice(0, 1),
      kicker: repSummary.textContent,
      title: repState.kanji + " · " + repState.blessingName,
      desc: "“" + wish + "”",
      actions: [
        { label: "Unduh sebagai PNG", primary: true, onClick: () => document.getElementById("btnRepDownload").click() },
        { label: "Kembali Merakit", onClick: () => playHyoshigi(0.95) }
      ]
    });
  });

  /* === 17. Mini Kuis Tebak Fakta Omamori === */
  const triviaList = [
    {
      q: "Mengapa dalam tradisi Jepang kantong omamori tidak boleh dibuka?",
      opts: [
        "Agar kain brokatnya tidak kotor",
        "Karena dipercaya membuat berkah dan perlindungannya keluar",
        "Karena di dalamnya tidak ada isinya"
      ],
      ans: 1,
      note: "Tepat sekali! Membuka kantongnya dipercaya melepaskan doa dan berkah yang sudah disucikan."
    },
    {
      q: "Apa nama upacara pembakaran suci untuk mengembalikan omamori setelah sekitar satu tahun?",
      opts: ["Otakiage", "Magatama", "Seigaiha"],
      ans: 0,
      note: "Benar! Otakiage adalah upacara mengembalikan omamori lama ke kuil sebagai ungkapan syukur."
    },
    {
      q: "Jika seorang mahasiswa sedang menghadapi ujian akhir, omamori mana yang paling tepat?",
      opts: ["Kōtsū-anzen", "Gakugyō-jōju", "Anzan"],
      ans: 1,
      note: "Betul! Gakugyō-jōju (学業成就) khusus untuk mendoakan kelancaran belajar dan ujian."
    }
  ];

  let triviaIdx = 0;
  let triviaScoreVal = 0;
  let triviaAnswered = false;
  const triviaQ = document.getElementById("triviaQ");
  const triviaOpts = document.getElementById("triviaOpts");
  const triviaFeedback = document.getElementById("triviaFeedback");
  const triviaCounter = document.getElementById("triviaCounter");
  const triviaScoreEl = document.getElementById("triviaScore");
  const btnNextTrivia = document.getElementById("btnNextTrivia");

  function renderTrivia() {
    const item = triviaList[triviaIdx];
    triviaAnswered = false;
    triviaCounter.textContent = "Pertanyaan 0" + (triviaIdx + 1) + " / 0" + triviaList.length;
    triviaQ.textContent = item.q;
    triviaFeedback.textContent = "";
    btnNextTrivia.textContent = triviaIdx === triviaList.length - 1 ? "Lihat Skor Akhir" : "Pertanyaan Berikutnya →";
    triviaOpts.innerHTML = "";

    item.opts.forEach((optText, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trivia-opt";
      btn.textContent = optText;
      btn.addEventListener("click", () => {
        if (triviaAnswered) return;
        triviaAnswered = true;
        const allBtns = triviaOpts.querySelectorAll(".trivia-opt");
        allBtns.forEach((b, bi) => {
          b.disabled = true;
          if (bi === item.ans) b.classList.add("correct");
        });
        if (i === item.ans) {
          triviaScoreVal += 1;
          triviaScoreEl.textContent = "Skor: " + triviaScoreVal + " / " + triviaList.length;
          triviaFeedback.textContent = item.note;
          playKoto(6, 0.08);
          setTimeout(() => playFurin(1396.9), 120);
        } else {
          btn.classList.add("wrong");
          triviaFeedback.textContent = "Belum tepat. " + item.note;
          playHyoshigi(0.82);
        }
      });
      triviaOpts.appendChild(btn);
    });
  }

  btnNextTrivia.addEventListener("click", () => {
    if (triviaIdx === triviaList.length - 1) {
      playChord();
      openModal({
        stamp: triviaScoreVal === triviaList.length ? "大吉" : "吉",
        kicker: "Hasil Kuis Singkat Omamori",
        title: "Skor Kamu: " + triviaScoreVal + " dari " + triviaList.length,
        desc: triviaScoreVal === triviaList.length
          ? "Luar biasa! Kamu sudah memahami sejarah, etika, dan jenis omamori dengan sangat baik."
          : "Terima kasih sudah mencoba kuis singkat kami! Kamu bisa mengulang kuis atau langsung merakit replika omamori.",
        actions: [
          { label: "Ulangi Kuis", primary: true, onClick: () => { triviaIdx = 0; triviaScoreVal = 0; triviaScoreEl.textContent = "Skor: 0 / 3"; renderTrivia(); } },
          { label: "Tutup" }
        ]
      });
    } else {
      triviaIdx += 1;
      renderTrivia();
      playKoto(triviaIdx + 2, 0.065);
    }
  });

  renderTrivia();


  /* === 18. Laci Menu Navigasi Minimalis untuk HP & Tablet === */
  const headerEl = document.querySelector("header");
  const menuToggle = document.getElementById("menuToggle");
  const menuIconSvg = document.getElementById("menuIconSvg");
  const burgerPath = '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>';
  const closePath = '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>';
  if (menuToggle && headerEl) {
    menuToggle.addEventListener("click", () => {
      const isOpen = headerEl.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      if (menuIconSvg) menuIconSvg.innerHTML = isOpen ? closePath : burgerPath;
      playHyoshigi(isOpen ? 1.12 : 0.92);
    });
    document.querySelectorAll("header nav a").forEach((a) => {
      a.addEventListener("click", () => {
        if (headerEl.classList.contains("menu-open")) {
          headerEl.classList.remove("menu-open");
          menuToggle.setAttribute("aria-expanded", "false");
          if (menuIconSvg) menuIconSvg.innerHTML = burgerPath;
        }
      });
    });
  }


  /* === 19. Anatomi Omamori Interaktif (Bagian 01 Filosofi) === */
  const anatomyParts = [
    {
      kicker: "01 · Etimologi & Simpul",
      title: "Berasal dari Kata “Mamoru” (守る)",
      desc: "Nama omamori (御守 / お守り) terbentuk dari awalan hormat o- dan kata kerja mamoru yang berarti melindungi atau menjaga. Simpul tali nijūkanō di bagian atasnya menjaga agar doa di dalam tetap terikat rapi.",
      note: "Di Jepang, omamori dibawa dekat dengan aktivitas harian sebagai pengingat sunyi akan harapan yang sedang diusahakan.",
      kanji: "守"
    },
    {
      kicker: "02 · Struktur Inti",
      title: "Kertas atau Kayu Doa (Ofuda / Kifuda)",
      desc: "Di balik kantong kain brokatnya, tersimpan potongan kayu tipis (kifuda) atau lembaran kertas doa suci (ofuda / shinsatsu) yang telah diberkati oleh pendeta Shinto atau biksu Buddha.",
      note: "Inti berkahnya terletak pada lembaran doa di dalam, sedangkan kain brokat di luar berfungsi sebagai wadah pelindungnya.",
      kanji: "札"
    },
    {
      kicker: "03 · Lintas Tradisi",
      title: "Hadir di Kuil Shinto & Kuil Buddha",
      desc: "Omamori dapat ditemui baik di kuil Shinto (jinja) maupun kuil Buddha (otera). Hal ini mencerminkan sejarah panjang pertemuan dan perpaduan kedua tradisi spiritual tersebut di Jepang.",
      note: "Setiap kuil biasanya memiliki motif kain, warna, dan spesialisasi doa khas yang membedakannya dari kuil lain.",
      kanji: "社"
    }
  ];

  const anatomyPins = document.querySelectorAll(".anatomy-pin");
  const anatomyTabs = document.querySelectorAll(".anatomy-tab");
  const anatomyBody = document.getElementById("anatomyBody");
  const anatomyKicker = document.getElementById("anatomyKicker");
  const anatomyTitle = document.getElementById("anatomyTitle");
  const anatomyDesc = document.getElementById("anatomyDesc");
  const anatomyNote = document.getElementById("anatomyNote");
  const anatomyWatermark = document.getElementById("anatomyWatermark");

  function selectAnatomyPart(idx) {
    const p = anatomyParts[idx];
    if (!p) return;
    anatomyKicker.textContent = p.kicker;
    anatomyTitle.textContent = p.title;
    anatomyDesc.textContent = p.desc;
    anatomyNote.textContent = p.note;
    anatomyWatermark.textContent = p.kanji;
    anatomyPins.forEach((el) => el.classList.toggle("active", Number(el.dataset.part) === idx));
    anatomyTabs.forEach((el) => el.classList.toggle("active", Number(el.dataset.part) === idx));
    anatomyBody.classList.remove("fade-swap");
    void anatomyBody.offsetWidth;
    anatomyBody.classList.add("fade-swap");
    playKoto(idx + 3, 0.075);
  }

  anatomyPins.forEach((pin) => pin.addEventListener("click", () => selectAnatomyPart(Number(pin.dataset.part))));
  anatomyTabs.forEach((tab) => tab.addEventListener("click", () => selectAnatomyPart(Number(tab.dataset.part))));

})();
