const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");
const scrollProgress = document.getElementById("scrollProgress");

const heroRight = document.getElementById("heroRight");
const portraitImage = document.getElementById("portraitImage");
const portraitFallback = document.getElementById("portraitFallback");

const contactForm = document.getElementById("contactForm");
const formProgress = document.getElementById("formProgress");
const formStatus = document.getElementById("formStatus");

const finishWhatsApp = document.getElementById("finishWhatsApp");

const whatsappButton = document.getElementById("whatsappButton");
const whatsappPopover = document.getElementById("whatsappPopover");
const whatsappClose = document.getElementById("whatsappClose");

const currentYear = document.getElementById("currentYear");

const GOOGLE_SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbx9topAEJn9wNA9aHKnDWEDrGjwPgmcD8QKXW6AzVAhV_THtGLNB84qjxL-zX1-9ykz/exec";

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* Mobile navigation */

const setMenuState = (open) => {
  menuButton?.classList.toggle("active", open);
  mobileMenu?.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);

  menuButton?.setAttribute("aria-expanded", String(open));

  menuButton?.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation"
  );
};

menuButton?.addEventListener("click", () => {
  const open = mobileMenu?.classList.contains("open");

  setMenuState(!open);
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    setMenuState(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

/* Main portrait fallback */

portraitImage?.addEventListener("error", () => {
  portraitImage.style.display = "none";
  portraitFallback.style.display = "grid";
});

/* Scroll progress */

const updateScrollProgress = () => {
  const availableHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    availableHeight > 0
      ? (window.scrollY / availableHeight) * 100
      : 0;

  if (scrollProgress) {
    scrollProgress.style.width =
      `${Math.min(progress, 100)}%`;
  }
};

window.addEventListener("scroll", updateScrollProgress, {
  passive: true
});

window.addEventListener("resize", updateScrollProgress);

updateScrollProgress();

/* Interactive hero movement */

if (heroRight && !reduceMotion) {
  let animationFrame;

  heroRight.addEventListener("pointermove", (event) => {
    cancelAnimationFrame(animationFrame);

    animationFrame = requestAnimationFrame(() => {
      const bounds = heroRight.getBoundingClientRect();

      const x =
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 18;

      const y =
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 18;

      heroRight.style.setProperty(
        "--move-x",
        `${x}px`
      );

      heroRight.style.setProperty(
        "--move-y",
        `${y}px`
      );
    });
  });

  heroRight.addEventListener("pointerleave", () => {
    heroRight.style.setProperty("--move-x", "0px");
    heroRight.style.setProperty("--move-y", "0px");
  });
}

/* Scroll reveal animations */

const revealElements =
  document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -7% 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

/* Magnetic buttons */

if (!reduceMotion) {
  document
    .querySelectorAll(".magnetic")
    .forEach((button) => {
      button.addEventListener(
        "pointermove",
        (event) => {
          const bounds =
            button.getBoundingClientRect();

          const x =
            event.clientX -
            bounds.left -
            bounds.width / 2;

          const y =
            event.clientY -
            bounds.top -
            bounds.height / 2;

          button.style.transform =
            `translate(${x * 0.12}px, ${y * 0.12}px)`;
        }
      );

      button.addEventListener(
        "pointerleave",
        () => {
          button.style.transform = "";
        }
      );
    });
}

/* Contact form progress */

if (contactForm) {
  const requiredFields = [
    ...contactForm.querySelectorAll("[required]")
  ];

  const updateFormProgress = () => {
    const completed =
      requiredFields.filter((field) => {
        return field.value.trim() !== "";
      }).length;

    const progress =
      requiredFields.length > 0
        ? (completed / requiredFields.length) * 100
        : 0;

    if (formProgress) {
      formProgress.style.width = `${progress}%`;
    }
  };

  requiredFields.forEach((field) => {
    field.addEventListener(
      "input",
      updateFormProgress
    );

    field.addEventListener(
      "change",
      updateFormProgress
    );
  });

  updateFormProgress();

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const data = new FormData(contactForm);

    const name = String(
      data.get("name") || ""
    ).trim();

    const email = String(
      data.get("email") || ""
    ).trim();

    const phone = String(
      data.get("phone") || ""
    ).trim();

    const service = String(
      data.get("service") || ""
    ).trim();

    const timeline = String(
      data.get("timeline") || ""
    ).trim();

    const message = String(
      data.get("message") || ""
    ).trim();

    const whatsappMessage = [
      "Hi Gautam, I want to discuss a project.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Service: ${service}`,
      `Timeline: ${timeline}`,
      `Project: ${message}`
    ].join("\n");

    const whatsappURL =
      "https://wa.me/916003035529?text=" +
      encodeURIComponent(whatsappMessage);

    const submitButton = contactForm.querySelector(
      'button[type="submit"]'
    );

    const sheetPayload = new URLSearchParams({
      name,
      email,
      phone,
      service,
      timeline,
      message,
      website: "",
      source: window.location.href,
      userAgent: navigator.userAgent
    });

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    if (formStatus) {
      formStatus.textContent =
        "Saving your project details...";
    }

    try {
      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: sheetPayload
      });

      try {
        sessionStorage.setItem("projectVisitorName", name);
        sessionStorage.setItem("projectWhatsAppURL", whatsappURL);
      } catch (error) {
        /* Continue when browser storage is unavailable. */
      }

      if (formStatus) {
        formStatus.textContent =
          "Saved. Loading your thank-you page...";
      }

      window.setTimeout(() => {
        window.location.assign("./thank-you.html");
      }, 350);
    } catch (error) {
      if (formStatus) {
        formStatus.textContent =
          "Could not save your details. Please check your connection and try again.";
      }

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}

/* Thank-you page */

if (finishWhatsApp) {
  try {
    const savedWhatsAppURL = sessionStorage.getItem(
      "projectWhatsAppURL"
    );

    if (
      finishWhatsApp &&
      savedWhatsAppURL?.startsWith("https://wa.me/")
    ) {
      finishWhatsApp.href = savedWhatsAppURL;
    }
  } catch (error) {
    /* The page still works without browser storage. */
  }
}

/* WhatsApp popover */

const setWhatsAppState = (open) => {
  whatsappPopover?.classList.toggle(
    "open",
    open
  );

  whatsappPopover?.setAttribute(
    "aria-hidden",
    String(!open)
  );

  whatsappButton?.setAttribute(
    "aria-expanded",
    String(open)
  );
};

whatsappButton?.addEventListener("click", () => {
  const open =
    whatsappPopover?.classList.contains("open");

  setWhatsAppState(!open);
});

whatsappClose?.addEventListener("click", () => {
  setWhatsAppState(false);
});

document.addEventListener("click", (event) => {
  if (!whatsappPopover?.classList.contains("open")) {
    return;
  }

  const clickedPopover =
    whatsappPopover.contains(event.target);

  const clickedButton =
    whatsappButton?.contains(event.target);

  if (!clickedPopover && !clickedButton) {
    setWhatsAppState(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setWhatsAppState(false);
  }
});

window.setTimeout(() => {
  const visitorIsNearHero =
    window.scrollY < window.innerHeight * 1.4;

  if (visitorIsNearHero) {
    setWhatsAppState(true);
  }
}, 10000);

/* Current year */

if (currentYear) {
  currentYear.textContent =
    new Date().getFullYear();
}
