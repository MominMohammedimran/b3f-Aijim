import { toast } from "sonner";

let currentVersion = null;
let intervalId = null;
let updateAvailable = false;
let reminderIntervalId = null;

export async function startVersionCheck() {
  await checkVersion(); // run once on initial load
  intervalId = setInterval(checkVersion, 30000); // check every 30 sec
}

async function checkVersion() {
  try {
    const response = await fetch("/version.json", { cache: "no-store" });
    if (!response.ok) return;

    const data = await response.json();
    const newVersion = `${data.version}-${data.build}`;

    if (!currentVersion) {
      currentVersion = newVersion;
      return;
    }

    if (newVersion !== currentVersion && !updateAvailable) {
      updateAvailable = true;
      showUpdateToast();
      startReminderLoop(); // start reminding every 30 sec
      currentVersion = newVersion;
    }
  } catch (err) {
    console.warn("Version check failed:", err);
  }
}

function showUpdateToast() {
  toast.info("🆕 New update available!", {
    description: "Click to refresh and update the app.",
    action: {
      label: "Refresh",
      onClick: refreshApp,
    },
    duration: 10000,
  });
}

function startReminderLoop() {
  if (reminderIntervalId) return; // already reminding

  reminderIntervalId = setInterval(() => {
    if (updateAvailable) {
      showUpdateToast();
    }
  }, 30000);
}

function refreshApp() {
  updateAvailable = false;

  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
    reminderIntervalId = null;
  }

  window.location.reload(true);
}

export function stopVersionCheck() {
  if (intervalId) clearInterval(intervalId);
  if (reminderIntervalId) clearInterval(reminderIntervalId);
}
