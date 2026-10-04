import "./style.css";

type FlagType =
  | "TAB_SWITCH"
  | "FOCUS_LOST"
  | "FULLSCREEN_EXIT"
  | "MULTIPLE_SCREENS"
  | "SCREEN_CHANGED";

interface IntegrityFlag {
  id: number;
  type: FlagType;
  message: string;
  time: string;
}

let interviewStarted = false;
let flags: IntegrityFlag[] = [];
let flagId = 1;
let lastScreenState: boolean | null = null;

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="app-shell">

    <header class="topbar">
      <div class="brand">
        <div class="logo">H</div>

        <div>
          <div class="brand-name">HireLens</div>
          <div class="brand-subtitle">AI Interview Platform</div>
        </div>
      </div>

      <div class="monitor-status">
        <span class="status-dot"></span>
        Monitoring <strong id="monitor-status">OFF</strong>
      </div>
    </header>

    <main class="main-content">

      <section class="interview-area">

        <div class="interview-header">
          <div>
            <div class="eyebrow">TECHNICAL INTERVIEW</div>
            <h1>Software Engineer Interview</h1>
          </div>

          <div class="candidate">
            <div class="avatar">DC</div>
            <div>
              <strong>Demo Candidate</strong>
              <span>Candidate ID: HL-DEMO-001</span>
            </div>
          </div>
        </div>

        <div class="question-card">

          <div class="question-number">
            QUESTION 04 <span>of 10</span>
          </div>

          <h2>
            How would you design a scalable API for a system
            receiving millions of requests per day?
          </h2>

          <p class="question-description">
            Explain your approach, including scalability,
            reliability and monitoring considerations.
          </p>

          <div class="answer-placeholder">
            <div class="record-icon">●</div>

            <div>
              <strong>Answer area placeholder</strong>
              <span>
                The existing HireLens interview system goes here.
              </span>
            </div>
          </div>

          <div class="question-actions">
            <button id="next-question" class="secondary-button">
              Next Question
            </button>
          </div>

        </div>

        <div id="start-panel" class="start-panel">

          <div class="start-icon">✓</div>

          <div>
            <h3>Interview integrity monitoring</h3>

            <p>
              This interview requires fullscreen mode and a
              single-screen environment.
            </p>

            <p class="small-text">
              Integrity events are flagged for review. They do not
              automatically cancel the interview.
            </p>
          </div>

          <button id="start-interview" class="primary-button">
            Start Interview
          </button>

        </div>

      </section>

      <aside class="integrity-panel">

        <div class="panel-header">
          <div>
            <div class="eyebrow">INTEGRITY MONITOR</div>
            <h2>Session Status</h2>
          </div>

          <div id="flag-count" class="flag-count">0</div>
        </div>

        <div class="status-card">
          <div class="status-row">
            <span>Fullscreen</span>
            <strong id="fullscreen-status">Not started</strong>
          </div>

          <div class="status-row">
            <span>Page visibility</span>
            <strong id="visibility-status">Visible</strong>
          </div>

          <div class="status-row">
            <span>Screen status</span>
            <strong id="screen-status">Checking...</strong>
          </div>
        </div>

        <div class="flags-title">
          Integrity Flags
        </div>

        <div id="flags-list" class="flags-list">
          <div class="empty-flags">
            No integrity flags recorded.
          </div>
        </div>

        <div class="policy-note">
          <strong>Interview policy</strong>

          <p>
            Flags are recorded for later review. The candidate
            can continue the interview after an event.
          </p>
        </div>

      </aside>

    </main>

    <footer class="footer">
      <span>HireLens Interview Demo</span>
      <span>Integrity monitoring prototype</span>
    </footer>

  </div>
`;

const startButton =
  document.querySelector<HTMLButtonElement>("#start-interview")!;

const startPanel =
  document.querySelector<HTMLDivElement>("#start-panel")!;

const monitorStatus =
  document.querySelector<HTMLElement>("#monitor-status")!;

const fullscreenStatus =
  document.querySelector<HTMLElement>("#fullscreen-status")!;

const visibilityStatus =
  document.querySelector<HTMLElement>("#visibility-status")!;

const screenStatus =
  document.querySelector<HTMLElement>("#screen-status")!;

const flagCount =
  document.querySelector<HTMLElement>("#flag-count")!;

const flagsList =
  document.querySelector<HTMLDivElement>("#flags-list")!;

const nextQuestion =
  document.querySelector<HTMLButtonElement>("#next-question")!;


// ----------------------------------------------------
// Helpers
// ----------------------------------------------------

function currentTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function addFlag(type: FlagType, message: string) {
  if (!interviewStarted) return;

  const flag: IntegrityFlag = {
    id: flagId++,
    type,
    message,
    time: currentTime(),
  };

  flags.unshift(flag);

  renderFlags();
}

function renderFlags() {
  flagCount.textContent = String(flags.length);

  if (flags.length === 0) {
    flagsList.innerHTML = `
      <div class="empty-flags">
        No integrity flags recorded.
      </div>
    `;

    return;
  }

  flagsList.innerHTML = flags
    .map(
      (flag) => `
        <div class="flag-item">

          <div class="flag-icon">!</div>

          <div class="flag-content">
            <strong>${flag.message}</strong>

            <span>
              ${flag.time}
            </span>
          </div>

        </div>
      `,
    )
    .join("");
}


// ----------------------------------------------------
// Fullscreen
// ----------------------------------------------------

async function enterFullscreen() {
  try {
    await document.documentElement.requestFullscreen();
  } catch {
    addFlag(
      "FULLSCREEN_EXIT",
      "Fullscreen mode could not be activated",
    );
  }
}

document.addEventListener("fullscreenchange", () => {
  const fullscreen = document.fullscreenElement !== null;

  fullscreenStatus.textContent = fullscreen
    ? "Active"
    : "Exited";

  fullscreenStatus.className = fullscreen
    ? "good"
    : "warning";

  if (!fullscreen && interviewStarted) {
    addFlag(
      "FULLSCREEN_EXIT",
      "Fullscreen mode exited",
    );
  }
});


// ----------------------------------------------------
// Tab / Page Visibility
// ----------------------------------------------------

document.addEventListener("visibilitychange", () => {
  const hidden = document.hidden;

  visibilityStatus.textContent = hidden
    ? "Hidden"
    : "Visible";

  visibilityStatus.className = hidden
    ? "warning"
    : "good";

  if (hidden && interviewStarted) {
    addFlag(
      "TAB_SWITCH",
      "Interview page became hidden",
    );
  }
});


// ----------------------------------------------------
// Browser / Application Focus
// ----------------------------------------------------

window.addEventListener("blur", () => {
  if (!interviewStarted) return;

  addFlag(
    "FOCUS_LOST",
    "Interview window lost focus",
  );
});


// ----------------------------------------------------
// Screen monitoring
// ----------------------------------------------------

type ScreenCheckResult =
  | {
      supported: true;
      count: number;
      multiple: boolean;
    }
  | {
      supported: false;
      reason: string;
    };

let lastScreenCount: number | null = null;

async function getScreenStatus(): Promise<ScreenCheckResult> {
  // Best option: Window Management API
  if ("getScreenDetails" in window) {
    try {
      const getScreenDetails = (
        window as Window & {
          getScreenDetails?: () => Promise<{
            screens: unknown[];
          }>;
        }
      ).getScreenDetails;

      if (getScreenDetails) {
        const details = await getScreenDetails();

        const count = details.screens.length;

        return {
          supported: true,
          count,
          multiple: count > 1,
        };
      }
    } catch {
      return {
        supported: false,
        reason: "Screen permission was unavailable",
      };
    }
  }

  // Fallback: screen.isExtended
  if ("isExtended" in window.screen) {
    const extended = Boolean(
      (window.screen as Screen & {
        isExtended?: boolean;
      }).isExtended,
    );

    return {
      supported: true,
      count: extended ? 2 : 1,
      multiple: extended,
    };
  }

  return {
    supported: false,
    reason: "Browser cannot verify display configuration",
  };
}


async function checkScreenCount(): Promise<ScreenCheckResult> {
  const result = await getScreenStatus();

  if (!result.supported) {
    screenStatus.textContent = "Cannot verify";
    screenStatus.className = "warning";

    return result;
  }

  screenStatus.textContent =
    result.count === 1
      ? "1 screen"
      : `${result.count} screens`;

  screenStatus.className =
    result.multiple
      ? "warning"
      : "good";

  // During an active interview, a screen increase creates a flag.
  if (
    interviewStarted &&
    lastScreenCount !== null &&
    result.count !== lastScreenCount
  ) {
    addFlag(
      "SCREEN_CHANGED",
      result.multiple
        ? "Multiple screens detected"
        : "Screen configuration changed",
    );
  }

  lastScreenCount = result.count;

  return result;
}

// Check screen state periodically.
// This is intentionally simple for the demo.
setInterval(checkScreenCount, 2000);

checkScreenCount();


// ----------------------------------------------------
// Start interview
// ----------------------------------------------------

startButton.addEventListener("click", async () => {
  // -----------------------------------------------
  // 1. Screen preflight
  // -----------------------------------------------

  const screenCheck = await checkScreenCount();

  // Cannot start if screen configuration cannot be verified
  if (!screenCheck.supported) {
    showStartError(
      "This interview requires a single-screen setup. " +
      "Your browser cannot verify the current screen configuration.",
    );

    return;
  }

  // -----------------------------------------------
  // 2. Multiple screens = BLOCK START
  // -----------------------------------------------

  if (screenCheck.multiple) {
    showStartError(
      `Multiple screens detected (${screenCheck.count}). ` +
      "Disconnect the additional screen and try again.",
    );

    return;
  }

  // -----------------------------------------------
  // 3. Single screen = start interview
  // -----------------------------------------------

  interviewStarted = true;

  monitorStatus.textContent = "ON";

  startPanel.classList.add("started");

  startPanel.innerHTML = `
    <div class="start-icon success">✓</div>

    <div>
      <h3>Interview is active</h3>

      <p>
        Integrity monitoring is now running.
      </p>

      <p class="small-text">
        Fullscreen, tab, focus and screen events are being monitored.
      </p>
    </div>

    <div class="active-label">
      INTERVIEW ACTIVE
    </div>
  `;

  await enterFullscreen();

  fullscreenStatus.textContent =
    document.fullscreenElement
      ? "Active"
      : "Exited";

  await checkScreenCount();
});

function showStartError(message: string) {
  startPanel.innerHTML = `
    <div class="start-icon error">!</div>

    <div class="start-error-content">
      <h3>Interview cannot start</h3>

      <p>
        ${message}
      </p>

      <p class="small-text">
        The interview will become available once the environment
        passes the screen requirement.
      </p>
    </div>

    <button id="retry-screen-check" class="secondary-button">
      Check Again
    </button>
  `;

  const retryButton =
    document.querySelector<HTMLButtonElement>(
      "#retry-screen-check",
    );

  retryButton?.addEventListener(
    "click",
    async () => {
      await checkScreenCount();

      // Restore normal preflight UI
      startPanel.innerHTML = `
        <div class="start-icon">✓</div>

        <div>
          <h3>Interview integrity monitoring</h3>

          <p>
            This interview requires fullscreen mode and
            a single-screen environment.
          </p>

          <p class="small-text">
            Integrity events are flagged for review.
            They do not automatically cancel the interview.
          </p>
        </div>

        <button id="start-interview" class="primary-button">
          Start Interview
        </button>
      `;

      const newStartButton =
        document.querySelector<HTMLButtonElement>(
          "#start-interview",
        );

      newStartButton?.addEventListener(
        "click",
        () => {
          location.reload();
        },
      );
    },
  );
}


// ----------------------------------------------------
// Placeholder interview interaction
// ----------------------------------------------------

nextQuestion.addEventListener("click", () => {
  const button = nextQuestion;

  button.textContent = "Next Question Loaded";

  setTimeout(() => {
    button.textContent = "Next Question";
  }, 1200);
});