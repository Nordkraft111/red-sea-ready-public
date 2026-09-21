const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const header = document.querySelector(".header");

function closeMenu() {
  if (!menuButton || !navigation) return;
  navigation.dataset.open = "false";
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Åbn menu");
  document.body.classList.remove("menu-open");
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const willOpen = navigation.dataset.open !== "true";
    navigation.dataset.open = String(willOpen);
    menuButton.setAttribute("aria-expanded", String(willOpen));
    menuButton.setAttribute("aria-label", willOpen ? "Luk menu" : "Åbn menu");
    document.body.classList.toggle("menu-open", willOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

if (header) {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);

  const updateScrollState = () => {
    const top = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", top > 24);
    progress.style.transform = `scaleX(${height > 0 ? Math.min(top / height, 1) : 0})`;
  };

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
}

const form = document.querySelector("[data-prototype-form]");
const success = document.querySelector("[data-form-success]");

if (form && success) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
}
