(function () {
  const ASSET_VER = "9";

  function withVer(url) {
    return url + (url.includes("?") ? "&" : "?") + "v=" + ASSET_VER;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = withVer(src);
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  async function loadAllSections() {
    const slots = Array.from(document.querySelectorAll("[data-section]"));
    try {
      const htmlList = await Promise.all(
        slots.map(async (slot) => {
          const url = slot.getAttribute("data-section");
          const res = await fetch(withVer(url), { cache: "no-store" });
          if (!res.ok) throw new Error("Gagal memuat " + url + " (" + res.status + ")");
          return res.text();
        })
      );

      slots.forEach((slot, idx) => {
        slot.outerHTML = htmlList[idx];
      });

      await loadScript("js/quiz-bank.js");
      await loadScript("js/main.js");
      await loadScript("js/scroll-reveal.js");
    } catch (err) {
      console.error("Gagal memuat section halaman:", err);
      const main = document.getElementById("beranda");
      if (main && !main.querySelector("section")) {
        main.innerHTML =
          '<div style="padding:40px 20px;text-align:center;color:var(--hai);">' +
          "<p>Halaman ini memuat potongan folder <code>sections/</code>.</p>" +
          "<p style='margin-top:8px;font-size:0.86rem;'>Buka lewat <strong>GitHub Pages</strong> atau <strong>Live Server</strong> agar semua bagian tampil penuh.</p>" +
          "</div>";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAllSections);
  } else {
    loadAllSections();
  }
})();
