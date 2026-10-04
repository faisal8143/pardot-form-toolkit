/*
 * Pardot Form Toolkit — Replace labels with placeholders
 * Moves each field's <label> text into the input's placeholder (or the first <option> of a select),
 * adds " *" for required fields, then hides the label visually (kept for screen readers).
 * Vanilla JS, no jQuery. Paste into the form's "Below Form" section or a layout template.
 */
(function () {
  function labelsToPlaceholders(root) {
    var scope = root || document;
    var labels = scope.querySelectorAll('p.pd-text label, p.pd-select label, p.pd-textarea label');

    Array.prototype.forEach.call(labels, function (label) {
      var wrapper = label.parentNode;
      var field = label.nextElementSibling;
      if (!field) return;

      var text = label.textContent.trim();
      if (wrapper.classList.contains('required')) text += ' *';

      if (field.tagName === 'SELECT') {
        if (field.options.length) field.options[0].text = text;
      } else {
        field.setAttribute('placeholder', text);
      }

      if (!field.id) field.id = 'pft-' + Math.random().toString(36).slice(2, 9);
      field.setAttribute('aria-label', text);

      // Hide visually but keep accessible
      label.style.cssText =
        'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { labelsToPlaceholders(); });
  } else {
    labelsToPlaceholders();
  }

  window.pftLabelsToPlaceholders = labelsToPlaceholders;
})();
