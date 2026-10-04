# Contributing

Thanks for helping make Account Engagement (Pardot) forms better. Snippets, bug reports and real-world fixes are all welcome.

## Ground rules

- **No dependencies.** Plain CSS and vanilla JavaScript only — no jQuery, frameworks or build step. People paste these straight into Pardot.
- **Target real Pardot markup.** Use the classes Account Engagement actually renders (`form#pardot-form`, `p.form-field`, `.pd-text`, `.pd-select`, `.pd-checkbox`, `.pd-radio`, `.required`, `.error`, `p.errors`).
- **Accessible by default.** Keep native inputs focusable, preserve labels for screen readers, support keyboard use.
- **Configurable, not hard-coded.** Expose colours as `--pft-*` CSS variables and options as `window.PFT_*` globals.
- **Self-contained files.** Each file should work on its own and start with a comment explaining what it does and where to paste it in Account Engagement.

## Adding a snippet

1. Add the file to `css/` or `js/`.
2. Add it to the demo (`index.html`, or a page in `examples/`).
3. Add tests in `tests/test_toolkit.py`.
4. Add a row to the table in `README.md` and a line under **Unreleased** in `CHANGELOG.md`.

## Running the tests

```bash
pip install -r requirements-dev.txt
python -m playwright install chromium
pytest
```

The same tests run automatically on every pull request.

## Reporting a bug

Open an issue with the form markup (from your browser's dev tools), what you expected, what happened, and the browser you used. Remove any personal or client data first.
