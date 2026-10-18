/*
  frAGILE primary navigation: a simple disclosure menu for small screens.

  Without JavaScript the toggle stays hidden and every link is visible.
  With JavaScript, the links collapse behind a real button on narrow screens.
  This script loads in <head> (not deferred) so the "js" class is set before
  first paint and the open menu never flashes on mobile.
*/
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  // Keep in sync with the menu breakpoint in fragile-theme.css (section 4).
  var MOBILE = window.matchMedia("(max-width: 760px)");

  function init() {
    var header = document.querySelector(".site-nav");
    var toggle = header && header.querySelector(".site-nav__toggle");
    var menu = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
    if (!toggle || !menu) return;

    toggle.hidden = false;

    function setOpen(open, returnFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      header.classList.toggle("is-open", open);
      if (!open && returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true", false);
    });

    // Escape closes the menu and puts focus back on the toggle.
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") return;
      setOpen(false, true);
    });

    // Following a link (including Field Notes on the homepage) closes the menu.
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false, false);
    });

    // Remember the last focused nav control. When a focused element is hidden by the
    // media query, the browser can drop focus to <body> before the change event runs,
    // so document.activeElement alone is not reliable here.
    var lastNavFocus = null;
    document.addEventListener("focusin", function (event) {
      lastNavFocus = header.contains(event.target) ? event.target : null;
    });
    document.addEventListener("pointerdown", function (event) {
      if (!header.contains(event.target)) lastNavFocus = null;
    });

    // Crossing the breakpoint always resets to closed, so the state never sticks.
    // Focus moves only if it was in the navigation and its element is about to disappear.
    function onChange() {
      var active = document.activeElement;
      if (!active || active === document.body) active = lastNavFocus;
      var linkHadFocus = menu.contains(active);
      var toggleHadFocus = active === toggle;
      setOpen(false, false);
      if (MOBILE.matches && linkHadFocus) {
        // Links collapse behind the toggle: the toggle is the visible way back to them.
        toggle.focus();
      } else if (!MOBILE.matches && toggleHadFocus) {
        // The toggle disappears: go to the current item, or the first link.
        var target = menu.querySelector("a[aria-current]") || menu.querySelector("a");
        if (target) target.focus();
      }
    }
    if (MOBILE.addEventListener) MOBILE.addEventListener("change", onChange);
    else if (MOBILE.addListener) MOBILE.addListener(onChange);

    setOpen(false, false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
