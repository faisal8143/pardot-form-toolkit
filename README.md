# Pardot Form Toolkit

[![Tests](https://github.com/faisal8143/pardot-form-toolkit/actions/workflows/tests.yml/badge.svg)](https://github.com/faisal8143/pardot-form-toolkit/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Drop-in CSS and vanilla JS for **Salesforce Account Engagement (Pardot)** forms: accessible custom checkboxes and radios, clean error states, UTM and GCLID capture, double-submit protection, and auto-resizing iframe embeds. No jQuery, no icon fonts, no build step.

**[Live demo →](https://faisal8143.github.io/pardot-form-toolkit/)** · **[Iframe demo →](https://faisal8143.github.io/pardot-form-toolkit/examples/embed.html?utm_source=github)**

<img src="docs/demo.png" alt="Demo form with custom radios, checkboxes, select placeholder and error states" width="420">

## What's included

### Styling (CSS)

| File | What it does |
|---|---|
| `css/pardot-checkbox.css` | Custom, accessible checkboxes for `.pd-checkbox` fields (pure CSS tick) |
| `css/pardot-radio.css` | Custom, accessible radio buttons for `.pd-radio` fields |
| `css/pardot-error-states.css` | Styles Pardot's `p.errors` banner, `.error` fields and field-level messages |
| `css/sticky-footer.css` | Keeps the footer at the bottom of short landing pages and CloudPages |

### Behaviour (JS)

| File | What it does |
|---|---|
| `js/utm-hidden-fields.js` | Saves `utm_*`, `gclid`, `fbclid`, `msclkid` and `li_fat_id` from the URL into hidden fields, with first-touch session memory |
| `js/submit-guard.js` | Locks the submit button after the first valid submit, so double-clicks don't create duplicate prospects |
| `js/iframe-resize-child.js` | Runs inside the form and reports its height to the host page |
| `js/iframe-embed-parent.js` | Runs on your website: auto-resizes the form iframe and forwards UTM parameters into it |
| `js/field-attributes.js` | Adds native `required`, placeholders, `maxlength`, `type` and `autocomplete` to fields |
| `js/select-placeholder.js` | Turns the blank first option of dropdowns into a disabled "Select…" prompt |
| `js/label-to-placeholder.js` | Moves label text into placeholders (adds `*` for required) and hides labels accessibly |

All colours are CSS custom properties (`--pft-accent`, `--pft-error`, …), and every script has options you can set through `window.PFT_*` globals. Each file starts with a comment explaining it.

## Usage

### 1. CSS: Layout Template

In Account Engagement go to **Content → Layout Templates → (your template) → Layout tab** and add the stylesheets inside `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/faisal8143/pardot-form-toolkit@v1.0.0/css/pardot-checkbox.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/faisal8143/pardot-form-toolkit@v1.0.0/css/pardot-radio.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/faisal8143/pardot-form-toolkit@v1.0.0/css/pardot-error-states.css">
```

To re-brand, override the variables after the stylesheets:

```html
<style>
  :root { --pft-accent: #e4002b; --pft-accent-dark: #b00020; }
</style>
```

### 2. JS: Form "Below Form" section

Open the form → **Look and Feel → Below Form** → switch to HTML source and paste the scripts you need:

```html
<script src="https://cdn.jsdelivr.net/gh/faisal8143/pardot-form-toolkit@v1.0.0/js/field-attributes.js"></script>
<script src="https://cdn.jsdelivr.net/gh/faisal8143/pardot-form-toolkit@v1.0.0/js/select-placeholder.js"></script>
<script src="https://cdn.jsdelivr.net/gh/faisal8143/pardot-form-toolkit@v1.0.0/js/utm-hidden-fields.js"></script>
<script src="https://cdn.jsdelivr.net/gh/faisal8143/pardot-form-toolkit@v1.0.0/js/submit-guard.js"></script>
```

- **field-attributes.js:** edit `FIELD_CONFIG` to match your field names (the class Pardot puts on each field's `<p>`, e.g. `first_name`, `email`, `company`).
- Use **either** `field-attributes.js` **or** `label-to-placeholder.js` for placeholders, not both.

### 3. UTM and click-ID tracking

1. In Account Engagement, create custom prospect fields named `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` and `gclid` (add any others you want).
2. Add them to your form as **Hidden** fields.
3. Add `utm-hidden-fields.js` as above.

A visitor landing on `?utm_source=linkedin&utm_campaign=launch` is saved with those values, even if they browse around before submitting in the same visit. Field names different from the parameter? Map them:

```html
<script>window.PFT_UTM_FIELD_MAP = { gclid: 'google_click_id' };</script>
```

### 4. Auto-resizing iframe embeds

Pardot's embed code uses a fixed-height iframe, so errors and thank-you messages get cut off.

**In the form's Layout Template**, just before `</body>`:

```html
<script>window.PFT_PARENT_ORIGIN = 'https://www.your-site.com';</script>
<script src="https://cdn.jsdelivr.net/gh/faisal8143/pardot-form-toolkit@v1.0.0/js/iframe-resize-child.js"></script>
```

**On your website**, add `data-pardot-form` to the iframe and include the parent script:

```html
<iframe data-pardot-form src="https://go.your-site.com/l/12345/2026-01-01/abcde"
        width="100%" height="500" style="border:0" title="Contact form"></iframe>
<script src="https://cdn.jsdelivr.net/gh/faisal8143/pardot-form-toolkit@v1.0.0/js/iframe-embed-parent.js"></script>
```

The iframe now fits its content and the page's UTM parameters are passed into the form.

> Tip: for production, copy the files into your own Account Engagement **Files** (or Marketing Cloud Content Builder) and reference them from there instead of a public CDN.

## Markup it expects

The snippets target the standard markup Account Engagement renders:

```html
<form class="form" id="pardot-form">
  <p class="form-field email pd-text required">
    <label class="field-label" for="email">Email</label>
    <input type="text" id="email" name="email">
  </p>
  <p class="form-field opt_in pd-checkbox">
    <label class="field-label">Updates</label>
    <span class="value"><span>
      <input type="checkbox" id="opt_in_0"><label class="inline" for="opt_in_0">Yes</label>
    </span></span>
  </p>
  <p class="form-field utm_source pd-hidden hidden">
    <input type="hidden" id="utm_source" name="utm_source">
  </p>
</form>
```

## Browser support

All evergreen browsers (Chrome, Edge, Firefox, Safari). No IE support.

## Development

```bash
pip install -r requirements-dev.txt
python -m playwright install chromium
pytest
```

Every script is covered by browser tests, which run on each push and pull request.

## Contributing

Issues and pull requests are welcome, especially fixes for common Account Engagement or Marketing Cloud CloudPages form problems. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Faisal Irfan
