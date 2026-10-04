"""
Browser tests for Pardot Form Toolkit.

Run locally:
    pip install pytest playwright
    python -m playwright install chromium
    pytest
"""
import functools
import http.server
import pathlib
import threading

import pytest
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent


def _serve(port=0):
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *args, **kwargs: None
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


@pytest.fixture(scope="session")
def base_url():
    server = _serve()
    yield f"http://127.0.0.1:{server.server_address[1]}"
    server.shutdown()


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        yield b
        b.close()


@pytest.fixture
def page(browser):
    context = browser.new_context(viewport={"width": 420, "height": 900})
    p = context.new_page()
    p.errors = []
    p.on("pageerror", lambda e: p.errors.append(str(e)))
    yield p
    assert p.errors == [], f"JavaScript errors: {p.errors}"
    context.close()


# --- main demo ----------------------------------------------------------------

def test_field_attributes(page, base_url):
    page.goto(base_url + "/index.html")
    first = page.locator("#first_name")
    assert first.get_attribute("placeholder") == "Type your first name here"
    assert first.evaluate("e => e.required") is True
    assert first.evaluate("e => e.maxLength") == 50
    assert page.locator("#email").evaluate("e => e.type") == "email"
    assert page.locator("#phone").evaluate("e => [e.type, e.required]") == ["tel", False]


def test_select_placeholder(page, base_url):
    page.goto(base_url + "/index.html")
    select = page.locator("#country")
    assert select.evaluate("e => [e.options[0].text, e.options[0].disabled]") == ["Select your country", True]
    assert "pft-is-placeholder" in select.get_attribute("class")
    select.select_option("PK")
    assert "pft-is-placeholder" not in (select.get_attribute("class") or "")


def test_custom_checkbox_and_radio_are_clickable(page, base_url):
    page.goto(base_url + "/index.html")
    page.click("label[for=opt_in_1]")
    page.click("label[for=interest_2]")
    assert page.locator("#opt_in_1").is_checked()
    assert page.locator("#interest_2").is_checked()


def test_checkbox_keyboard_toggle(page, base_url):
    page.goto(base_url + "/index.html")
    page.focus("#opt_in_1")
    page.keyboard.press("Space")
    assert page.locator("#opt_in_1").is_checked()


def test_error_state_is_styled(page, base_url):
    page.goto(base_url + "/index.html")
    bg = page.locator("#email").evaluate("e => getComputedStyle(e).backgroundColor")
    assert bg == "rgb(255, 238, 238)"


def test_utm_fields_from_url(page, base_url):
    page.goto(base_url + "/index.html?utm_source=linkedin&utm_medium=social&utm_campaign=Spring%20Launch&gclid=abc123&ignored=x")
    values = page.evaluate("['utm_source','utm_medium','utm_campaign','gclid'].map(id => document.getElementById(id).value)")
    assert values == ["linkedin", "social", "Spring Launch", "abc123"]


def test_utm_fields_ready_for_inline_scripts(page, base_url):
    """Values must be in place before later inline scripts on the page run."""
    page.goto(base_url + "/index.html?utm_source=linkedin")
    assert "linkedin" in page.locator("#utm-table").inner_text()


def test_utm_first_touch_persists_in_session(page, base_url):
    page.goto(base_url + "/index.html?utm_source=google&utm_campaign=brand")
    page.goto(base_url + "/index.html")
    assert page.locator("#utm_source").input_value() == "google"
    assert page.locator("#utm_campaign").input_value() == "brand"


def test_utm_does_not_overwrite_prefilled_value(page, base_url):
    page.goto(base_url + "/index.html")
    page.evaluate("document.getElementById('utm_source').value = 'prefilled'")
    page.evaluate("pftApplyUtmFields(document, '?utm_source=other')")
    assert page.locator("#utm_source").input_value() == "prefilled"


def test_submit_guard_blocks_double_submit(page, base_url):
    """Two submits in a row: only the first one may go through."""
    page.goto(base_url + "/index.html")
    page.set_content(
        '<form id="pardot-form" class="form" method="post" action="/submit">'
        '<p class="form-field email pd-text required"><input type="email" name="email" id="email"></p>'
        '<p class="submit"><input type="submit" value="Submit"></p></form>'
    )
    page.add_script_tag(path=str(ROOT / "js" / "submit-guard.js"))
    # Registered after the guard: counts submits the guard let through, then stops navigation
    page.evaluate(
        """() => {
            window.sent = 0;
            document.getElementById('pardot-form').addEventListener('submit', e => {
                if (!e.defaultPrevented) window.sent++;
                e.preventDefault();
            });
        }"""
    )
    page.fill("#email", "faisal@example.com")
    page.click(".submit input")
    page.evaluate("document.getElementById('pardot-form').requestSubmit()")
    page.evaluate("document.getElementById('pardot-form').requestSubmit()")
    assert page.evaluate("window.sent") == 1


def test_submit_guard_demo_locks_button(page, base_url):
    page.goto(base_url + "/index.html")
    page.fill("#first_name", "Faisal")
    page.fill("#last_name", "Irfan")
    page.fill("#email", "faisal@example.com")
    page.select_option("#country", "PK")
    page.click(".submit input")
    page.wait_for_function("document.querySelector('.submit input').disabled")
    assert page.locator(".submit input").input_value() == "Sending…"
    assert page.locator("#demo-result").is_visible()


def test_submit_guard_ignores_invalid_form(page, base_url):
    page.goto(base_url + "/index.html")  # first/last name empty and required
    page.click(".submit input")
    assert page.locator(".submit input").is_enabled()
    assert page.locator(".submit input").input_value() == "Submit"


def test_label_to_placeholder(page, base_url):
    page.goto(base_url + "/index.html")
    page.add_script_tag(path=str(ROOT / "js" / "label-to-placeholder.js"))
    first = page.locator("#first_name")
    assert first.get_attribute("placeholder") == "First Name *"
    assert first.get_attribute("aria-label") == "First Name *"
    assert page.locator("label[for=first_name]").evaluate("e => e.getBoundingClientRect().width") <= 1


# --- iframe embed ---------------------------------------------------------------

def test_iframe_resizes_and_forwards_utms(page, base_url):
    page.goto(base_url + "/examples/embed.html?utm_source=newsletter&utm_campaign=october&other=1")
    frame_el = page.locator("iframe[data-pardot-form]")
    src = frame_el.get_attribute("src")
    assert "utm_source=newsletter" in src and "utm_campaign=october" in src and "other=1" not in src

    page.wait_for_function("document.querySelector('iframe[data-pardot-form]').offsetHeight > 200")
    small = frame_el.evaluate("e => e.offsetHeight")

    frame = page.frame_locator("iframe[data-pardot-form]")
    assert frame.locator("#utm_source").input_value() == "newsletter"
    assert "utm_source=newsletter" in frame.locator("#received").inner_text()

    frame.locator("#grow").click()
    page.wait_for_function(f"document.querySelector('iframe[data-pardot-form]').offsetHeight > {small + 100}")


def test_iframe_resize_cross_origin(browser):
    """Host page and form served from different origins, like a real website + go.pardot.com."""
    host = _serve()
    form = _serve()
    try:
        host_url = f"http://127.0.0.1:{host.server_address[1]}"
        form_url = f"http://localhost:{form.server_address[1]}"
        context = browser.new_context()
        p = context.new_page()
        p.goto(host_url + "/examples/embed.html")
        p.evaluate(
            """url => {
                const f = document.createElement('iframe');
                f.setAttribute('data-pardot-form', '');
                f.id = 'xo';
                f.height = 100;
                f.src = url;
                document.body.appendChild(f);
            }""",
            form_url + "/examples/embedded-form.html",
        )
        # Re-run setup so the new iframe is picked up
        p.add_script_tag(path=str(ROOT / "js" / "iframe-embed-parent.js"))
        p.wait_for_function("document.getElementById('xo').offsetHeight > 200")
        context.close()
    finally:
        host.shutdown()
        form.shutdown()
