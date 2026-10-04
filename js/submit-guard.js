/*
 * Pardot Form Toolkit — Submit guard
 * Stops duplicate prospects and double "form success" completions caused by impatient
 * double-clicks: after the first valid submit, the button is disabled and shows a loading label.
 * If the browser blocks the submit (e.g. a required field is empty), nothing changes.
 *
 * Paste into the form's "Below Form" section.
 *
 * Options (set before this script loads):
 *   window.PFT_SUBMIT_LABEL = 'Sending…';   // text shown while submitting
 *   window.PFT_SUBMIT_RESET_MS = 15000;     // re-enable after this long, in case the network fails
 */
(function () {
  function guardForms(root) {
    var scope = root || document;
    var label = window.PFT_SUBMIT_LABEL || 'Sending…';
    var resetMs = typeof window.PFT_SUBMIT_RESET_MS === 'number' ? window.PFT_SUBMIT_RESET_MS : 15000;

    Array.prototype.forEach.call(scope.querySelectorAll('form#pardot-form'), function (form) {
      if (form.getAttribute('data-pft-guarded')) return;
      form.setAttribute('data-pft-guarded', 'true');

      form.addEventListener('submit', function (event) {
        if (form.getAttribute('data-pft-submitting')) {
          event.preventDefault();
          return;
        }
        if (event.defaultPrevented) return; // another script cancelled this submit

        form.setAttribute('data-pft-submitting', 'true');
        form.setAttribute('aria-busy', 'true');

        Array.prototype.forEach.call(
          form.querySelectorAll('input[type="submit"], button[type="submit"], button:not([type])'),
          function (btn) {
            var isInput = btn.tagName === 'INPUT';
            btn.setAttribute('data-pft-label', isInput ? btn.value : btn.textContent);
            if (isInput) btn.value = label; else btn.textContent = label;
            // Disable on the next tick so the button's own name/value is still submitted
            setTimeout(function () { btn.disabled = true; }, 0);
          }
        );

        if (resetMs > 0) {
          setTimeout(function () { resetForm(form); }, resetMs);
        }
      });
    });
  }

  function resetForm(form) {
    form.removeAttribute('data-pft-submitting');
    form.removeAttribute('aria-busy');
    Array.prototype.forEach.call(form.querySelectorAll('[data-pft-label]'), function (btn) {
      var original = btn.getAttribute('data-pft-label');
      if (btn.tagName === 'INPUT') btn.value = original; else btn.textContent = original;
      btn.removeAttribute('data-pft-label');
      btn.disabled = false;
    });
  }

  // Run now (the form is already on the page when this sits in "Below Form"),
  // and again once the page has loaded in case the form comes later. Safe to call twice.
  guardForms();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { guardForms(); });
  }

  window.pftGuardForms = guardForms;
  window.pftResetForm = resetForm;
})();
