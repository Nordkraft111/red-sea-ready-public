const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const header = document.querySelector(".header");
const mobileNavigation = window.matchMedia("(max-width: 960px)");
let inactiveBackground = [];

function closeMenu({ restoreFocus = false } = {}) {
  if (!menuButton || !navigation) return;
  const wasOpen = navigation.dataset.open === "true";
  navigation.dataset.open = "false";
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Åbn menu");
  document.body.classList.remove("menu-open");
  inactiveBackground.forEach(({ element, wasInert }) => { element.inert = wasInert; });
  inactiveBackground = [];
  if (wasOpen && restoreFocus) menuButton.focus();
}

if (menuButton && navigation) {
  const menuLinks = [...navigation.querySelectorAll("a[href]")];
  menuButton.addEventListener("click", () => {
    if (navigation.dataset.open === "true") {
      closeMenu({ restoreFocus: true });
      return;
    }
    if (!mobileNavigation.matches) return;
    navigation.dataset.open = "true";
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Luk menu");
    document.body.classList.add("menu-open");
    // The full-screen menu covers these areas: keep focus and reading inside it.
    inactiveBackground = [...document.querySelectorAll("main, footer, .brand, .button--header, .skip-link")]
      .map((element) => ({ element, wasInert: element.inert }));
    inactiveBackground.forEach(({ element }) => { element.inert = true; });
    menuLinks[0]?.focus();
  });

  menuLinks.forEach((link) => link.addEventListener("click", () => closeMenu()));
  window.addEventListener("keydown", (event) => {
    if (navigation.dataset.open !== "true") return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
    if (event.key === "Tab") {
      const controls = [menuButton, ...menuLinks];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  mobileNavigation.addEventListener("change", () => {
    if (mobileNavigation.matches) return;
    const triggerHadFocus = document.activeElement === menuButton;
    closeMenu();
    if (triggerHadFocus) menuLinks[0]?.focus();
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
const prototypeFields = form?.querySelector("[data-prototype-fields]");
const phone = form?.querySelector("#phone");
const contactPreference = form?.querySelector("#contact");

if (form && success && prototypeFields && phone && contactPreference) {
  const updatePhoneRequirement = () => {
    phone.required = contactPreference.value === "phone";
    form.querySelector("[data-phone-note]").textContent = phone.required
      ? "(påkrævet ved telefonkontakt)" : "(valgfrit)";
    phone.setCustomValidity(phone.required && !phone.value.trim()
      ? "Skriv et telefonnummer, hvis du ønsker telefonkontakt." : "");
  };
  contactPreference.addEventListener("change", updatePhoneRequirement);
  phone.addEventListener("input", updatePhoneRequirement);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updatePhoneRequirement();
    if (!form.reportValidity()) return;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
  // Enable only after the local-only submit handler is attached.
  updatePhoneRequirement();
  prototypeFields.disabled = false;
  form.querySelector("[data-form-unavailable]").hidden = true;
}
