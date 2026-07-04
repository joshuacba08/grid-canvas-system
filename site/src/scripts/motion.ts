import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const motion = gsap.matchMedia();

motion.add("(prefers-reduced-motion: no-preference)", () => {
  const heroTimeline = gsap.timeline({
    defaults: {
      duration: 0.72,
      ease: "power3.out",
    },
  });

  heroTimeline
    .from(".topbar", {
      opacity: 0,
      y: -24,
    })
    .from(
      ".eyebrow",
      {
        opacity: 0,
        y: 18,
      },
      "-=0.35",
    )
    .from(
      ".hero h1 span",
      {
        opacity: 0,
        stagger: 0.08,
        yPercent: 70,
      },
      "-=0.48",
    )
    .from(
      [".hero-copy", ".hero-subcopy", ".hero-actions"],
      {
        opacity: 0,
        stagger: 0.08,
        y: 24,
      },
      "-=0.42",
    )
    .from(
      ".hero-panel",
      {
        opacity: 0,
        duration: 0.9,
        ease: "sine.out",
        force3D: true,
        x: 48,
      },
      0.38,
    )
    .from(
      ".peek-strip span",
      {
        opacity: 0,
        stagger: 0.06,
        y: 12,
      },
      "-=0.35",
    );

  gsap.to(".brand-mark", {
    duration: 8,
    ease: "none",
    repeat: -1,
    rotation: 360,
    transformOrigin: "50% 50%",
  });

  const revealGroups = [
    ".capability-grid",
    ".doc-list",
    ".code-wall",
    ".examples",
    ".release-list",
  ];

  revealGroups.forEach((selector) => {
    const group = document.querySelector<HTMLElement>(selector);

    if (group === null) {
      return;
    }

    gsap.from(Array.from(group.children), {
      duration: 0.68,
      ease: "power2.out",
      opacity: 0,
      scrollTrigger: {
        once: true,
        start: "top 84%",
        trigger: group,
      },
      stagger: 0.08,
      y: 34,
    });
  });

  gsap.utils
    .toArray<HTMLElement>(".section-header, .docs-band > div:first-child")
    .forEach((header) => {
      gsap.from(header, {
        duration: 0.72,
        ease: "power3.out",
        opacity: 0,
        scrollTrigger: {
          once: true,
          start: "top 86%",
          trigger: header,
        },
        y: 28,
      });
    });

  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
  });

  return () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };
});
