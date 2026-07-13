const checks = Array.from(
  document.querySelectorAll<HTMLInputElement>("[data-tutorial-check]"),
);
const progress = document.querySelector<HTMLElement>("[data-tutorial-progress]");
const progressBar = document.querySelector<HTMLElement>("[data-tutorial-progress-bar]");
const storageKey = `grid-canvas-system:tutorial-progress:${window.location.pathname}`;

function readCompleted(): Set<string> {
  try {
    const value = window.localStorage.getItem(storageKey);
    const parsed = value === null ? [] : (JSON.parse(value) as string[]);
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function writeCompleted(completed: Set<string>): void {
  window.localStorage.setItem(storageKey, JSON.stringify([...completed]));
}

function updateProgress(completed: Set<string>): void {
  const done = checks.filter((check) => completed.has(check.id)).length;
  const percent = checks.length === 0 ? 0 : Math.round((done / checks.length) * 100);

  if (progress !== null) {
    progress.textContent = `${done} de ${checks.length} tareas completadas`;
  }

  if (progressBar !== null) {
    progressBar.style.setProperty("--tutorial-progress", `${percent}%`);
    progressBar.setAttribute("aria-valuenow", String(percent));
  }
}

const completed = readCompleted();

checks.forEach((check) => {
  check.checked = completed.has(check.id);

  check.addEventListener("change", () => {
    if (check.checked) {
      completed.add(check.id);
    } else {
      completed.delete(check.id);
    }

    writeCompleted(completed);
    updateProgress(completed);
  });
});

updateProgress(completed);

export {};
