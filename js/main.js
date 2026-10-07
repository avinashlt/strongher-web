const loader = document.getElementById("loader");
const header = document.getElementById("header");
const nav = document.getElementById("siteNav");
const navToggle = document.getElementById("navToggle");
const year = document.getElementById("year");
const sticky = document.getElementById("stickyWa");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) year.textContent = String(new Date().getFullYear());

function finishLoad() {
  loader?.classList.add("is-done");
  document.querySelectorAll(".hero [data-reveal]").forEach((el) => el.classList.add("is-in"));
}

if (document.readyState === "complete") finishLoad();
else window.addEventListener("load", finishLoad);
setTimeout(finishLoad, 1600);

document.querySelectorAll("img").forEach((img) => {
  img.addEventListener(
    "error",
    () => {
      img.classList.add("img-fallback");
      img.removeAttribute("src");
    },
    { once: true }
  );
});

function setMenu(open) {
  nav?.classList.toggle("is-open", open);
  navToggle?.setAttribute("aria-expanded", String(open));
  const label = navToggle?.querySelector(".sr-only");
  if (label) label.textContent = open ? "Close menu" : "Open menu";
}

navToggle?.addEventListener("click", () => {
  setMenu(!nav.classList.contains("is-open"));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

const reveals = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !reduceMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => {
    if (!el.closest(".hero")) observer.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
}

const zoom = document.querySelector("[data-zoom]");
if (zoom && "IntersectionObserver" in window) {
  const zoomObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) zoom.classList.add("is-zoomed");
      });
    },
    { threshold: 0.35 }
  );
  zoomObserver.observe(zoom);
}

const layers = document.querySelectorAll("[data-parallax]");

function onScroll() {
  header?.classList.toggle("is-solid", header?.dataset.pinned === "solid" || window.scrollY > 24);

  if (sticky) {
    const footer = document.getElementById("contact");
    const footerTop = footer?.getBoundingClientRect().top ?? Infinity;
    sticky.classList.toggle("is-hidden", footerTop < window.innerHeight * 0.72);
  }

  if (reduceMotion) return;
  const view = window.innerHeight;
  layers.forEach((layer) => {
    const speed = Number(layer.dataset.parallax) || 0.1;
    const parent = layer.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > view) return;
    const shift = (rect.top - view * 0.5) * speed;
    layer.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
  });
}

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  },
  { passive: true }
);
onScroll();

const IG_PROFILE = "https://www.instagram.com/_keerthana_ram_/";
const IG_REEL = "";

function mountInstagram() {
  const frame = document.getElementById("igFrame");
  if (!frame || !IG_REEL) return;
  const fallback = document.getElementById("igFallback");
  const block = document.createElement("blockquote");
  block.className = "instagram-media";
  block.dataset.instgrmPermalink = IG_REEL;
  block.dataset.instgrmVersion = "14";
  block.style.cssText = "background:#fff;margin:0;width:100%;";
  frame.appendChild(block);
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.instagram.com/embed.js";
  script.onload = () => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (frame.querySelector("iframe")) {
        fallback?.remove();
        window.clearInterval(timer);
      } else if (Date.now() - started > 4500) {
        block.remove();
        window.clearInterval(timer);
      }
    }, 250);
  };
  script.onerror = () => block.remove();
  document.body.appendChild(script);
}

mountInstagram();

const TRAINERS = [
  { id: "keerthana", name: "Keerthana Ram" },
  { id: "aiswarya", name: "Aiswarya Ashok" },
  { id: "akansha", name: "Akansha" },
  { id: "tapanjana", name: "Tapanjana Rudra" },
  { id: "deepthi", name: "Deepthi Vivekanandan" },
  { id: "mitali", name: "Mitali Ganguly" },
];

const REVIEW_KEY = "strongher.reviews.v1";
const reviewForm = document.getElementById("reviewForm");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadReviews() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REVIEW_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReviews(items) {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(items.slice(0, 60)));
}

function starGlyph(value) {
  const full = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return `${"★".repeat(full)}${"☆".repeat(5 - full)}`;
}

function renderReviews() {
  const board = document.getElementById("trainerBoard");
  if (!board) return;
  const reviews = loadReviews();
  board.innerHTML = TRAINERS.map((trainer) => {
    const mine = reviews.filter((item) => item.trainerId === trainer.id);
    const average = mine.length
      ? mine.reduce((sum, item) => sum + Number(item.rating), 0) / mine.length
      : 0;
    const cards = mine.length
      ? mine
          .slice()
          .reverse()
          .map((item) => {
            const safePhoto = typeof item.photo === "string" && item.photo.startsWith("data:image/jpeg") ? item.photo : "";
            const photo = safePhoto
              ? `<img src="${safePhoto}" alt="" />`
              : `<span class="avatar-fallback" aria-hidden="true">${escapeHtml(item.name.slice(0, 1))}</span>`;
            return `<article class="review-item">${photo}<div><h4>${escapeHtml(item.name)}</h4><p class="stars-read" aria-label="${item.rating} out of 5 stars">${starGlyph(item.rating)}</p><p>${escapeHtml(item.text)}</p></div></article>`;
          })
          .join("")
      : `<p class="empty-reviews">No reviews yet. Be the first to rate ${escapeHtml(trainer.name)}.</p>`;
    const avgLabel = mine.length ? average.toFixed(1) : "New";
    return `<article class="trainer-card" id="trainer-${trainer.id}"><header><h3>${escapeHtml(trainer.name)}</h3><p class="avg"><span class="stars-read" aria-hidden="true">${starGlyph(average)}</span> ${avgLabel}<small>${mine.length} review${mine.length === 1 ? "" : "s"}</small></p></header><div class="review-list">${cards}</div></article>`;
  }).join("");
}

function setFieldError(name, message) {
  const node = document.querySelector(`[data-error-for="${name}"]`);
  const input = reviewForm?.elements.namedItem(name);
  if (node) node.textContent = message;
  if (input && "setAttribute" in input) {
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }
}

function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose a photo."));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Photo must be under 5 MB."));
      return;
    }
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const max = 480;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo."));
    };
    image.src = url;
  });
}

if (reviewForm) {
  const trainerSelect = reviewForm.elements.namedItem("trainer");
  TRAINERS.forEach((trainer) => {
    const option = document.createElement("option");
    option.value = trainer.id;
    option.textContent = trainer.name;
    trainerSelect.appendChild(option);
  });

  const hashTrainer = location.hash.replace("#trainer-", "");
  if (TRAINERS.some((trainer) => trainer.id === hashTrainer)) {
    trainerSelect.value = hashTrainer;
  }

  const photoInput = reviewForm.elements.namedItem("photo");
  const preview = document.getElementById("photoPreview");
  photoInput?.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (!file || !preview) {
      preview?.classList.remove("is-on");
      return;
    }
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.classList.add("is-on");
  });

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const success = document.getElementById("formSuccess");
    success?.classList.remove("is-on");
    const name = reviewForm.elements.namedItem("name").value.trim();
    const trainerId = reviewForm.elements.namedItem("trainer").value;
    const rating = reviewForm.elements.namedItem("rating").value;
    const text = reviewForm.elements.namedItem("text").value.trim();
    let valid = true;

    if (name.length < 2 || name.length > 40) {
      setFieldError("name", "Enter your name (2–40 characters).");
      valid = false;
    } else setFieldError("name", "");

    if (!trainerId) {
      setFieldError("trainer", "Choose a trainer.");
      valid = false;
    } else setFieldError("trainer", "");

    if (!rating) {
      setFieldError("rating", "Select a star rating.");
      valid = false;
    } else setFieldError("rating", "");

    if (text.length < 10 || text.length > 500) {
      setFieldError("text", "Write a review between 10 and 500 characters.");
      valid = false;
    } else setFieldError("text", "");

    if (!valid) return;

    let photo = "";
    try {
      photo = await readPhoto(photoInput.files?.[0]);
      setFieldError("photo", "");
    } catch (error) {
      setFieldError("photo", error.message);
      return;
    }

    const next = loadReviews();
    next.push({
      id: crypto.randomUUID(),
      trainerId,
      name,
      rating: Number(rating),
      text,
      photo,
      createdAt: new Date().toISOString(),
    });
    try {
      saveReviews(next);
    } catch {
      next[next.length - 1].photo = "";
      try {
        saveReviews(next);
        setFieldError("photo", "Saved without the photo because storage is full.");
      } catch {
        setFieldError("photo", "Could not save this review on this device.");
        return;
      }
    }
    reviewForm.reset();
    preview?.classList.remove("is-on");
    if (preview) preview.removeAttribute("src");
    success?.classList.add("is-on");
    renderReviews();
    document.getElementById(`trainer-${trainerId}`)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });

  renderReviews();
}
