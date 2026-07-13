import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js";
import "monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching.js";
import "monaco-editor/esm/vs/editor/contrib/comment/browser/comment.js";
import "monaco-editor/esm/vs/editor/contrib/find/browser/findController.js";
import "monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js";
import "monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

import {
  getPlaygroundExample,
  playgroundExamples,
  type PlaygroundExampleId,
} from "../data/playgroundExamples";
import {
  createPlaygroundLaunchUrl,
  PAGE_PLAYGROUND_EXAMPLE_ID,
  readPlaygroundLaunch,
  type PlaygroundLaunch,
} from "../data/playgroundLaunch";

type FileName = "javascript" | "html";

interface ExampleFiles {
  javascript: string;
  html: string;
}

interface SavedPlaygroundState {
  selectedExample?: string;
  activeFile?: FileName;
  files?: Record<string, Partial<ExampleFiles>>;
}

const monacoScope = self as typeof self & {
  MonacoEnvironment?: {
    getWorker(moduleId: string, label: string): Worker;
  };
};

monacoScope.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

const STORAGE_KEY = "grid-canvas-system:playground:v3";
const editorHost = document.querySelector<HTMLElement>("#monaco-editor");
const loadingLabel = document.querySelector<HTMLElement>("[data-editor-loading]");
const templateSelect = document.querySelector<HTMLSelectElement>(
  "[data-template-select]",
);
const runButton = document.querySelector<HTMLButtonElement>("[data-run-code]");
const resetButton = document.querySelector<HTMLButtonElement>("[data-reset-editor]");
const copyButton = document.querySelector<HTMLButtonElement>("[data-copy-editor]");
const previewFrame = document.querySelector<HTMLIFrameElement>("[data-preview-frame]");
const status = document.querySelector<HTMLElement>("[data-playground-status]");
const statusLabel = status?.querySelector<HTMLElement>("b") ?? null;
const consoleOutput = document.querySelector<HTMLOutputElement>(
  "[data-console-output]",
);
const languageLabel = document.querySelector<HTMLElement>("[data-language-label]");
const description = document.querySelector<HTMLElement>("[data-example-description]");
const exampleCount = document.querySelector<HTMLElement>("[data-example-count]");
const pageExampleOption = document.querySelector<HTMLOptionElement>(
  "[data-page-example-option]",
);
const pageExampleButton = document.querySelector<HTMLButtonElement>(
  "[data-page-example-button]",
);
const pageExampleTitle = document.querySelector<HTMLElement>(
  "[data-page-example-title]",
);
const exampleButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-example-id]"),
);
const fileTabs = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-file-tab]"),
);
const panelTabs = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-panel-tab]"),
);
const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-panel]"));

const filesByExample = Object.fromEntries(
  playgroundExamples.map((example) => [
    example.id,
    { javascript: example.javascript, html: example.html },
  ]),
) as Record<string, ExampleFiles>;

let pageLaunch: PlaygroundLaunch | null = null;
let selectedExample: string = playgroundExamples[0].id;
let activeFile: FileName = "javascript";
let pendingFiles: ExampleFiles = { ...filesByExample[selectedExample] };
let runId = 0;
let saveTimer = 0;

function isExampleId(value: string): value is PlaygroundExampleId {
  return playgroundExamples.some((example) => example.id === value);
}

function isAvailableExample(value: string): boolean {
  return (
    isExampleId(value) || (value === PAGE_PLAYGROUND_EXAMPLE_ID && pageLaunch !== null)
  );
}

function loadSavedState(): SavedPlaygroundState | null {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    ) as SavedPlaygroundState | null;
  } catch {
    return null;
  }
}

function hydrateSavedState(): void {
  const saved = loadSavedState();

  if (saved === null) {
    return;
  }

  if (typeof saved.selectedExample === "string" && isExampleId(saved.selectedExample)) {
    selectedExample = saved.selectedExample;
  }

  if (saved.activeFile === "javascript" || saved.activeFile === "html") {
    activeFile = saved.activeFile;
  }

  if (saved.files !== undefined) {
    playgroundExamples.forEach((example) => {
      const savedFiles = saved.files?.[example.id];

      if (typeof savedFiles?.javascript === "string") {
        filesByExample[example.id].javascript = savedFiles.javascript;
      }

      if (typeof savedFiles?.html === "string") {
        filesByExample[example.id].html = savedFiles.html;
      }
    });
  }

  pendingFiles = { ...filesByExample[selectedExample] };
}

function applyRequestedExample(): void {
  pageLaunch = readPlaygroundLaunch(window.location.search);

  if (pageLaunch !== null) {
    filesByExample[PAGE_PLAYGROUND_EXAMPLE_ID] = {
      html: pageLaunch.html,
      javascript: pageLaunch.javascript,
    };
    selectedExample = PAGE_PLAYGROUND_EXAMPLE_ID;
    pendingFiles = { ...filesByExample[selectedExample] };

    if (pageExampleOption !== null) {
      pageExampleOption.hidden = false;
      pageExampleOption.textContent = pageLaunch.title;
    }

    if (pageExampleButton !== null) {
      pageExampleButton.hidden = false;
    }

    if (pageExampleTitle !== null) {
      pageExampleTitle.textContent = pageLaunch.title;
    }

    if (exampleCount !== null) {
      exampleCount.textContent = String(playgroundExamples.length + 1).padStart(2, "0");
    }

    return;
  }

  const requested = new URLSearchParams(window.location.search).get("example");

  if (requested !== null && isExampleId(requested)) {
    selectedExample = requested;
    pendingFiles = { ...filesByExample[selectedExample] };
  }
}

function scheduleSave(): void {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedExample,
        activeFile,
        files: filesByExample,
      }),
    );
  }, 220);
}

function setStatus(state: "loading" | "running" | "error", label: string): void {
  if (status !== null) {
    status.dataset.state = state;
  }

  if (statusLabel !== null) {
    statusLabel.textContent = label;
  }
}

function setConsole(message: string, isError = false): void {
  if (consoleOutput === null) {
    return;
  }

  consoleOutput.textContent = message;
  consoleOutput.classList.toggle("is-error", isError);
}

function runCode(files: ExampleFiles): void {
  if (previewFrame === null) {
    return;
  }

  pendingFiles = { ...files };
  runId += 1;
  setStatus("loading", "Starting");
  setConsole("Starting scene...");
  previewFrame.src = `/playground-preview/?run=${runId}`;
}

hydrateSavedState();
applyRequestedExample();

if (templateSelect !== null) {
  templateSelect.value = selectedExample;
}

if (editorHost !== null) {
  loadingLabel?.remove();

  monaco.editor.defineTheme("grid-night", {
    base: "vs-dark",
    inherit: true,
    colors: {
      "editor.background": "#07090D",
      "editor.foreground": "#E8F7EF",
      "editor.lineHighlightBackground": "#0D141A",
      "editorLineNumber.foreground": "#435047",
      "editorLineNumber.activeForeground": "#00D43B",
      "editor.selectionBackground": "#17462A",
      "editorCursor.foreground": "#00D43B",
      "editorIndentGuide.background1": "#172019",
    },
    rules: [
      { token: "keyword", foreground: "FF5C7A" },
      { token: "string", foreground: "00D43B" },
      { token: "number", foreground: "FFB14A" },
      { token: "comment", foreground: "6F7C73", fontStyle: "italic" },
      { token: "tag", foreground: "FF5C7A" },
      { token: "attribute.name", foreground: "4DA9FF" },
      { token: "type.identifier", foreground: "4DA9FF" },
    ],
  });

  const apiCompletions = [
    [
      "GridCanvasSystem",
      'new GridCanvasSystem("canvas", {\n  width: 640,\n  height: 380\n})',
    ],
    ["drawPixelSprite", "drawPixelSprite(sprite, { x, y, pixelSize, palette })"],
    ["drawPacman", "drawPacman(x, y, radius, mouthOpen, options)"],
    ["drawGhost", "drawGhost({ x, y }, radius, options)"],
    ["drawBarIndicator", "drawBarIndicator(label, x, y, width, height, value, max)"],
    [
      "createAnimationLoop",
      "GridCanvasSystem.runtime.createAnimationLoop({ update, draw })",
    ],
    [
      "createStateMachine",
      "GridCanvasSystem.runtime.createStateMachine({ initial, transitions })",
    ],
    [
      "createPointerTracker",
      "GridCanvasSystem.runtime.createPointerTracker(grid.canvas)",
    ],
    ["canvasToGrid", "GridCanvasSystem.runtime.canvasToGrid(point, { cellSize })"],
    ["createArcadeAudio", "createArcadeAudio({ masterVolume: 0.72 })"],
    ["playLoop", 'await audio.playLoop("patrol")'],
  ] as const;

  monaco.languages.registerCompletionItemProvider("javascript", {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: apiCompletions.map(([label, insertText]) => ({
          label,
          insertText,
          range,
          detail: "grid-canvas-system",
          kind: monaco.languages.CompletionItemKind.Function,
        })),
      };
    },
  });

  const models: Record<FileName, monaco.editor.ITextModel> = {
    javascript: monaco.editor.createModel(
      filesByExample[selectedExample].javascript,
      "javascript",
      monaco.Uri.parse("inmemory://grid-canvas/scene.js"),
    ),
    html: monaco.editor.createModel(
      filesByExample[selectedExample].html,
      "plaintext",
      monaco.Uri.parse("inmemory://grid-canvas/index.html"),
    ),
  };

  const editor = monaco.editor.create(editorHost, {
    model: models[activeFile],
    theme: "grid-night",
    automaticLayout: true,
    fontFamily: '"Geist Pixel", "Cascadia Mono", Consolas, monospace',
    fontSize: 14,
    lineHeight: 23,
    fontLigatures: false,
    minimap: { enabled: window.innerWidth >= 1120 },
    padding: { top: 18, bottom: 18 },
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    cursorBlinking: "smooth",
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    occurrencesHighlight: "off",
    renderLineHighlight: "all",
    selectionHighlight: false,
    tabSize: 2,
    wordBasedSuggestions: "off",
  });

  function currentFiles(): ExampleFiles {
    return {
      javascript: models.javascript.getValue(),
      html: models.html.getValue(),
    };
  }

  function updateFileTabs(): void {
    fileTabs.forEach((tab) => {
      const selected = tab.dataset.fileTab === activeFile;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
    });

    if (languageLabel !== null) {
      languageLabel.textContent =
        activeFile === "javascript" ? "JavaScript / Monaco" : "HTML / Monaco";
    }
  }

  function showFile(file: FileName): void {
    activeFile = file;
    editor.setModel(models[file]);
    updateFileTabs();
    editor.focus();
    scheduleSave();
  }

  function updateExampleNavigation(): void {
    exampleButtons.forEach((button) => {
      const selected = button.dataset.exampleId === selectedExample;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    if (templateSelect !== null) {
      templateSelect.value = selectedExample;
    }

    if (description !== null) {
      description.textContent =
        selectedExample === PAGE_PLAYGROUND_EXAMPLE_ID && pageLaunch !== null
          ? pageLaunch.description
          : getPlaygroundExample(selectedExample).description;
    }
  }

  function selectExample(id: string): void {
    if (!isAvailableExample(id)) {
      return;
    }

    filesByExample[selectedExample] = currentFiles();
    selectedExample = id;
    models.javascript.setValue(filesByExample[id].javascript);
    models.html.setValue(filesByExample[id].html);
    editor.setScrollPosition({ scrollTop: 0 });
    updateExampleNavigation();
    showFile("javascript");
    const href =
      id === PAGE_PLAYGROUND_EXAMPLE_ID && pageLaunch !== null
        ? createPlaygroundLaunchUrl(pageLaunch)
        : `/playground/?example=${id}`;
    window.history.replaceState(null, "", href);
    scheduleSave();
    runCode(currentFiles());
  }

  models.javascript.onDidChangeContent(() => {
    filesByExample[selectedExample].javascript = models.javascript.getValue();
    scheduleSave();
  });
  models.html.onDidChangeContent(() => {
    filesByExample[selectedExample].html = models.html.getValue();
    scheduleSave();
  });

  editor.addAction({
    id: "grid-canvas-run",
    label: "Run scene",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => runCode(currentFiles()),
  });

  exampleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.exampleId;

      if (id !== undefined && isAvailableExample(id)) {
        selectExample(id);
      }
    });
  });

  templateSelect?.addEventListener("change", () => {
    if (isAvailableExample(templateSelect.value)) {
      selectExample(templateSelect.value);
    }
  });

  fileTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const file = tab.dataset.fileTab;

      if (file === "javascript" || file === "html") {
        showFile(file);
      }
    });
  });

  runButton?.addEventListener("click", () => runCode(currentFiles()));
  resetButton?.addEventListener("click", () => {
    const originalFiles =
      selectedExample === PAGE_PLAYGROUND_EXAMPLE_ID && pageLaunch !== null
        ? { html: pageLaunch.html, javascript: pageLaunch.javascript }
        : getPlaygroundExample(selectedExample);
    models.javascript.setValue(originalFiles.javascript);
    models.html.setValue(originalFiles.html);
    filesByExample[selectedExample] = currentFiles();
    editor.setScrollPosition({ scrollTop: 0 });
    editor.focus();
    scheduleSave();
    runCode(currentFiles());
  });
  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(models[activeFile].getValue());
      copyButton.classList.add("is-copied");
      copyButton.dataset.tooltip = "Copied";
    } catch {
      copyButton.dataset.tooltip = "Copy unavailable";
    }

    window.setTimeout(() => {
      copyButton.classList.remove("is-copied");
      copyButton.dataset.tooltip = "Copy code";
    }, 1400);
  });

  panelTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.panelTab;

      panelTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
      panels.forEach((panel) =>
        panel.classList.toggle("is-mobile-active", panel.dataset.panel === target),
      );
      window.setTimeout(() => editor.layout(), 0);
    });
  });

  window.addEventListener("resize", () => {
    editor.updateOptions({ minimap: { enabled: window.innerWidth >= 1120 } });
  });

  updateExampleNavigation();
  updateFileTabs();
  runCode(currentFiles());
}

window.addEventListener("message", (event) => {
  if (event.source !== previewFrame?.contentWindow || typeof event.data !== "object") {
    return;
  }

  const message = event.data as { type?: string; message?: string };

  if (message.type === "playground-ready") {
    previewFrame.contentWindow?.postMessage(
      {
        type: "playground-run",
        code: pendingFiles.javascript,
        html: pendingFiles.html,
      },
      window.location.origin,
    );
  } else if (message.type === "playground-running") {
    setStatus("running", "Running");
    setConsole(message.message ?? "Scene running.");
  } else if (message.type === "playground-log") {
    setConsole(message.message ?? "");
  } else if (message.type === "playground-error") {
    setStatus("error", "Error");
    setConsole(message.message ?? "Unknown preview error", true);
  }
});
