/*
 * Pardot Form Toolkit — iframe auto-resize (form side)
 * Account Engagement forms are embedded with a fixed-height <iframe>, so error messages and
 * thank-you text get cut off or leave big gaps. This script runs INSIDE the form and tells the
 * host page its real height whenever it changes. Pair it with js/iframe-embed-parent.js.
 *
 * Paste into the form's Layout Template (Content -> Layout Templates -> Layout tab), just before </body>,
 * so it also runs on the error and thank-you states.
 *
 * Option (set before this script loads):
 *   window.PFT_PARENT_ORIGIN = 'https://www.example.com';   // recommended: only send to your site
 */
(function () {
  if (window.parent === window) return; // not in an iframe

  var targetOrigin = window.PFT_PARENT_ORIGIN || '*'; // height is not sensitive, but lock it down if you can
  var lastHeight = 0;
  var frameId = null;

  function measure() {
    var body = document.body;
    var html = document.documentElement;
    return Math.ceil(Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      html.offsetHeight
    ));
  }

  function postHeight(force) {
    var height = measure();
    if (!force && Math.abs(height - lastHeight) < 2) return;
    lastHeight = height;
    window.parent.postMessage({ type: 'pft:resize', height: height, frameId: frameId }, targetOrigin);
  }

  function schedule() {
    window.requestAnimationFrame(function () { postHeight(false); });
  }

  // The parent tells us which iframe we are, so several forms on one page don't clash
  window.addEventListener('message', function (event) {
    var data = event.data;
    if (event.source !== window.parent || !data || data.type !== 'pft:hello') return;
    if (targetOrigin !== '*' && event.origin !== targetOrigin) return;
    frameId = data.frameId;
    postHeight(true);
  });

  function start() {
    postHeight(true);
    if ('ResizeObserver' in window) {
      new ResizeObserver(schedule).observe(document.body);
    } else {
      setInterval(function () { postHeight(false); }, 500);
    }
    window.addEventListener('load', function () { postHeight(true); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
