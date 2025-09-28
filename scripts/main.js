import { attractions } from "../data/attractions.js";

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

populateCategoryOptions();
populateRoadAccessOptions();
renderAttractions(attractions);
attachEventHandlers();

function populateCategoryOptions() {
  const categories = Array.from(new Set(attractions.map((item) => item.category))).sort();
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  }
}

function populateRoadAccessOptions() {
  const order = new Map(
    [
      "Standard Car",
      "High-Clearance 2x4",
      "Light 4x4 (Crossover)",
      "Dedicated 4x4",
    ].map((label, index) => [label, index])
  );

  const levels = Array.from(new Set(attractions.map((item) => item.roadAccess).filter(Boolean))).sort(
    (a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER)
  );

  for (const level of levels) {
    const option = document.createElement("option");
    option.value = level;
    option.textContent = level;
    roadAccessFilter.append(option);
  }
}

function attachEventHandlers() {
  searchInput.addEventListener("input", refreshResults);
  categoryFilter.addEventListener("change", refreshResults);
  roadAccessFilter.addEventListener("change", refreshResults);
  seasonFilter.addEventListener("change", refreshResults);
}

function refreshResults() {
  const query = searchInput.value.trim().toLowerCase();
  const categoryValue = categoryFilter.value;
  const roadAccessValue = roadAccessFilter.value;
  const seasonValue = seasonFilter.value;

  const filtered = attractions.filter((item) => {
    const matchesCategory = categoryValue === "all" || item.category === categoryValue;
    const matchesAccess = roadAccessValue === "all" || item.roadAccess === roadAccessValue;
    const matchesSeason = seasonValue === "all" || item.bestSeason.toLowerCase().includes(seasonValue.toLowerCase());
    if (!matchesCategory || !matchesAccess || !matchesSeason) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      item.name,
      item.city,
      item.category,
      item.bestSeason,
      item.suitableFor,
      item.roadAccess ?? "",
      ...item.highlights,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  renderAttractions(filtered);
}

function renderAttractions(list) {
  listElement.innerHTML = "";
  markerGroup.clearLayers();
  markerMap.clear();

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No attractions match your filters yet. Try broadening your search.";
    listElement.append(empty);
    return;
  }

  const bounds = L.latLngBounds([]);

  for (const item of list) {
    createAttractionCard(item);
    const marker = createMarker(item);
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

function createMarker(attraction) {
  const marker = L.marker([attraction.lat, attraction.lng]);
  const highlightList = attraction.highlights
    .map((highlight) => `<li>${escapeHtml(highlight)}</li>`)
    .join("");

  const popupHtml = `
    <article class="popup">
      <h3>${escapeHtml(attraction.name)}</h3>
      <p><strong>${escapeHtml(attraction.city)}</strong> · ${escapeHtml(attraction.category)}</p>
      <p>${escapeHtml(attraction.description)}</p>
      <ul>${highlightList}</ul>
      <p><strong>Best season:</strong> ${escapeHtml(attraction.bestSeason)}</p>
      <p><strong>Family tip:</strong> ${escapeHtml(attraction.suitableFor)}</p>
      <p><strong>Road access:</strong> ${escapeHtml(attraction.roadAccess ?? "Standard Car")}</p>
      <p>
        <a href="${attraction.website}" target="_blank" rel="noopener">Official site</a> ·
        <a href="${attraction.directionsUrl}" target="_blank" rel="noopener">Directions</a>
      </p>
    </article>
  `;

  marker.bindPopup(popupHtml, { maxWidth: 320 });

  marker.on("click", () => {
    focusCard(attraction.id);
  });

  return marker;
}

function createAttractionCard(attraction) {
  const card = document.createElement("article");
  card.className = "attraction-card";
  card.tabIndex = 0;
  card.setAttribute("role", "listitem");
  card.dataset.id = attraction.id;

  card.innerHTML = `
    <div class="card-header">
      <h2>${escapeHtml(attraction.name)}</h2>
      <span>${escapeHtml(attraction.city)} · ${escapeHtml(attraction.category)}</span>
    </div>
    <div class="card-body">
      <p>${escapeHtml(attraction.description)}</p>
      <p><strong>Best season:</strong> ${escapeHtml(attraction.bestSeason)} | <strong>Ideal for:</strong> ${escapeHtml(
        attraction.suitableFor
      )}</p>
      <p><strong>Road access:</strong> ${escapeHtml(attraction.roadAccess ?? "Standard Car")}</p>
      <div class="highlight-tags">
        ${attraction.highlights.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
    </div>
    <div class="card-links">
      <a href="${attraction.website}" target="_blank" rel="noopener">Official site</a>
      <a href="${attraction.directionsUrl}" target="_blank" rel="noopener">Get directions</a>
      <button type="button" class="zoom-button" data-id="${attraction.id}">View on map</button>
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

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
