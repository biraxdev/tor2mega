browser.storage.local.get(["apiUrl", "apiToken"]).then((result) => {
  document.getElementById("api-url").value = result.apiUrl || "http://localhost:3000";
  document.getElementById("api-token").value = result.apiToken || "";
});

document.getElementById("save").addEventListener("click", () => {
  const apiUrl = document.getElementById("api-url").value.trim();
  const apiToken = document.getElementById("api-token").value.trim();

  browser.storage.local.set({ apiUrl, apiToken }).then(() => {
    const saved = document.getElementById("saved");
    saved.style.display = "block";
    setTimeout(() => { saved.style.display = "none"; }, 3000);
  });
});
