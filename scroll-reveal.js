(function () {
  function initRepeatReveal() {
    const targets = document.querySelectorAll(".reveal, .reveal-item");
    if (!targets.length) return;

    // 1. Nyalakan animasi setiap kali elemen masuk layar
    const enterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    // 2. Reset animasi setelah elemen jauh keluar layar (buffer 80px biar tidak kedip)
    const resetObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            const el = entry.target;
            const rect = el.getBoundingClientRect();

            if (rect.bottom < 0) {
              el.classList.add("from-top");
            } else {
              el.classList.remove("from-top");
            }

            el.classList.remove("visible");
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "80px 0px 80px 0px",
      }
    );

    targets.forEach((el) => {
      enterObserver.observe(el);
      resetObserver.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRepeatReveal);
  } else {
    initRepeatReveal();
  }
})();
