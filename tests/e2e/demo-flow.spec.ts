import { test, expect } from "@playwright/test";

test("admin login opens dashboard and hero workspace", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Amount at risk, right now" })).toBeVisible();
  await page.goto("/disputes/disp_hero_macbook");
  await expect(page.getByText("Product not received")).toBeVisible();
  await expect(page.getByRole("button", { name: "Contest Chargeback" })).toBeVisible();
  await page.getByRole("link", { name: "Review" }).first().click();
  await expect(page.getByRole("heading", { name: "Review workspace" })).toBeVisible();
});

test("analyst can open the hero case but cannot contest", async ({ page }) => {
  await page.goto("/login");
  await page.locator("input").first().fill("analyst@disputeshield.dev");
  await page.locator("input[type='password']").fill("demo1234");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Amount at risk, right now" })).toBeVisible();
  await page.goto("/disputes/disp_hero_macbook");
  await expect(page.getByText("Product not received")).toBeVisible();
  await expect(page.getByText("Analysts can prepare a package")).toBeVisible();
  await expect(page.getByRole("button", { name: "Contest Chargeback" })).toBeDisabled();
});

test("admin can open team and activity", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.goto("/settings/team");
  await expect(page.getByRole("heading", { name: "Team" })).toBeVisible();
  await expect(page.getByText("Invite a teammate")).toBeVisible();
  await page.goto("/activity");
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export CSV" })).toBeVisible();
});
