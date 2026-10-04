/*
 * Pardot Form Toolkit — UTM & click-ID hidden fields
 * Copies campaign parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content,
 * gclid, fbclid, msclkid, li_fat_id) from the page URL into matching hidden fields on a
 * Account Engagement (Pardot) form, so every prospect is saved with its original source.
 *
 * Setup in Account Engagement:
 *   1. Create custom prospect fields (e.g. utm_source, gclid).
 *   2. Add them to the form as Hidden fields. Pardot gives each field's <p> a class with the
 *      field name, e.g. <p class="form-field utm_source pd-hidden">.
 *   3. Paste this script into the form's "Below Form" section (or the layout template).
 *
 * First-touch attribution: values are kept for the browser session (sessionStorage), so a prospect
 * who lands with UTMs, browses, then submits later in the same visit is still attributed.
 * Values passed in the URL always win over stored ones.
 *
 * Embedded in an iframe? Use js/iframe-embed-parent.js on the host page — it forwards the host
 * page's query string to the iframe so this script can read it.
 *
 * Options (set before this script loads):
 *   window.PFT_UTM_PARAMS = ['utm_source', 'my_custom_param'];   // which params to capture
 *   window.PFT_UTM_FIELD_MAP = { gclid: 'google_click_id' };      // param -> field class name
 *   window.PFT_UTM_PERSIST = false;                               // turn off session storage
 */
(function () {
  var DEFAULT_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'fbclid', 'msclkid', 'li_fat_id'
  ];
  var STORAGE_KEY = 'pft_utm';

  function readStored() {
    try { return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function writeStored(values) {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values)); }
    catch (e) { /* storage blocked: ignore */ }
  }

  function readUrlParams(params, search) {
    var found = {};
    var query = (search || window.location.search || '').replace(/^\?/, '');
    if (!query) return found;

    query.split('&').forEach(function (pair) {
      if (!pair) return;
      var idx = pair.indexOf('=');
      var key = decodeURIComponent((idx < 0 ? pair : pair.slice(0, idx)).replace(/\+/g, ' ')).toLowerCase();
      var value = idx < 0 ? '' : decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' '));
      if (params.indexOf(key) !== -1 && value) found[key] = value.slice(0, 255);
    });
    return found;
  }

  function findField(scope, className) {
    var safe = String(className).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safe) return null;
    return scope.querySelector('p.' + safe + ' input, p.' + safe + ' textarea');
  }

  function applyUtmFields(root, search) {
    var scope = root || document;
    var params = (window.PFT_UTM_PARAMS || DEFAULT_PARAMS).map(function (p) { return String(p).toLowerCase(); });
    var fieldMap = window.PFT_UTM_FIELD_MAP || {};
    var persist = window.PFT_UTM_PERSIST !== false;

    var fromUrl = readUrlParams(params, search);
    var values = persist ? readStored() : {};
    Object.keys(fromUrl).forEach(function (k) { values[k] = fromUrl[k]; });
    if (persist && Object.keys(fromUrl).length) writeStored(values);

    var filled = {};
    params.forEach(function (param) {
      if (!values[param]) return;
      var field = findField(scope, fieldMap[param] || param);
      if (!field || field.value) return; // never overwrite a value Pardot pre-filled
      field.value = values[param];
      filled[param] = values[param];
    });
    return filled;
  }

  // Run now (the form is already on the page when this sits in "Below Form"),
  // and again once the page has loaded in case the form comes later. Safe to call twice.
  applyUtmFields();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyUtmFields(); });
  }

  window.pftApplyUtmFields = applyUtmFields;
})();
