(function () {
  "use strict";

  const entries = Array.from(document.querySelectorAll(".dict-entry"));
  const search = document.getElementById("dictionary-search");
  const clear = document.getElementById("dictionary-search-clear");
  const status = document.getElementById("dictionary-status");
  const empty = document.getElementById("dictionary-empty");
  const reset = document.getElementById("dictionary-reset");
  const clearFilters = document.getElementById("dictionary-clear-filters");

  // Scope to the filter groups. Term cards also carry data-category and
  // data-letter, so an unscoped selector wires every card up as a filter.
  const categoryButtons = Array.from(document.querySelectorAll(".dict-categories [data-category]"));
  const letterButtons = Array.from(document.querySelectorAll(".dict-alphabet [data-letter]"));

  const ALL_CATEGORIES = "All terms";
  const ALL_LETTERS = "ALL";
  let category = ALL_CATEGORIES;
  let letter = ALL_LETTERS;

  // Lowercase and strip accents so search ignores diacritics.
  const normalize = (value) =>
    (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  function update() {
    const query = normalize(search.value.trim());
    let visible = 0;
    entries.forEach((entry) => {
      const matchesQuery = !query || normalize(entry.dataset.search).includes(query);
      const matchesCategory = category === ALL_CATEGORIES || entry.dataset.category === category;
      const matchesLetter = letter === ALL_LETTERS || entry.dataset.letter === letter;
      const show = matchesQuery && matchesCategory && matchesLetter;
      entry.hidden = !show;
      if (show) visible += 1;
    });
    const filtered = Boolean(query) || category !== ALL_CATEGORIES || letter !== ALL_LETTERS;
    status.textContent = filtered
      ? `Showing ${visible} of ${entries.length} terms.`
      : `Showing all ${entries.length} terms.`;
    clear.hidden = !query;
    empty.hidden = visible !== 0;
    // The empty state has its own reset button, so don't show two.
    if (clearFilters) clearFilters.hidden = !filtered || visible === 0;
  }

  function select(buttons, selected) {
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
  }

  function resetFilters({ focusSearch = true } = {}) {
    search.value = "";
    category = ALL_CATEGORIES;
    letter = ALL_LETTERS;
    select(categoryButtons, categoryButtons.find((button) => button.dataset.category === category));
    select(letterButtons, letterButtons.find((button) => button.dataset.letter === letter));
    update();
    // The button that was clicked is about to hide, so give focus somewhere sensible.
    if (focusSearch) search.focus();
  }

  search.addEventListener("input", update);
  clear.addEventListener("click", () => {
    search.value = "";
    search.focus();
    update();
  });
  categoryButtons.forEach((button) => button.addEventListener("click", () => {
    category = button.dataset.category;
    select(categoryButtons, button);
    update();
  }));
  letterButtons.forEach((button) => button.addEventListener("click", () => {
    if (button.disabled) return;
    letter = button.dataset.letter;
    select(letterButtons, button);
    update();
  }));
  reset.addEventListener("click", () => resetFilters());
  if (clearFilters) clearFilters.addEventListener("click", () => resetFilters());

  // Copy definition / copy link.
  document.addEventListener("click", async (event) => {
    const button = event.target.closest(".dict-copy");
    if (!button) return;
    const text = button.dataset.share
      ? `${location.origin}${location.pathname}#${button.dataset.share}`
      : button.dataset.copy;
    // Remember the real label once, so a double click can't save "Copied" as the label.
    if (!button.dataset.label) button.dataset.label = button.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
      window.clearTimeout(Number(button.dataset.timer));
      button.dataset.timer = String(window.setTimeout(() => {
        button.textContent = button.dataset.label;
      }, 1400));
    } catch (_) {
      window.prompt("Copy this:", text);
    }
  });

  // Shared links (#velocity) should always land on the term, even if
  // filters are hiding it at the moment the link is followed.
  function revealHash() {
    let slug;
    try { slug = decodeURIComponent(location.hash.slice(1)); }
    catch (_) { return; } // A malformed shared URL must not break the dictionary.
    if (!slug) return;
    const target = document.getElementById(slug);
    if (!target || !target.classList.contains("dict-entry")) return;
    if (target.hidden) resetFilters({ focusSearch: false });
    target.scrollIntoView({ block: "start" });
  }

  window.addEventListener("hashchange", revealHash);

  update();
  if (location.hash) window.requestAnimationFrame(revealHash);
})();
