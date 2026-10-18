/* Local editing only. Dispatch the existing input event for counts and stale results.
   Never retain text outside this page, reset the form, or initiate an assessment. */
(function () {
  "use strict";
  var input = document.getElementById("rc-input");
  var clear = document.getElementById("rc-clear");
  var undo = document.getElementById("rc-undo-clear");
  var status = document.getElementById("rc-clear-status");
  var saved = null;
  function sync() {
    var locked = input.readOnly || input.disabled;
    clear.disabled = locked || input.value.length === 0;
    undo.disabled = locked;
    undo.hidden = saved === null;
  }
  function apply(value, start, end) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
    input.setSelectionRange(start, end);
    sync();
  }
  input.addEventListener("input", function () {
    saved = null;
    status.textContent = "";
    sync();
  });
  clear.addEventListener("click", function () {
    if (clear.disabled || input.readOnly || input.disabled) return;
    var previous = { value: input.value, start: input.selectionStart, end: input.selectionEnd };
    apply("", 0, 0);
    saved = previous;
    sync();
    status.textContent = "Backlog item cleared. Undo clear is available until you type a new item.";
  });
  undo.addEventListener("click", function () {
    if (!saved || input.readOnly || input.disabled) return;
    var previous = saved;
    apply(previous.value, previous.start, previous.end);
    status.textContent = "Backlog item restored.";
  });
  new MutationObserver(sync).observe(input, { attributes: true, attributeFilter: ["readonly", "disabled"] });
  document.getElementById("rc-input-actions").hidden = false;
  sync();
})();
