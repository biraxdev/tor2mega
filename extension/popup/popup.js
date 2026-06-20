let SITE_BASE = "http://localhost:3000";
let queueCount = 0;

browser.storage.local.get(["apiUrl", "apiToken"]).then((result) => {
  if (result.apiUrl) SITE_BASE = result.apiUrl.replace(/\/$/, "");
  if (!result.apiToken) {
    document.getElementById("no-token").style.display = "block";
    document.getElementById("main").style.display = "none";
    document.getElementById("open-options").addEventListener("click", () => {
      browser.runtime.openOptionsPage();
    });
  } else {
    document.getElementById("no-token").style.display = "none";
    document.getElementById("main").style.display = "block";
    setupActions();
    updateQueueBadge();
    setInterval(updateQueueBadge, 5000);
  }
});

function setupActions() {
  document.getElementById("action-add").addEventListener("click", () => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.url) {
        browser.runtime.sendMessage({ type: "sendToMega", url: tab.url });
        showStatus("Added to queue", "processing");
      }
    });
  });

  document.getElementById("action-library").addEventListener("click", () => {
    browser.tabs.create({ url: `${SITE_BASE}/dashboard/videos` });
  });

  document.getElementById("action-dashboard").addEventListener("click", () => {
    browser.tabs.create({ url: `${SITE_BASE}/dashboard` });
  });

  document.getElementById("action-queue").addEventListener("click", () => {
    browser.tabs.create({ url: `${SITE_BASE}/dashboard/downloads` });
  });
}

function updateQueueBadge() {
  browser.runtime.sendMessage({ type: "getDownloads" }, (response) => {
    if (response && response.downloads) {
      const active = response.downloads.filter(
        (d) => d.status === "queued" || d.status === "downloading" || d.status === "uploading"
      );
      queueCount = active.length;
      const badge = document.getElementById("queue-badge");
      if (queueCount > 0) {
        badge.textContent = queueCount;
        badge.style.display = "inline-block";
        showStatus(`${queueCount} processing`, "processing");
      } else {
        badge.style.display = "none";
        const failed = response.downloads.filter((d) => d.status === "failed");
        if (failed.length > 0) {
          showStatus(`${failed.length} failed`, "error");
        } else {
          showStatus("Ready", "ok");
        }
      }
    }
  });
}

function showStatus(text, type) {
  const bar = document.getElementById("status-bar");
  bar.textContent = text;
  bar.className = "status-bar";
  if (type === "ok") bar.classList.add("status-ok");
  else if (type === "processing") bar.classList.add("status-processing");
  else if (type === "error") bar.classList.add("status-error");
}
