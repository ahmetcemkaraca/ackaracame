from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Increase viewport size to ensure side-by-side rendering if dependent on width
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        print("Navigating to homepage...")
        try:
            page.goto("http://localhost:3000", timeout=60000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        print("Waiting for network idle...")
        page.wait_for_load_state("networkidle")

        # Wait specifically for the first button to ensure Hero section is loaded
        try:
            page.wait_for_selector('text="Yolculuğa Başla"', timeout=10000)
            print("Found 'Yolculuğa Başla' button.")
        except:
            print("Could not find 'Yolculuğa Başla' button.")

        # Take a screenshot
        screenshot_path = "/home/jules/verification/homepage_buttons_retry.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        # Check for the new button
        try:
            # We look for the text or the link
            button = page.wait_for_selector('text="Eski Portfolyo"', timeout=5000)
            if button:
                print("SUCCESS: Found 'Eski Portfolyo' button.")
                # Verify the href
                href = button.get_attribute("href")
                # Wait, the selector might return the span inside the anchor.
                # Let's find the anchor tag specifically.
                link = page.locator('a:has-text("Eski Portfolyo")')
                href = link.get_attribute("href")
                print(f"Button href: {href}")

                expected_href = "https://portfolio-ahmet-cem-karaca.vercel.app/index.html"
                if href == expected_href:
                     print("SUCCESS: Href matches.")
                else:
                     print(f"FAILURE: Href mismatch. Expected {expected_href}, got {href}")
            else:
                print("FAILURE: Button found but is None?")
        except Exception as e:
            print(f"FAILURE: Could not find 'Eski Portfolyo' button. Error: {e}")

            # Dump HTML for debugging
            print("Dumping HTML around the first button:")
            try:
                # Find the parent container of the first button
                first_btn = page.locator('text="Yolculuğa Başla"')
                parent = first_btn.locator("..") # Parent div
                print(parent.inner_html())
            except Exception as dump_e:
                print(f"Could not dump HTML: {dump_e}")

        browser.close()

if __name__ == "__main__":
    run()
