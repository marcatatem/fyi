interface BuildInfo {
  revision: string;
  took: number;
}

document.addEventListener("DOMContentLoaded", () => {
  // show grid if needed
  const url = new URL(window.location.href);
  if (url.searchParams.has("grid")) {
    document.body.classList.add("grid");
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div class="layout"><div class="canvas"><div class="columns"></div></div></div>',
    );
  }
  // attach events
  document.querySelector("header .open.menu")?.addEventListener(
    "click",
    function (e) {
      e.preventDefault();
      const nav = document.querySelector("header nav")!;
      nav.classList.add("visible");
      nav.classList.add("open");
    },
  );
  document.querySelector("header .close.menu")?.addEventListener(
    "click",
    function (e) {
      e.preventDefault();
      const nav = document.querySelector("header nav")!;
      nav.classList.remove("open");
      nav.addEventListener("transitionend", function handler() {
        requestAnimationFrame(() => {
          nav.classList.remove("visible");
        });
        // Remove the event listener after it has executed
        nav.removeEventListener("transitionend", handler);
      });
    },
  );
  document.querySelector(".back-to-top a")?.addEventListener(
    "click",
    function (e) {
      e.preventDefault();
      window.scrollTo(0, 0);
    },
  );
  // header
  addEventListener("scroll", function (_) {
    const trigger = document.querySelector("#trigger")!;
    const header = document.querySelector("header")!;
    const triggerPosition = trigger.getBoundingClientRect().top + window.scrollY;
    const headerHeight = header.offsetHeight;
    if (window.scrollY > triggerPosition - headerHeight) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
  // add scroll margin to sections
  document.querySelectorAll("section").forEach((section) => {
    const headerHeight = document.querySelector("header")!.offsetHeight;
    section.style.scrollMarginTop = `${headerHeight}px`;
  });
  // add smooth transitions to navigation links
  document.querySelectorAll(".smooth").forEach((smooth) => {
    smooth.addEventListener("click", function (e) {
      e.preventDefault();
      const id = (e.currentTarget as HTMLElement).getAttribute("href")!;
      const headerNav = document.querySelector("header nav")!;
      if (headerNav.classList.contains("open")) {
        headerNav.classList.remove("open");
        headerNav.addEventListener("transitionend", function handler() {
          headerNav.classList.remove("visible");
          requestAnimationFrame(() => {
            setTimeout(() => {
              scrollTo(id);
            }, 150);
          });
          headerNav.removeEventListener("transitionend", handler);
        });
      } else {
        scrollTo(id);
      }
    });
  });
  // transition for lazy loaded images
  document.querySelectorAll("figure img").forEach((img) => {
    img.addEventListener("load", function (_) {
      img.classList.add("loaded");
    });
  });
});

onload = async () => {
  // update revision and build time
  if ("fetch" in window) {
    const response = await fetch("/build-info.json");
    const info: BuildInfo = await response.json();
    const originalLabel = document.querySelector(".build-info")?.innerHTML;
    if (originalLabel) {
      let label = originalLabel;
      const matches = originalLabel.matchAll(/\[([\w]+)\]/g);
      for (const match of matches) {
        const value = info[match[1] as keyof BuildInfo];
        label = label.replace(match[0], String(value));
      }
      document.querySelectorAll(".build-info").forEach((el) => {
        el.innerHTML = label;
      });
    }
  } else {
    document.querySelectorAll(".build-info").forEach((el) => {
      el.innerHTML = "Fetch API not supported.";
    });
  }
};

function scrollTo(id: string, smooth = true) {
  document.querySelector(id)?.scrollIntoView({
    behavior: smooth ? "smooth" : undefined,
    block: "start",
    inline: "nearest",
  });
}
