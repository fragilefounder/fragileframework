/*
  Dictionary: collapsible Topic and First letter filters on small screens.

  Presentation only. Filtering, search, resets and copy actions all stay in
  dictionary.js; this file never changes a filter. It shows or hides the two
  filter groups behind a button and keeps a summary of the active filters on
  that button, so a collapsed panel never hides what is selected.

  Without JavaScript the button stays hidden (the controls are hidden too,
  with a note). On wider screens CSS keeps the filters open and the button hidden.
*/
(function () {
  "use strict";

  var utility = document.querySelector(".dict-utility");
  var toggle = utility && utility.querySelector(".dict-filters-toggle");
  var panel = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
  var summary = document.getElementById("dictionary-filters-summary");
  if (!toggle || !panel || !summary) return;

  // Keep in sync with the 760px breakpoint in fragile-theme.css (section 18).
  var MOBILE = window.matchMedia("(max-width: 760px)");

  function pressed(selector) {
    var button = panel.querySelector(selector + ' [aria-pressed="true"]');
    return button ? button.textContent.trim() : "";
  }

  function updateSummary() {
    var topic = pressed(".dict-categories");
    var letter = pressed(".dict-alphabet");
    var parts = [];
    parts.push(!topic || topic === "All terms" ? "All topics" : topic);
    parts.push(!letter || letter === "A–Z" ? "A–Z" : "Letter " + letter);
    summary.textContent = parts.join(" · ");
    toggle.classList.toggle("is-filtered", parts[0] !== "All topics" || parts[1] !== "A–Z");
  }

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    utility.classList.toggle("is-filters-open", open);
  }

  toggle.hidden = false;
  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // dictionary.js owns aria-pressed; watch it so the summary follows every change,
  // including resets from the empty state, clear-filters and shared term links.
  new MutationObserver(updateSummary).observe(panel, {
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-pressed"]
  });

  // Remember the last focused control in the utility bar: if the media query hides it,
  // the browser may move focus to <body> before this change handler runs.
  var lastFocus = null;
  document.addEventListener("focusin", function (event) {
    lastFocus = utility.contains(event.target) ? event.target : null;
  });
  document.addEventListener("pointerdown", function (event) {
    if (!utility.contains(event.target)) lastFocus = null;
  });

  function onChange() {
    var active = document.activeElement;
    var lost = !active || active === document.body;
    if (lost) active = lastFocus;
    if (MOBILE.matches) {
      // Collapsing would hide a focused filter, so keep the panel open in that case.
      var keep = !!active && panel.contains(active);
      setOpen(keep);
      if (keep && lost) active.focus();
    } else {
      setOpen(false);
      // The button disappears on wide screens: move focus to the selected topic.
      if (active === toggle) {
        var target = panel.querySelector('.dict-categories [aria-pressed="true"]');
        if (target) target.focus();
      }
    }
  }
  if (MOBILE.addEventListener) MOBILE.addEventListener("change", onChange);
  else if (MOBILE.addListener) MOBILE.addListener(onChange);

  updateSummary();
  setOpen(false);
  // Last step: only now may CSS collapse the filters. If anything above failed,
  // this class is never added and the filters stay expanded and usable.
  utility.classList.add("filters-ready");
})();
