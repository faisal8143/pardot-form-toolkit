/*
 * Pardot Form Toolkit — Field attributes
 * Adds HTML5 attributes Pardot doesn't expose in the form editor:
 * native `required`, custom placeholders, maxlength, input types and autocomplete hints.
 * Vanilla JS replacement for the original jQuery snippet.
 *
 * Edit FIELD_CONFIG to match your form. Keys are the CSS class Pardot puts on the field's <p>
 * (usually the field's API name, e.g. first_name, email, company).
 */
(function () {
  var FIELD_CONFIG = {
    first_name: { placeholder: 'Type your first name here', maxlength: 50, autocomplete: 'given-name' },
    last_name:  { placeholder: 'Type your last name here',  maxlength: 50, autocomplete: 'family-name' },
    email:      { placeholder: 'example@example.com', type: 'email', autocomplete: 'email' },
    phone:      { placeholder: 'Type your phone number here', type: 'tel', autocomplete: 'tel' },
    company:    { autocomplete: 'organization' }
  };

  function applyFieldAttributes(root) {
    var scope = root || document;

    // Native browser validation for every required field
    Array.prototype.forEach.call(
      scope.querySelectorAll('p.required input, p.required select, p.required textarea'),
      function (el) { if (el.type !== 'hidden') el.required = true; }
    );

    Object.keys(FIELD_CONFIG).forEach(function (cls) {
      var field = scope.querySelector('p.' + cls + ' input, p.' + cls + ' textarea, p.' + cls + ' select');
      if (!field) return;
      var cfg = FIELD_CONFIG[cls];
      Object.keys(cfg).forEach(function (attr) { field.setAttribute(attr, cfg[attr]); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyFieldAttributes(); });
  } else {
    applyFieldAttributes();
  }

  window.pftApplyFieldAttributes = applyFieldAttributes;
})();
