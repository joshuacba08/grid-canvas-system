const menuButton = document.querySelector<HTMLButtonElement>("[data-docs-menu]");
const sidebar = document.querySelector<HTMLElement>("[data-docs-sidebar]");
const search = document.querySelector<HTMLInputElement>("[data-docs-search]");
const emptyState = document.querySelector<HTMLElement>("[data-docs-empty]");
const navLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>("[data-docs-link]"),
);
const navGroups = Array.from(
  document.querySelectorAll<HTMLElement>("[data-docs-group]"),
);

function setMenu(open: boolean): void {
  menuButton?.setAttribute("aria-expanded", String(open));

  if (sidebar !== null) {
    sidebar.dataset.open = String(open);
  }
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

search?.addEventListener("input", () => {
  const query = search.value.trim().toLowerCase();
  let visibleLinks = 0;

  navGroups.forEach((group) => {
    const groupLinks = Array.from(
      group.querySelectorAll<HTMLAnchorElement>("[data-docs-link]"),
    );
    let visibleInGroup = 0;

    groupLinks.forEach((link) => {
      const matches = link.textContent?.toLowerCase().includes(query) ?? false;

      link.hidden = !matches;
      visibleInGroup += matches ? 1 : 0;
      visibleLinks += matches ? 1 : 0;
    });

    group.hidden = visibleInGroup === 0;
  });

  if (emptyState !== null) {
    emptyState.hidden = visibleLinks > 0;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== search) {
    event.preventDefault();
    search?.focus();
  }

  if (event.key === "Escape") {
    setMenu(false);
    search?.blur();
  }
});

const sectionLinks = navLinks.filter((link) => link.hash.length > 0);
const sections = sectionLinks
  .map((link) => document.querySelector<HTMLElement>(link.hash))
  .filter((section): section is HTMLElement => section !== null);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

    if (visible === undefined) {
      return;
    }

    sectionLinks.forEach((link) => {
      link.classList.toggle("is-active", link.hash === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-15% 0px -72%" },
);

sections.forEach((section) => sectionObserver.observe(section));
