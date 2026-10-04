/*
 * Pardot Form Toolkit — iframe embed helper (host page side)
 * Put this on the WEBSITE page that embeds an Account Engagement form. It:
 *   1. Auto-resizes the iframe to fit the form (needs js/iframe-resize-child.js inside the form).
 *   2. Forwards the page's UTM / click-ID parameters to the iframe URL, so
 *      js/utm-hidden-fields.js inside the form can save them on the prospect.
 *
 * Markup:
 *   <iframe data-pardot-form src="https://go.example.com/l/12345/2026-01-01/abcde"
 *           width="100%" height="500" style="border:0" title="Contact form"></iframe>
 *   <script src="iframe-embed-parent.js"></script>
 *
 * Option (set before this script loads):
 *   window.PFT_FORWARD_PARAMS = false;   // don't forward query parameters
 */
(function () {
  var FORWARD = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'fbclid', 'msclkid', 'li_fat_id'
  ];

  function originOf(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.protocol + '//' + a.host;
  }

  function forwardParams(src) {
    if (window.PFT_FORWARD_PARAMS === false) return src;
    var query = window.location.search.replace(/^\?/, '');
    if (!query) return src;

    var extra = query.split('&').filter(function (pair) {
      var key = decodeURIComponent(pair.split('=')[0] || '').toLowerCase();
      return FORWARD.indexOf(key) !== -1 && src.indexOf(key + '=') === -1;
    });
    if (!extra.length) return src;

    var hashIdx = src.indexOf('#');
    var hash = hashIdx < 0 ? '' : src.slice(hashIdx);
    var base = hashIdx < 0 ? src : src.slice(0, hashIdx);
    return base + (base.indexOf('?') < 0 ? '?' : '&') + extra.join('&') + hash;
  }

  function setup() {
    var frames = document.querySelectorAll('iframe[data-pardot-form]');

    Array.prototype.forEach.call(frames, function (frame, index) {
      if (frame.getAttribute('data-pft-id')) return;
      var id = 'pft-frame-' + index;
      frame.setAttribute('data-pft-id', id);
      frame.setAttribute('scrolling', 'no');
      frame.style.overflow = 'hidden';

      var src = frame.getAttribute('src');
      if (src) {
        var newSrc = forwardParams(src);
        if (newSrc !== src) frame.setAttribute('src', newSrc);
      }

      frame.addEventListener('load', function () {
        var target = frame.getAttribute('src') ? originOf(frame.src) : '*';
        frame.contentWindow.postMessage({ type: 'pft:hello', frameId: id }, target);
      });
    });

    window.addEventListener('message', function (event) {
      var data = event.data;
      if (!data || data.type !== 'pft:resize' || typeof data.height !== 'number') return;

      Array.prototype.forEach.call(frames, function (frame) {
        if (frame.contentWindow !== event.source) return;
        if (frame.src && originOf(frame.src) !== event.origin && event.origin !== 'null') return;
        var height = Math.max(50, Math.min(Math.round(data.height), 20000));
        frame.style.height = height + 'px';
        frame.setAttribute('height', height);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
