const toggleBtn = document.getElementById("theme-toggle");
const root = document.documentElement;

// Check saved theme using local storage
if (localStorage.getItem("theme") === "light") {
  root.classList.add("light");
  toggleBtn.textContent = "☀️";
}

// Toggle theme when button is clicked
toggleBtn.addEventListener("click", () => {
  root.classList.toggle("light");
  
  if (root.classList.contains("light")) {
    toggleBtn.textContent = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    toggleBtn.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  }
});

