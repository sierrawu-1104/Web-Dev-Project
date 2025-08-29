
document.addEventListener("DOMContentLoaded", () => {
  const sport = document.body.getAttribute("data-sport");
  const apiKeyInput = document.getElementById("apiKey");
  try{
    const stored = localStorage.getItem("odds_api_key");
    if (stored && apiKeyInput) apiKeyInput.value = stored;
    apiKeyInput?.addEventListener("change", () => {
      localStorage.setItem("odds_api_key", apiKeyInput.value.trim());
    });
  }catch(_) {}
  document.getElementById("goBtn")?.addEventListener("click", () => runScan(sport));
});
