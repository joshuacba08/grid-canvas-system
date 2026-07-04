const copyButtons = document.querySelectorAll<HTMLButtonElement>("[data-copy-target]");

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const targetId = button.dataset.copyTarget;

    if (targetId === undefined) {
      return;
    }

    const target = document.getElementById(targetId);
    const code = target?.querySelector("code");
    const text = code?.textContent ?? target?.innerText ?? "";
    const defaultTooltip = button.dataset.tooltip ?? "Copy";
    const defaultLabel = button.getAttribute("aria-label") ?? "Copy";

    if (text.length === 0) {
      return;
    }

    try {
      await copyText(text);
      button.classList.add("is-copied");
      button.dataset.tooltip = "Copied";
      button.setAttribute("aria-label", "Code copied");
    } catch {
      button.dataset.tooltip = "Copy unavailable";
      button.setAttribute("aria-label", "Copy unavailable");
    }

    window.setTimeout(() => {
      button.classList.remove("is-copied");
      button.dataset.tooltip = defaultTooltip;
      button.setAttribute("aria-label", defaultLabel);
    }, 1600);
  });
});

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard !== undefined && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  const execCommand = Reflect.get(document, "execCommand");

  if (typeof execCommand !== "function") {
    throw new Error("Clipboard API is unavailable");
  }

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  const copied = execCommand.call(document, "copy") === true;

  textarea.remove();

  if (!copied) {
    throw new Error("Copy command failed");
  }
}
