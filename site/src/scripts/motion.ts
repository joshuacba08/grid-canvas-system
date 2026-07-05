import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const motion = gsap.matchMedia();
let motionStarted = false;

function startHomeMotion(): void {
  if (motionStarted) {
    return;
  }

  if (document.body === null) {
    document.addEventListener("DOMContentLoaded", startHomeMotion, { once: true });

    return;
  }

  motionStarted = true;

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

    gsap.utils.toArray<HTMLElement>("[data-home-terminal]").forEach((panel) => {
      const rows = Array.from(
        panel.querySelectorAll<HTMLElement>("[data-terminal-row]"),
      );
      const phase = panel.querySelector<HTMLElement>("[data-terminal-phase]");
      const pendingLabel = panel.dataset.terminalPendingLabel ?? "Queued";
      const workingLabel = panel.dataset.terminalWorkingLabel ?? "Working";
      const doneLabel = panel.dataset.terminalDoneLabel ?? "Done";
      const idlePhase = panel.dataset.terminalPhaseIdle ?? pendingLabel;
      const donePhase = panel.dataset.terminalPhaseDone ?? doneLabel;
      const timeline = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 0.45,
      });

      function setRowState(
        row: HTMLElement,
        state: "done" | "pending" | "working",
      ): void {
        row.dataset.state = state;

        const status = row.querySelector<HTMLElement>("[data-terminal-status]");

        if (status === null) {
          return;
        }

        status.textContent =
          state === "working"
            ? workingLabel
            : state === "done"
              ? doneLabel
              : pendingLabel;
      }

      function resetRows(): void {
        rows.forEach((row) => {
          setRowState(row, "pending");
          gsap.set(row, {
            backgroundColor: "rgba(77, 169, 255, 0.04)",
            borderColor: "rgba(77, 169, 255, 0.16)",
            boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
            scale: 1,
            y: 0,
          });
        });

        if (phase !== null) {
          phase.textContent = idlePhase;
        }
      }

      resetRows();

      rows.forEach((row, index) => {
        const status = row.querySelector<HTMLElement>("[data-terminal-status]");

        timeline
          .call(() => {
            rows.forEach((otherRow, otherIndex) => {
              setRowState(otherRow, otherIndex < index ? "done" : "pending");
            });
            setRowState(row, "working");

            if (phase !== null) {
              phase.textContent = workingLabel;
            }
          })
          .to(
            row,
            {
              backgroundColor: "rgba(0, 212, 59, 0.1)",
              borderColor: "rgba(0, 212, 59, 0.38)",
              boxShadow: "0 18px 44px rgba(0, 0, 0, 0.24)",
              duration: 0.28,
              ease: "power2.out",
              scale: 1.01,
              y: -4,
            },
            index === 0 ? 0 : ">",
          );

        if (status !== null) {
          timeline.to(
            status,
            {
              duration: 0.28,
              ease: "power2.out",
              scale: 1.05,
            },
            "<",
          );
        }

        timeline
          .to({}, { duration: 0.55 })
          .call(() => {
            setRowState(row, "done");

            if (phase !== null) {
              phase.textContent = index === rows.length - 1 ? donePhase : doneLabel;
            }
          })
          .to(row, {
            backgroundColor: "rgba(77, 169, 255, 0.05)",
            borderColor: "rgba(77, 169, 255, 0.26)",
            boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
            duration: 0.3,
            ease: "power2.inOut",
            scale: 1,
            y: 0,
          });

        if (status !== null) {
          timeline.to(
            status,
            {
              duration: 0.24,
              ease: "power2.inOut",
              scale: 1,
            },
            "<",
          );
        }
      });

      timeline.call(resetRows);

      ScrollTrigger.create({
        onEnter: () => timeline.play(),
        onEnterBack: () => timeline.play(),
        onLeave: () => timeline.pause(),
        onLeaveBack: () => timeline.pause(),
        start: "top 84%",
        trigger: panel,
      });

      gsap.from(panel, {
        duration: 0.74,
        ease: "power3.out",
        opacity: 0,
        scrollTrigger: {
          once: true,
          start: "top 86%",
          trigger: panel,
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
}

if (
  document.body.classList.contains("grid-loader-active") &&
  document.documentElement.dataset.pageLoader !== "complete"
) {
  document.addEventListener("grid-loader:complete", startHomeMotion, { once: true });
} else {
  startHomeMotion();
}
