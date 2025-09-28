import { attractions } from "../data/attractions.js";
import { attractionsHe } from "../data/attractions_he.js";

const SUPPORTED_LANGUAGES = ["en", "he"];
const DEFAULT_LANGUAGE = "en";
const ROAD_ACCESS_ORDER = [
  "Standard Car",
  "High-Clearance 2x4",
  "Light 4x4 (Crossover)",
  "Dedicated 4x4",
];
const SEASON_KEYS = ["Year-round", "Spring", "Summer", "Autumn", "Winter"];

const TEXT = {
  en: {
    languageName: "English",
    documentTitle: "Family Adventures in Israel",
    header: {
      title: "Family Adventures in Israel",
      tagline: "Explore kid-approved attractions, find highlights, and plan your next outing.",
    },
    filters: {
      searchLabel: "Search",
      searchPlaceholder: "Search by name, city, or highlight",
      categoryLabel: "Category",
      categoryAll: "All categories",
      roadAccessLabel: "Road access",
      roadAccessAll: "All access levels",
      seasonLabel: "Best season",
      seasonAll: "All seasons",
    },
    buttons: {
      toggleLanguageAria: "Switch site language to Hebrew",
      viewOnMap: "View on map",
    },
    categories: {
      Nature: "Nature",
      Wildlife: "Wildlife",
      Science: "Science",
      Museums: "Museums",
      "Theme Park": "Theme Park",
      "Food & Farm": "Food & Farm",
      "Desert Scenic": "Desert Scenic",
      Aquarium: "Aquarium",
      "Indoor Fun": "Indoor Fun",
      Adventure: "Adventure",
    },
    roadAccessLabels: {
      "Standard Car": "Standard car",
      "High-Clearance 2x4": "High-clearance 2x4",
      "Light 4x4 (Crossover)": "Light 4x4 (crossover)",
      "Dedicated 4x4": "Dedicated 4x4",
    },
    seasons: {
      "Year-round": "Year-round",
      Spring: "Spring",
      Summer: "Summer",
      Autumn: "Autumn",
      Winter: "Winter",
    },
    card: {
      bestSeasonLabel: "Best season",
      idealForLabel: "Ideal for",
      roadAccessLabel: "Road access",
      familyTipLabel: "Family tip",
      officialSite: "Official site",
      directions: "Get directions",
      viewOnMap: "View on map",
    },
    popup: {
      categorySeparator: "·",
    },
    emptyState: "No attractions match your filters yet. Try broadening your search.",
    footer: {
      note:
        "Map data © <a href=\"https://www.openstreetmap.org/\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> contributors · Built with <a href=\"https://leafletjs.com/\" target=\"_blank\" rel=\"noopener\">Leaflet</a>",
    },
  },
  he: {
    languageName: "עברית",
    documentTitle: "חוויות משפחתיות בישראל",
    header: {
      title: "חוויות משפחתיות בישראל",
      tagline: "גלו אתרי בילוי ידידותיים למשפחות, קבלו טיפים ותכננו את היציאה הבאה.",
    },
    filters: {
      searchLabel: "חיפוש",
      searchPlaceholder: "חיפוש לפי שם, עיר או נקודת עניין",
      categoryLabel: "קטגוריה",
      categoryAll: "כל הקטגוריות",
      roadAccessLabel: "גישה לרכב",
      roadAccessAll: "כל סוגי הרכב",
      seasonLabel: "עונה מומלצת",
      seasonAll: "כל העונות",
    },
    buttons: {
      toggleLanguageAria: "החלף את שפת האתר לאנגלית",
      viewOnMap: "תצוגה במפה",
    },
    categories: {
      Nature: "טבע",
      Wildlife: "חיות בר",
      Science: "מדע",
      Museums: "מוזיאונים",
      "Theme Park": "פארק נושא",
      "Food & Farm": "אוכל וחווה",
      "Desert Scenic": "נופי מדבר",
      Aquarium: "אקווריום",
      "Indoor Fun": "בילוי מקורה",
      Adventure: "הרפתקה",
    },
    roadAccessLabels: {
      "Standard Car": "רכב פרטי רגיל",
      "High-Clearance 2x4": "רכב מוגבה 2X4",
      "Light 4x4 (Crossover)": "ג'יפון 4X4 קל",
      "Dedicated 4x4": "רכב 4X4 קשוח",
    },
    seasons: {
      "Year-round": "כל השנה",
      Spring: "אביב",
      Summer: "קיץ",
      Autumn: "סתיו",
      Winter: "חורף",
    },
    card: {
      bestSeasonLabel: "עונה מומלצת",
      idealForLabel: "מתאים ל",
      roadAccessLabel: "גישה לרכב",
      familyTipLabel: "טיפ למשפחות",
      officialSite: "אתר רשמי",
      directions: "הוראות הגעה",
      viewOnMap: "תצוגה במפה",
    },
    popup: {
      categorySeparator: "·",
    },
    emptyState: "לא נמצאו אתרים שמתאימים לסינון. נסו להרחיב את החיפוש.",
    footer: {
      note:
        "נתוני המפה © <a href=\"https://www.openstreetmap.org/\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> · נבנה עם <a href=\"https://leafletjs.com/\" target=\"_blank\" rel=\"noopener\">Leaflet</a>",
    },
  },
};

const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: true,
}).setView([31.5, 34.8], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors",
  maxZoom: 18,
}).addTo(map);

const markerGroup = L.layerGroup().addTo(map);
const markerMap = new Map();

const listElement = document.getElementById("attraction-list");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const roadAccessFilter = document.getElementById("road-access-filter");
const seasonFilter = document.getElementById("season-filter");
const siteTitle = document.getElementById("site-title");
const siteTagline = document.getElementById("site-tagline");
const labelSearch = document.getElementById("label-search");
const labelCategory = document.getElementById("label-category");
const labelRoadAccess = document.getElementById("label-road-access");
const labelSeason = document.getElementById("label-season");
const footerNote = document.getElementById("footer-note");
const languageToggle = document.getElementById("language-toggle");

let currentLanguage = localStorage.getItem("language") ?? DEFAULT_LANGUAGE;
if (!SUPPORTED_LANGUAGES.includes(currentLanguage)) {
  currentLanguage = DEFAULT_LANGUAGE;
}

let localizedAttractions = buildLocalizedAttractions(currentLanguage);

applyLanguage();
populateCategoryOptions();
populateRoadAccessOptions();
populateSeasonOptions();
attachEventHandlers();
refreshResults();

function buildLocalizedAttractions(language) {
  const translationSource = language === "he" ? attractionsHe : undefined;
  return attractions.map((item) => {
    const translation = translationSource?.[item.id] ?? {};
    return {
      ...item,
      display: {
        name: translation.name ?? item.name,
        city: translation.city ?? item.city,
        description: translation.description ?? item.description,
        highlights: translation.highlights ?? item.highlights,
        bestSeason: translation.bestSeason ?? item.bestSeason,
        suitableFor: translation.suitableFor ?? item.suitableFor,
      },
    };
  });
}

function getStrings() {
  return TEXT[currentLanguage];
}

function applyLanguage() {
  const strings = getStrings();
  document.documentElement.lang = currentLanguage;
  document.body.setAttribute("dir", currentLanguage === "he" ? "rtl" : "ltr");
  document.title = strings.documentTitle;
  siteTitle.textContent = strings.header.title;
  siteTagline.textContent = strings.header.tagline;
  labelSearch.textContent = strings.filters.searchLabel;
  labelCategory.textContent = strings.filters.categoryLabel;
  labelRoadAccess.textContent = strings.filters.roadAccessLabel;
  labelSeason.textContent = strings.filters.seasonLabel;
  searchInput.placeholder = strings.filters.searchPlaceholder;
  searchInput.setAttribute("aria-label", strings.filters.searchLabel);
  footerNote.innerHTML = strings.footer.note;

  const nextLanguage = currentLanguage === "en" ? "he" : "en";
  languageToggle.textContent = TEXT[nextLanguage].languageName;
  languageToggle.setAttribute("aria-label", strings.buttons.toggleLanguageAria);
}

function populateCategoryOptions(selectedValue = categoryFilter.value) {
  const strings = getStrings();
  const categories = Array.from(new Set(attractions.map((item) => item.category))).sort();
  categoryFilter.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = strings.filters.categoryAll;
  categoryFilter.append(defaultOption);

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = strings.categories[category] ?? category;
    categoryFilter.append(option);
  }

  setSelectValue(categoryFilter, selectedValue);
}

function populateRoadAccessOptions(selectedValue = roadAccessFilter.value) {
  const strings = getStrings();
  const levels = Array.from(new Set(attractions.map((item) => item.roadAccess).filter(Boolean))).sort(
    (a, b) => getRoadAccessIndex(a) - getRoadAccessIndex(b)
  );

  roadAccessFilter.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = strings.filters.roadAccessAll;
  roadAccessFilter.append(defaultOption);

  for (const level of levels) {
    const option = document.createElement("option");
    option.value = level;
    option.textContent = strings.roadAccessLabels[level] ?? level;
    roadAccessFilter.append(option);
  }

  setSelectValue(roadAccessFilter, selectedValue);
}

function populateSeasonOptions(selectedValue = seasonFilter.value) {
  const strings = getStrings();
  seasonFilter.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = strings.filters.seasonAll;
  seasonFilter.append(defaultOption);

  for (const season of SEASON_KEYS) {
    const option = document.createElement("option");
    option.value = season;
    option.textContent = strings.seasons[season] ?? season;
    seasonFilter.append(option);
  }

  setSelectValue(seasonFilter, selectedValue);
}

function attachEventHandlers() {
  searchInput.addEventListener("input", refreshResults);
  categoryFilter.addEventListener("change", refreshResults);
  roadAccessFilter.addEventListener("change", refreshResults);
  seasonFilter.addEventListener("change", refreshResults);
  languageToggle.addEventListener("click", toggleLanguage);
}

function toggleLanguage() {
  const nextLanguage = currentLanguage === "en" ? "he" : "en";
  setLanguage(nextLanguage);
}

function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language) || language === currentLanguage) {
    return;
  }

  const previousSelections = {
    category: categoryFilter.value,
    road: roadAccessFilter.value,
    season: seasonFilter.value,
  };
  const previousQuery = searchInput.value;

  currentLanguage = language;
  localStorage.setItem("language", currentLanguage);
  localizedAttractions = buildLocalizedAttractions(currentLanguage);
  applyLanguage();
  populateCategoryOptions(previousSelections.category);
  populateRoadAccessOptions(previousSelections.road);
  populateSeasonOptions(previousSelections.season);
  searchInput.value = previousQuery;
  refreshResults();
}

function refreshResults() {
  const strings = getStrings();
  const query = searchInput.value.trim().toLowerCase();
  const categoryValue = categoryFilter.value;
  const roadAccessValue = roadAccessFilter.value;
  const seasonValue = seasonFilter.value;

  const filtered = localizedAttractions.filter((item) => {
    const matchesCategory = categoryValue === "all" || item.category === categoryValue;
    const matchesAccess = roadAccessValue === "all" || item.roadAccess === roadAccessValue;
    const matchesSeason =
      seasonValue === "all" || item.bestSeason.toLowerCase().includes(seasonValue.toLowerCase());
    if (!matchesCategory || !matchesAccess || !matchesSeason) {
      return false;
    }

    if (!query) {
      return true;
    }

    const display = item.display;
    const haystack = [
      item.name,
      display.name,
      item.city,
      display.city,
      item.category,
      strings.categories[item.category] ?? item.category,
      item.bestSeason,
      display.bestSeason,
      item.suitableFor,
      display.suitableFor,
      item.roadAccess ?? "",
      strings.roadAccessLabels[item.roadAccess] ?? item.roadAccess,
      ...item.highlights,
      ...(display.highlights ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  renderAttractions(filtered);
}

function renderAttractions(list) {
  const strings = getStrings();
  listElement.innerHTML = "";
  markerGroup.clearLayers();
  markerMap.clear();

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = strings.emptyState;
    listElement.append(empty);
    return;
  }

  const bounds = L.latLngBounds([]);

  for (const item of list) {
    createAttractionCard(item, strings);
    const marker = createMarker(item, strings);
    markerGroup.addLayer(marker);
    markerMap.set(item.id, marker);
    bounds.extend([item.lat, item.lng]);
  }

  if (list.length === 1) {
    map.setView([list[0].lat, list[0].lng], 11);
  } else {
    map.fitBounds(bounds.pad(0.15));
  }
}

function createMarker(attraction, strings) {
  const display = attraction.display;
  const marker = L.marker([attraction.lat, attraction.lng]);
  const highlightList = (display.highlights ?? [])
    .map((highlight) => `<li>${escapeHtml(highlight)}</li>`)
    .join("");
  const categoryLabel = strings.categories[attraction.category] ?? attraction.category;
  const roadAccessLabel = strings.roadAccessLabels[attraction.roadAccess] ?? attraction.roadAccess;

  const popupHtml = `
    <article class="popup">
      <h3>${escapeHtml(display.name)}</h3>
      <p><strong>${escapeHtml(display.city)}</strong> ${escapeHtml(strings.popup.categorySeparator)} ${escapeHtml(
        categoryLabel
      )}</p>
      <p>${escapeHtml(display.description)}</p>
      <ul>${highlightList}</ul>
      <p><strong>${escapeHtml(strings.card.bestSeasonLabel)}:</strong> ${escapeHtml(display.bestSeason)}</p>
      <p><strong>${escapeHtml(strings.card.familyTipLabel)}:</strong> ${escapeHtml(display.suitableFor)}</p>
      <p><strong>${escapeHtml(strings.card.roadAccessLabel)}:</strong> ${escapeHtml(roadAccessLabel)}</p>
      <p>
        <a href="${attraction.website}" target="_blank" rel="noopener">${escapeHtml(strings.card.officialSite)}</a> ·
        <a href="${attraction.directionsUrl}" target="_blank" rel="noopener">${escapeHtml(strings.card.directions)}</a>
      </p>
    </article>
  `;

  marker.bindPopup(popupHtml, { maxWidth: 320 });

  marker.on("click", () => {
    focusCard(attraction.id);
  });

  return marker;
}

function createAttractionCard(attraction, strings) {
  const display = attraction.display;
  const categoryLabel = strings.categories[attraction.category] ?? attraction.category;
  const roadAccessLabel = strings.roadAccessLabels[attraction.roadAccess] ?? attraction.roadAccess;
  const card = document.createElement("article");
  card.className = "attraction-card";
  card.tabIndex = 0;
  card.setAttribute("role", "listitem");
  card.dataset.id = attraction.id;

  card.innerHTML = `
    <div class="card-header">
      <h2>${escapeHtml(display.name)}</h2>
      <span>${escapeHtml(display.city)} · ${escapeHtml(categoryLabel)}</span>
    </div>
    <div class="card-body">
      <p>${escapeHtml(display.description)}</p>
      <p><strong>${escapeHtml(strings.card.bestSeasonLabel)}:</strong> ${escapeHtml(display.bestSeason)} | <strong>${escapeHtml(
        strings.card.idealForLabel
      )}:</strong> ${escapeHtml(display.suitableFor)}</p>
      <p><strong>${escapeHtml(strings.card.roadAccessLabel)}:</strong> ${escapeHtml(roadAccessLabel)}</p>
      <div class="highlight-tags">
        ${(display.highlights ?? []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
    </div>
    <div class="card-links">
      <a href="${attraction.website}" target="_blank" rel="noopener">${escapeHtml(strings.card.officialSite)}</a>
      <a href="${attraction.directionsUrl}" target="_blank" rel="noopener">${escapeHtml(strings.card.directions)}</a>
      <button type="button" class="zoom-button" data-id="${attraction.id}">${escapeHtml(strings.card.viewOnMap)}</button>
    </div>
  `;

  card.querySelector(".zoom-button").addEventListener("click", () => {
    zoomToAttraction(attraction.id);
  });

  card.addEventListener("keypress", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      zoomToAttraction(attraction.id);
    }
  });

  listElement.append(card);
}

function zoomToAttraction(id) {
  const marker = markerMap.get(id);
  if (!marker) {
    return;
  }

  marker.openPopup();
  map.flyTo(marker.getLatLng(), 12, { duration: 0.8 });
  focusCard(id);
}

function focusCard(id) {
  const card = listElement.querySelector(`[data-id="${id}"]`);
  if (!card) {
    return;
  }

  card.scrollIntoView({ behavior: "smooth", block: "center" });
  card.classList.add("is-active");
  window.setTimeout(() => card.classList.remove("is-active"), 2000);
}

function getRoadAccessIndex(level) {
  const index = ROAD_ACCESS_ORDER.indexOf(level);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function setSelectValue(select, value) {
  if (value && Array.from(select.options).some((option) => option.value === value)) {
    select.value = value;
  } else {
    select.value = "all";
  }
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
