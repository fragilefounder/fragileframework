(function () {
  "use strict";

  const entries = Array.from(document.querySelectorAll(".dict-entry"));
  const search = document.getElementById("dictionary-search");
  const clear = document.getElementById("dictionary-search-clear");
  const status = document.getElementById("dictionary-status");
  const empty = document.getElementById("dictionary-empty");
  const reset = document.getElementById("dictionary-reset");
  const categoryButtons = Array.from(document.querySelectorAll("[data-category]"));
  const letterButtons = Array.from(document.querySelectorAll("[data-letter]"));
  let category = "All terms";
  let letter = "ALL";

  function update() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    entries.forEach((entry) => {
      const matchesQuery = !query || entry.dataset.search.includes(query);
      const matchesCategory = category === "All terms" || entry.dataset.category === category;
      const matchesLetter = letter === "ALL" || entry.dataset.letter === letter;
      const show = matchesQuery && matchesCategory && matchesLetter;
      entry.hidden = !show;
      if (show) visible += 1;
    });
    const filtered = query || category !== "All terms" || letter !== "ALL";
    status.textContent = filtered
      ? `Showing ${visible} of ${entries.length} terms.`
      : `Showing all ${entries.length} terms.`;
    clear.hidden = !query;
    empty.hidden = visible !== 0;
  }

  function select(buttons, selected) {
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
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
    letter = button.dataset.letter;
    select(letterButtons, button);
    update();
  }));
  reset.addEventListener("click", () => {
    search.value = "";
    category = "All terms";
    letter = "ALL";
    select(categoryButtons, categoryButtons.find((button) => button.dataset.category === category));
    select(letterButtons, letterButtons.find((button) => button.dataset.letter === letter));
    update();
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest(".dict-copy");
    if (!button) return;
    const text = button.dataset.share
      ? `${location.origin}${location.pathname}#${button.dataset.share}`
      : button.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      const previous = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => { button.textContent = previous; }, 1400);
    } catch (_) {
      window.prompt("Copy this:", text);
    }
  });

  update();
})();
