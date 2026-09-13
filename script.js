const grid = document.getElementById("listing-grid");
const searchInput = document.getElementById("search");
const chipRow = document.getElementById("category-chips");
const cityChipRow = document.getElementById("city-chips");
const resultCount = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");
const featuredRow = document.getElementById("featured-row");
const featuredSection = document.getElementById("featured-section");
const statsStrip = document.getElementById("stats-strip");
const subline = document.getElementById("subline");

const CATEGORY_COLORS = {
  "Sex Toys": "var(--cat-toys)",
  "Lingerie": "var(--cat-lingerie)",
  "Fetish & BDSM": "var(--cat-fetish)"
};

const MICRO_COPY = [
  "Discreet. Registered. Local.",
  "Pleasure, properly stocked.",
  "Find your next favourite toy without the awkward Google search."
];

const categories = ["All", ...new Set(LISTINGS.map((item) => item.category))];
const regions = ["All areas", ...new Set(LISTINGS.map((item) => item.region))];
let activeCategory = "All";
let activeRegion = "All areas";

function renderStats() {
  const onlineCount = LISTINGS.filter((item) => item.locationType === "Online" || item.locationType === "Both").length;
  statsStrip.textContent = LISTINGS.length + " registered stores \u00b7 " + onlineCount + " with nationwide delivery \u00b7 curated by Jozi Nites";
}

function rotateMicroCopy() {
  let index = 0;
  setInterval(() => {
    index = (index + 1) % MICRO_COPY.length;
    subline.style.opacity = "0";
    setTimeout(() => {
      subline.textContent = MICRO_COPY[index];
      subline.style.opacity = "1";
    }, 300);
  }, 4500);
}

function renderFeatured() {
  const featured = LISTINGS.filter((item) => item.featured);
  if (featured.length === 0) {
    featuredSection.hidden = true;
    return;
  }
  featuredRow.innerHTML = "";
  featured.forEach((item) => {
    const card = document.createElement("article");
    card.className = "featured-card";
    card.style.setProperty("--cat-color", CATEGORY_COLORS[item.category] || "var(--gold)");

    const badge = document.createElement("span");
    badge.className = "featured-badge";
    badge.textContent = "Jozi Nites recommended";

    const heading = document.createElement("h3");
    heading.textContent = item.name;

    const blurb = document.createElement("p");
    blurb.textContent = item.blurb;

    card.appendChild(badge);
    card.appendChild(heading);
    card.appendChild(blurb);
    featuredRow.appendChild(card);
  });
}

function renderChips() {
  chipRow.innerHTML = "";
  categories.forEach((category) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (category === activeCategory ? " active" : "");
    chip.textContent = category;
    chip.setAttribute("aria-pressed", category === activeCategory);
    chip.addEventListener("click", () => {
      activeCategory = category;
      renderChips();
      renderGrid();
    });
    chipRow.appendChild(chip);
  });

  cityChipRow.innerHTML = "";
  regions.forEach((region) => {
    const chip = document.createElement("button");
    chip.className = "chip chip-city" + (region === activeRegion ? " active" : "");
    chip.textContent = region;
    chip.setAttribute("aria-pressed", region === activeRegion);
    chip.addEventListener("click", () => {
      activeRegion = region;
      renderChips();
      renderGrid();
    });
    cityChipRow.appendChild(chip);
  });
}

function matchesSearch(item, query) {
  const haystack = (item.name + " " + item.blurb + " " + item.city).toLowerCase();
  return haystack.includes(query);
}

function buildCard(item, index) {
  const card = document.createElement("article");
  card.className = "card";
  card.style.animationDelay = Math.min(index * 40, 240) + "ms";
  card.style.setProperty("--cat-color", CATEGORY_COLORS[item.category] || "var(--rose)");

  const top = document.createElement("div");
  top.className = "card-top";

  const heading = document.createElement("h2");
  heading.textContent = item.name;

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = item.category;

  top.appendChild(heading);
  top.appendChild(tag);

  const metaRow = document.createElement("div");
  metaRow.className = "meta-row";

  const city = document.createElement("p");
  city.className = "city";
  city.textContent = item.city;
  metaRow.appendChild(city);

  if (item.locationType) {
    const badge = document.createElement("span");
    badge.className = "location-badge";
    badge.textContent = item.locationType === "Both" ? "Online & in-store" : item.locationType;
    metaRow.appendChild(badge);
  }

  const blurb = document.createElement("p");
  blurb.className = "blurb";
  blurb.textContent = item.blurb;

  card.appendChild(top);
  card.appendChild(metaRow);
  card.appendChild(blurb);

  if (item.website) {
    const link = document.createElement("a");
    link.className = "visit";
    link.href = item.website;
    link.textContent = "Visit site \u2192";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    card.appendChild(link);
  } else {
    const noSite = document.createElement("span");
    noSite.className = "no-site";
    noSite.textContent = "No website on file";
    card.appendChild(noSite);
  }

  return card;
}

function renderGrid() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = LISTINGS.filter((item) => {
    const categoryMatch = activeCategory === "All" || item.category === activeCategory;
    const regionMatch = activeRegion === "All areas" || item.region === activeRegion;
    const searchMatch = query === "" || matchesSearch(item, query);
    return categoryMatch && regionMatch && searchMatch;
  });

  const existingCards = Array.from(grid.children);

  if (existingCards.length === 0) {
    grid.innerHTML = "";
    filtered.forEach((item, index) => grid.appendChild(buildCard(item, index)));
    finishRender(filtered);
    return;
  }

  existingCards.forEach((card) => card.classList.add("leaving"));

  setTimeout(() => {
    grid.innerHTML = "";
    filtered.forEach((item, index) => grid.appendChild(buildCard(item, index)));
    finishRender(filtered);
  }, 180);
}

function finishRender(filtered) {
  resultCount.textContent = filtered.length === LISTINGS.length
    ? filtered.length + " listings"
    : filtered.length + " of " + LISTINGS.length + " listings";
  emptyState.hidden = filtered.length !== 0;
}

searchInput.addEventListener("input", renderGrid);

renderStats();
rotateMicroCopy();
renderFeatured();
renderChips();
renderGrid();
