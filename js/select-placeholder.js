/*
 * Pardot Form Toolkit — Select placeholder
 * Turns the empty first <option> of every Pardot dropdown into a disabled "Select…" prompt.
 * Vanilla JS replacement for the original jQuery snippet.
 *
 * Optional: set data-placeholder on the <select> (or window.PFT_SELECT_TEXT) to change the text.
 */
(function () {
  function addSelectPlaceholders(root) {
    var scope = root || document;
    var defaultText = window.PFT_SELECT_TEXT || 'Select…';

    Array.prototype.forEach.call(scope.querySelectorAll('form#pardot-form select'), function (select) {
      var first = select.options[0];
      if (!first || first.value !== '') return; // only touch Pardot's blank first option

      first.text = select.getAttribute('data-placeholder') || defaultText;
      first.disabled = true;
      if (select.selectedIndex <= 0) {
        first.selected = true;
        select.classList.add('pft-is-placeholder');
      }
      select.addEventListener('change', function () {
        select.classList.toggle('pft-is-placeholder', select.selectedIndex === 0);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { addSelectPlaceholders(); });
  } else {
    addSelectPlaceholders();
  }

  window.pftAddSelectPlaceholders = addSelectPlaceholders;
})();
