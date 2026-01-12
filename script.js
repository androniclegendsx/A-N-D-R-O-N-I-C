// script.js

// ========== HERO SLIDER ==========
const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".hero-controls .dot");

let currentSlide = 0;

function showSlide(index) {
  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");
  currentSlide = index;
  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => showSlide(index));
});

setInterval(() => {
  const next = (currentSlide + 1) % slides.length;
  showSlide(next);
}, 8000);

// ========== ELEMENT REFERENCES ==========
const heroSection = document.querySelector(".hero");
const homeMain = document.getElementById("homeMain");
const watchPage = document.getElementById("watchPage");
const backBtn = document.getElementById("backHome");

const watchPoster = document.getElementById("watchPoster");
const watchTitle = document.getElementById("watchTitle");
const watchMeta = document.getElementById("watchMeta");
const watchSynopsis = document.getElementById("watchSynopsis");
const watchVideo = document.getElementById("watchVideo");
const watchEpisodes = document.getElementById("watchEpisodes");

// ========== OPEN / CLOSE WATCH PAGE ==========
function buildEmbedUrl(obj) {
  if (!obj) return "";
  if (obj.youtubeId) {
    return `https://www.youtube.com/embed/${obj.youtubeId}`;
  }
  if (obj.dmId) {
    return `https://www.dailymotion.com/embed/video/${obj.dmId}`;
  }
  return "";
}

function openWatchPage(id) {
  const item = CONTENT_DB[id];
  if (!item) return;

  // Fill info
  watchPoster.src = item.poster;
  watchPoster.alt = item.title;
  watchTitle.textContent = item.title;
  watchMeta.textContent = item.meta || "";
  watchSynopsis.textContent = item.synopsis || "";

  // Default video = first episode with ID or movie trailer
  let defaultVideo = buildEmbedUrl(item);
  if (!defaultVideo && item.type === "series" && Array.isArray(item.episodes)) {
    const firstWithId = item.episodes.find(
      (ep) => ep.youtubeId || ep.dmId
    );
    defaultVideo = buildEmbedUrl(firstWithId);
  }
  watchVideo.src = defaultVideo;

  // Episodes
  watchEpisodes.innerHTML = "";
  if (item.type === "series" && Array.isArray(item.episodes)) {
    item.episodes.forEach((ep) => {
      const card = document.createElement("div");
      card.className = "episode-card";

      const thumbSrc = item.episodeThumb || item.poster;

      card.innerHTML = `
        <img class="episode-thumb" src="${thumbSrc}" alt="Episode ${ep.number}" />
        <div class="episode-info">
          <strong>EP ${ep.number}</strong>
          <span>${ep.name}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        const url = buildEmbedUrl(ep);
        if (url) {
          watchVideo.src = url;
        }
      });

      watchEpisodes.appendChild(card);
    });
  }

  // Show watch page, hide home + hero
  heroSection.classList.add("hidden");
  homeMain.classList.add("hidden");
  watchPage.classList.remove("hidden");

  // Optional: avoid background scroll (not really needed now)
  document.body.classList.add("modal-open");
}

function closeWatchPage() {
  watchPage.classList.add("hidden");
  heroSection.classList.remove("hidden");
  homeMain.classList.remove("hidden");
  watchVideo.src = ""; // stop playback
  document.body.classList.remove("modal-open");
}

backBtn.addEventListener("click", closeWatchPage);

// ========== CARD & HERO BUTTON CLICKS ==========
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => {
    const id = card.dataset.detail;
    openWatchPage(id);
  });
});

document.querySelectorAll(".play-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.target;   // <== uses the attribute on the button
    openWatchPage(id);
  });
});

// HORIZONTAL SCROLL ARROWS
const arrows = document.querySelectorAll(".rail-arrow");

arrows.forEach((btn) => {
  btn.addEventListener("click", () => {
    const railId = btn.dataset.rail;
    const rail = document.getElementById(railId);
    if (!rail) return;

    const scrollAmount = 300; // pixels per click
    if (btn.classList.contains("left")) {
      rail.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      rail.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  });
});

// ADVANCED SEARCH WITH VERTICAL RESULTS
const searchInput = document.getElementById("searchInput");
const sections = document.querySelectorAll("main .section");
const searchSection = document.getElementById("searchSection");
const searchList = document.getElementById("searchList");

if (searchInput && searchSection && searchList) {
  const allCards = Array.from(document.querySelectorAll(".card")).map(
    (card) => ({
      card,
      section: card.closest(".section")
    })
  );

  function clearSearchResults() {
    sections.forEach((sec) => {
      sec.classList.remove("hidden");
    });
    searchSection.classList.add("hidden");
    searchList.innerHTML = "";
  }

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();

    if (!q) {
      clearSearchResults();
      return;
    }

    const matches = allCards.filter(({ card }) => {
      const titleEl = card.querySelector("h3");
      const title = titleEl ? titleEl.textContent.toLowerCase() : "";
      return title.includes(q);
    });

    // hide all original sections while searching
    sections.forEach((sec) => sec.classList.add("hidden"));

    searchList.innerHTML = "";

    if (matches.length === 0) {
      searchList.innerHTML = "<p>No results found.</p>";
      searchSection.classList.remove("hidden");
      return;
    }

    matches.forEach(({ card }, index) => {
      const clone = card.cloneNode(true);
      clone.classList.add("anim-in");
      clone.style.animationDelay = `${index * 40}ms`;

      clone.addEventListener("click", () => {
        const id = clone.dataset.detail;
        openWatchPage(id);
      });

      searchList.appendChild(clone);
    });

    searchSection.classList.remove("hidden");
  });
}
