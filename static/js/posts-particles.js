(function () {
  "use strict";

  if (
    !document.body.classList.contains("post-pages") ||
    !document.body.classList.contains("list")
  ) {
    return;
  }

  function isDarkTheme() {
    var theme = document.documentElement.dataset.theme;
    if (theme === "dark") {
      return true;
    }
    if (theme === "light") {
      return false;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function getConfig(dark) {
    if (dark) {
      return {
        particles: {
          number: {
            value: 55,
            density: { enable: true, value_area: 750 },
          },
          color: {
            value: ["#FFFFFF", "#E8E2D5", "#D4AF37", "#A8D4F0", "#B8E0D2", "#F5E6C8"],
          },
          shape: { type: "circle" },
          opacity: {
            value: 0.72,
            random: true,
            anim: { enable: true, speed: 0.35, opacity_min: 0.35, sync: false },
          },
          size: {
            value: 2.8,
            random: true,
            anim: { enable: false },
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#E8E2D5",
            opacity: 0.42,
            width: 1.6,
          },
          move: {
            enable: true,
            speed: 0.58,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "window",
          events: {
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: false },
            resize: true,
          },
          modes: {
            grab: {
              distance: 160,
              line_linked: { opacity: 0.85 },
            },
          },
        },
        retina_detect: true,
      };
    }

    return {
      particles: {
        number: {
          value: 55,
          density: { enable: true, value_area: 750 },
        },
        color: {
          value: ["#C0392B", "#1B4F72", "#148F77", "#D4AF37", "#1E3F66", "#C23B22"],
        },
        shape: { type: "circle" },
        opacity: {
          value: 0.62,
          random: true,
          anim: { enable: true, speed: 0.35, opacity_min: 0.28, sync: false },
        },
        size: {
          value: 2.8,
          random: true,
          anim: { enable: false },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#1B4F72",
          opacity: 0.36,
          width: 1.5,
        },
        move: {
          enable: true,
          speed: 0.58,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
      },
      interactivity: {
        detect_on: "window",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: false },
          resize: true,
        },
        modes: {
          grab: {
            distance: 160,
            line_linked: { opacity: 0.65 },
          },
        },
      },
      retina_detect: true,
    };
  }

  function destroyParticles() {
    if (window.pJSDom && window.pJSDom.length > 0) {
      try {
        window.pJSDom[0].pJS.fn.vendors.destroypJS();
      } catch (e) {
        /* ignore */
      }
      window.pJSDom = [];
    }
    var el = document.getElementById("particles-js");
    if (el) {
      el.innerHTML = "";
    }
  }

  function init() {
    if (typeof window.particlesJS !== "function") {
      return;
    }
    if (!document.getElementById("particles-js")) {
      return;
    }

    destroyParticles();
    document.documentElement.classList.toggle("post-particles-dark", isDarkTheme());
    window.particlesJS("particles-js", getConfig(isDarkTheme()));
  }

  function watchThemeToggle() {
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        setTimeout(init, 80);
      });
    }

    var observer = new MutationObserver(function () {
      init();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  function boot() {
    init();
    watchThemeToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
