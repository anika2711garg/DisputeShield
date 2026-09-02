import { test, expect } from "@playwright/test";

test("login, open hero case, review workspace", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await page.goto("/disputes/disp_hero_macbook");
  await expect(page.getByText("CONTEST RECOMMENDED")).toBeVisible();
  await page.getByRole("link", { name: "Review Evidence" }).click();
  await expect(page.getByRole("heading", { name: "Review workspace" })).toBeVisible();
});
