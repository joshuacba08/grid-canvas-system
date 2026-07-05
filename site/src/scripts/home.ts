const menuButton = document.querySelector<HTMLButtonElement>("[data-home-menu]");
const nav = document.querySelector<HTMLElement>("[data-home-nav]");
const localeSelect = document.querySelector<HTMLSelectElement>(
  "[data-home-locale-select]",
);
const navLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>("[data-home-nav-link]"),
);
const topbar = document.querySelector<HTMLElement>(".topbar");
const mobileQuery = window.matchMedia("(max-width: 920px)");

function setMenu(open: boolean): void {
  menuButton?.setAttribute("aria-expanded", String(open));

  if (nav !== null) {
    nav.dataset.open = String(open);
  }
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

localeSelect?.addEventListener("change", () => {
  const nextPath = localeSelect.value;

  if (nextPath.length === 0 || nextPath === window.location.pathname) {
    return;
  }

  window.location.assign(nextPath);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
    localeSelect?.blur();
  }
});

document.addEventListener("click", (event) => {
  if (
    menuButton?.getAttribute("aria-expanded") !== "true" ||
    topbar === null ||
    !(event.target instanceof Node)
  ) {
    return;
  }

  if (!topbar.contains(event.target)) {
    setMenu(false);
  }
});

function syncMenuToViewport(): void {
  if (!mobileQuery.matches) {
    setMenu(false);
  }
}

syncMenuToViewport();

mobileQuery.addEventListener("change", syncMenuToViewport);

export {};
