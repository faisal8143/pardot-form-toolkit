# Changelog

All notable changes to this project are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-10-04

### Added
- `js/utm-hidden-fields.js` — copies UTM and click-ID parameters (gclid, fbclid, msclkid, li_fat_id) into hidden fields, with first-touch session persistence.
- `js/submit-guard.js` — disables the submit button after the first valid submit to prevent duplicate prospects.
- `js/iframe-resize-child.js` + `js/iframe-embed-parent.js` — auto-resizing iframe embeds that also forward UTM parameters into the form.
- Iframe embed demo (`examples/embed.html`).
- Browser test suite (Playwright) and GitHub Actions CI.
- Contribution guide, issue and pull request templates.

### Changed
- Checkboxes and radios rewritten in pure CSS (no Font Awesome dependency), with keyboard focus styles.
- All JavaScript rewritten without jQuery.
- Colours exposed as `--pft-*` CSS custom properties.

## [0.1.0] - 2020-01-17

- Original standalone snippets: Pardot checkbox and radio styles, error-state styles, placeholder and label helpers, sticky footer.

[Unreleased]: https://github.com/faisal8143/pardot-form-toolkit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/faisal8143/pardot-form-toolkit/releases/tag/v1.0.0
