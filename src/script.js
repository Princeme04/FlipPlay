const API_URL = "https://kitsu.io/api/edge/anime?page%5Blimit%5D=20&include=genres";
const FLIPPLAY_API_URL = "http://127.0.0.1:8000/api";

const animeGrid = document.querySelector("#anime-grid");
const searchInput = document.querySelector("#search-media");
const resultCount = document.querySelector("#result-count");
const auraButtons = document.querySelectorAll(".aura-button");
const bookSliders = document.querySelectorAll("[data-book-format]");
const animeDiscoveryEnabled = Boolean(animeGrid && searchInput && resultCount);

const auraGenres = {
  energy: ["action", "adventure", "sports", "comedy"],
  melancholy: ["drama", "romance", "slice of life", "psychological"],
};

let animeList = [];
let activeAura = "";
let isLoading = true;
let hasLoadError = false;
let books = [];
let isBooksLoading = true;
let hasBooksError = false;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function getAnimeTitle(anime) {
  return anime.title || "Untitled anime";
}

function matchesAura(anime, aura) {
  if (!aura) return true;

  if (aura === "energy" || aura === "melancholy") {
    return anime.genres.some((genre) => auraGenres[aura].includes(genre));
  }

  if (aura === "binge") {
    return anime.type === "TV" || (anime.episodes !== null && anime.episodes >= 24);
  }

  return true;
}

function renderAnime() {
  if (!animeDiscoveryEnabled || isLoading || hasLoadError) return;

  const query = (searchInput?.value || "").trim().toLocaleLowerCase();
  const filteredAnime = animeList.filter((anime) => {
    const titleMatches = getAnimeTitle(anime).toLocaleLowerCase().includes(query);
    return titleMatches && matchesAura(anime, activeAura);
  });

  resultCount.textContent = `${filteredAnime.length} ${filteredAnime.length === 1 ? "title" : "titles"}`;

  if (filteredAnime.length === 0) {
    animeGrid.innerHTML = '<p class="anime-state">No anime found. Coba judul atau aura yang lain.</p>';
    return;
  }

  animeGrid.innerHTML = filteredAnime
    .map((anime) => {
      const title = escapeHTML(getAnimeTitle(anime));
      const image = escapeHTML(anime.image || "");
      const score = Number.isFinite(anime.score)
        ? `<span class="anime-grid-score"><span class="anime-grid-score-star" aria-hidden="true">★</span> ${anime.score.toFixed(1)}</span>`
        : "";
      const year = Number.isFinite(anime.year) ? anime.year : "";
      const episodes = Number.isFinite(anime.episodes)
        ? `<span class="anime-grid-episodes">${anime.episodes} eps</span>`
        : "";
      const meta = [escapeHTML(anime.type), episodes, year ? escapeHTML(year) : ""]
        .filter(Boolean)
        .join(' <span class="anime-grid-meta-separator" aria-hidden="true">�</span> ');

      return `
        <article class="anime-grid-card">
          <div class="anime-grid-poster-wrap">
            <img class="anime-grid-poster" src="${image}" alt="Poster ${title}" loading="lazy" />
            ${score}
          </div>
          <h3 class="anime-grid-title" title="${title}">${title}</h3>
          <p class="anime-grid-meta">${meta || "Anime"}</p>
        </article>
      `;
    })
    .join("");
}

function renderBooks() {
  if (isBooksLoading || hasBooksError) return;

  const query = (searchInput?.value || "").trim().toLocaleLowerCase();
  bookSliders.forEach((slider) => {
    const format = slider.dataset.bookFormat;
    const isFeatured = format === "all";
    const filteredBooks = books.filter((book) => {
      const matchesFormat = format === "all" || book.format === format;
      const searchable = `${book.title} ${book.creator || ""} ${book.genre || ""}`.toLocaleLowerCase();
      return matchesFormat && searchable.includes(query);
    });

    if (filteredBooks.length === 0) {
      slider.innerHTML = '<p class="px-2 py-3 text-sm text-neutral-500">No books found.</p>';
      return;
    }

    slider.innerHTML = filteredBooks.map((book) => {
      const title = escapeHTML(book.title);
      const creator = escapeHTML(book.creator || "Unknown author");
      const genre = escapeHTML(book.genre || "Book");
      const cover = escapeHTML(book.cover || "");
      const year = Number.isFinite(book.year) ? book.year : "";
      const cardWidth = isFeatured
        ? "w-[140px] sm:w-[165px] md:w-[178px]"
        : "w-[105px] sm:w-[125px] md:w-[138px] lg:w-[145px]";
      const borderColor = isFeatured ? "border-neutral-800" : "border-neutral-300";
      const textColor = isFeatured ? "text-white" : "text-neutral-900";
      const creatorColor = isFeatured ? "text-neutral-400" : "text-neutral-500";

      return `
        <article class="flex flex-col shrink-0 ${cardWidth} group cursor-pointer">
          <div class="relative aspect-[2/3] bg-neutral-900 overflow-hidden rounded-sm border ${borderColor} shadow-sm">
            <img src="${cover}" alt="Cover of ${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pt-4 pb-1 px-1.5 flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-white">
              <span>${escapeHTML(book.format === "manga" ? "Manga" : "Book")}</span>${year ? `<span>${year}</span>` : ""}
            </div>
          </div>
          <span class="mt-1 text-[10px] sm:text-[11px] ${creatorColor} font-semibold truncate leading-none">${genre} · ${creator}</span>
          <h3 class="mt-0.5 text-[11px] sm:text-xs md:text-sm font-bold ${textColor} truncate group-hover:text-[#c81062] transition-colors leading-tight" title="${title}">${title}</h3>
        </article>
      `;
    }).join("");
  });
}

function showState(message, isError = false) {
  if (!animeDiscoveryEnabled) return;
  animeGrid.innerHTML = `<p class="anime-state${isError ? " is-error" : ""}" role="status">${escapeHTML(message)}</p>`;
  resultCount.textContent = "";
}

async function loadAnime() {
  if (!animeDiscoveryEnabled) return;
  animeGrid.setAttribute("aria-busy", "true");
  showState("Loading anime...");
  let loadError = "";

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Kitsu API returned ${response.status}`);
    }

    const result = await response.json();
    if (!Array.isArray(result.data)) {
      throw new Error("The Kitsu API response did not contain an anime list.");
    }

    const includedGenres = new Map(
      (result.included || [])
        .filter((resource) => resource.type === "genres")
        .map((genre) => [genre.id, genre.attributes.name.toLocaleLowerCase()]),
    );

    animeList = result.data.map((item) => {
      const attributes = item.attributes || {};
      const titles = attributes.titles || {};
      const rating = Number.parseFloat(attributes.averageRating);

      return {
        title: titles.en || titles.en_jp || titles.canonical || attributes.canonicalTitle || "Untitled anime",
        image:
          attributes.posterImage?.large ||
          attributes.posterImage?.original ||
          attributes.posterImage?.medium ||
          "",
        score: Number.isFinite(rating) ? rating / 10 : null,
        type: attributes.subtype || "",
        episodes: attributes.episodeCount,
        year: attributes.startDate ? Number(attributes.startDate.slice(0, 4)) : null,
        genres: (item.relationships?.genres?.data || [])
          .map((genre) => includedGenres.get(genre.id))
          .filter(Boolean),
      };
    });
  } catch (error) {
    console.error("Unable to load anime from Kitsu API:", error);
    hasLoadError = true;
    loadError = "Anime belum dapat dimuat. Periksa koneksi internet lalu muat ulang halaman.";
  } finally {
    isLoading = false;
    animeGrid.setAttribute("aria-busy", "false");
  }

  if (loadError) {
    showState(loadError, true);
  } else {
    renderAnime();
  }
}

async function loadBooks() {
  let loadError = "";
  bookSliders.forEach((slider) => {
    slider.setAttribute("aria-busy", "true");
    slider.innerHTML = '<p class="px-2 py-3 text-sm text-neutral-500">Loading books...</p>';
  });

  try {
    const response = await fetch(`${FLIPPLAY_API_URL}/media?per_page=100`);
    if (!response.ok) {
      throw new Error(`FlipPlay API returned ${response.status}`);
    }

    const result = await response.json();
    if (!Array.isArray(result.data)) {
      throw new Error("FlipPlay API response did not contain a media list.");
    }

    books = result.data
      .filter((item) => item.type === "book")
      .map((item) => ({
        title: item.title,
        creator: item.creator,
        format: item.format || "novel",
        genre: item.genre || "",
        cover: item.cover_url ? new URL(item.cover_url, FLIPPLAY_API_URL).href : "",
        year: item.release_year,
      }))
      .filter((book) => book.cover);
  } catch (error) {
    console.error("Unable to load the FlipPlay book catalog:", error);
    hasBooksError = true;
    loadError = "Buku belum dapat dimuat. Pastikan API berjalan dan database sudah di-migrate --seed.";
  } finally {
    isBooksLoading = false;
    bookSliders.forEach((slider) => {
      slider.setAttribute("aria-busy", "false");
    });
  }

  if (loadError) {
    bookSliders.forEach((slider) => {
      slider.innerHTML = `<p class="px-2 py-3 text-sm text-red-700" role="status">${escapeHTML(loadError)}</p>`;
    });
  } else {
    renderBooks();
  }
}

searchInput?.addEventListener("input", () => {
  renderAnime();
  renderBooks();
});

auraButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedAura = button.dataset.aura;
    activeAura = activeAura === selectedAura ? "" : selectedAura;

    auraButtons.forEach((auraButton) => {
      auraButton.setAttribute("aria-pressed", String(auraButton.dataset.aura === activeAura));
    });

    renderAnime();
  });
});

searchInput?.form?.addEventListener("submit", (event) => {
  event.preventDefault();
});

loadAnime();
loadBooks();
