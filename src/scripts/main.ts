import textBalancer from "./vendor/text-balancer";
import FontFaceObserver from "./vendor/fontfaceobserver.standalone";

document.addEventListener("DOMContentLoaded", () => {
  // Reflow text small screens
  if (window.innerWidth <= 414) {
    const observer = new FontFaceObserver("Iosevka Custom Web");
    observer.load().then(() => {
      textBalancer.balanceText(".content p");
    });
  }
  // show grid if needed
  const url = new URL(window.location.href);
  if (url.searchParams.has("grid")) {
    document.body.classList.add("grid");
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div class="layout"><div class="canvas"><div class="columns"></div></div></div>',
    );
  }
  // simple obfuscation
  const pigeon = document.querySelector(".contact .pigeon")!;
  const value = pigeon.innerHTML;
  const reformulated = value
    .split("")
    .reverse()
    .join("")
    .split(";")
    .reverse()
    .join(String.fromCharCode(64));
  let prefix = pigeon.getAttribute("href")!.split(":")[0];
  document.querySelectorAll(".contact .pigeon").forEach((pigeon) => {
    pigeon.setAttribute("href", `${prefix}:${reformulated}`);
    pigeon.innerHTML = value.split(";").reverse().join("@");
  });
  const mosquito = document.querySelector(".contact .mosquito")!;
  const groups = mosquito.innerHTML.split(" ");
  const lemongrass = [
    groups[0],
    groups[1].split("").reverse().join(""),
    groups[2].split("").reverse().join(""),
  ];
  mosquito.innerHTML = lemongrass.join(" ");
  prefix = mosquito.getAttribute("href")!.split(":")[0];
  mosquito.setAttribute(
    "href",
    `${prefix}:1-${lemongrass.join("-").replace(/\(|\)/g, "")}`,
  );
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
      nav.addEventListener("transitionend", function handler(e) {
        window.requestAnimationFrame(() => {
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
  window.addEventListener("scroll", function (_) {
    const trigger = document.querySelector("#trigger")!;
    const header = document.querySelector("header")!;
    const triggerPosition = trigger.getBoundingClientRect().top +
      window.pageYOffset;
    const headerHeight = header.offsetHeight;

    if (window.pageYOffset > triggerPosition - headerHeight) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  document.querySelectorAll("section").forEach((section) => {
    const headerHeight = document.querySelector("header")!.offsetHeight;
    section.style.scrollMarginTop = `${headerHeight}px`;
  });

  document.querySelectorAll(".smooth").forEach((smooth) => {
    smooth.addEventListener("click", function (e) {
      e.preventDefault();
      const id = (e.currentTarget as HTMLElement).getAttribute("href");
      const headerNav = document.querySelector("header nav")!;
      if (headerNav.classList.contains("open")) {
        headerNav.classList.remove("open");
        headerNav.addEventListener("transitionend", function handler(e) {
          headerNav.classList.remove("visible");
          window.requestAnimationFrame(() => {
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

  function scrollTo(id) {
    const target = document.querySelector(id);
    window.scrollTo({
      top: target.offsetTop,
      behavior: "smooth",
    });
  }
});

function scrollTo(id: string, smooth = true) {
  document.querySelector(id)?.scrollIntoView({
    behavior: smooth ? "smooth" : undefined,
    block: "start",
    inline: "nearest",
  });
}
