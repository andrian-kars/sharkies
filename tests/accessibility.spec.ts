import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mockTmdb } from "./tmdb-mock";

test.beforeEach(({ page }) => mockTmdb(page));

const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// macOS Safari only tabs to links and buttons with Option+Tab.
const tabKey = (browserName: string) =>
  browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";

const searchQuery = { en: "Jaws", uk: "Щелепи" };

async function expectNoViolations(page: Page, label: string) {
  await page.evaluate(() => document.fonts.ready);
  const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
  expect(
    violations.map(({ id, help, nodes }) => ({
      id,
      help,
      targets: nodes.map((node) => node.target.join(" ")).slice(0, 4),
    })),
    label,
  ).toEqual([]);
}

const screens = [
  ["home", "/", ".creature-section .film-card"],
  ["creatures", "/creatures", ".collection-page .film-card"],
  ["creatures, sharks page 2", "/creatures?kind=sharks&page=2", ".film-card"],
  ["search results", "/search?q=Jaws", ".film-card"],
  ["search without matches", "/search?q=no-match", ".empty-state"],
  ["search prompt", "/search", ".empty-state"],
  ["popular movies", "/movies/popular", ".film-card"],
  ["airing series", "/tv/airing-today", ".film-card"],
  ["empty watchlist", "/watchlist", ".empty-state"],
  ["not found", "/nowhere", ".empty-state"],
] as const;

for (const [language, label] of [
  ["en", "English"],
  ["uk", "Ukrainian"],
] as const) {
  test.describe(label, () => {
    test.beforeEach(({ page }) =>
      page.addInitScript(
        (value) => localStorage.setItem("movies:language", value),
        language,
      ),
    );

    for (const [name, path, ready] of screens) {
      test(`${name} has no WCAG 2.2 AA violations`, async ({ page }) => {
        await page.goto(
          path === "/search?q=Jaws" ? `/search?q=${searchQuery[language]}` : path,
        );
        await expect(page.locator(ready).first()).toBeVisible();
        await expect(page.locator(".film-skeleton")).toHaveCount(0);
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        await expectNoViolations(page, name);
      });
    }

    test("watchlist with saved films has no violations", async ({ page }) => {
      await page.goto("/creatures");
      await page.locator(".poster-save").nth(0).click();
      await page.locator(".poster-save").nth(2).click();
      await page.goto("/watchlist");
      await expect(page.locator(".film-card")).toHaveCount(2);
      await expectNoViolations(page, "watchlist");
    });

    test("film dialog has no violations and traps focus", async ({
      page,
      browserName,
    }) => {
      await page.goto("/");
      await page.locator(".poster-button").first().click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.locator(".text-skeleton")).toHaveCount(0);
      await expectNoViolations(page, "dialog");
      for (let press = 0; press < 8; press++)
        await page.keyboard.press(tabKey(browserName));
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(
        true,
      );
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    });

    test("open mobile search has no violations", async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "mobile",
        "Only phones collapse the search field.",
      );
      await page.goto("/");
      await page
        .getByRole("button", { name: /search|пошук/i })
        .first()
        .click();
      await expectNoViolations(page, "mobile search");
    });
  });
}

test("axe reports a seeded violation, so a passing run means something", async ({
  page,
}) => {
  await page.setContent(
    '<!doctype html><html lang="en"><title>t</title><main><img src="x.png"><button></button></main>',
  );
  const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
  expect(violations.map(({ id }) => id).sort()).toEqual(["button-name", "image-alt"]);
});

test("keyboard users can reach every control and always see focus", async ({
  page,
  browserName,
}) => {
  await page.goto("/creatures");
  await expect(page.locator(".film-card").first()).toBeVisible();
  const unfocusable: string[] = [];
  for (let press = 0; press < 40; press++) {
    await page.keyboard.press(tabKey(browserName));
    const state = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      const outlined =
        style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
      const box = el.getBoundingClientRect();
      return {
        name:
          el.getAttribute("aria-label") ||
          el.textContent?.trim().slice(0, 30) ||
          el.tagName,
        visible: outlined || style.boxShadow !== "none",
        size: box.width > 0 && box.height > 0,
      };
    });
    if (state && !(state.visible && state.size)) unfocusable.push(state.name);
  }
  expect(unfocusable).toEqual([]);
});

test("skip link moves focus to the main content", async ({ page, browserName }) => {
  await page.goto("/");
  await page.keyboard.press(tabKey(browserName));
  const skip = page.getByRole("link", { name: /skip to content|перейти до вмісту/i });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});
