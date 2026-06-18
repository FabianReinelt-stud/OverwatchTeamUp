import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

type HeroSummary = {
  hero_key: string;
  display_name: string;
  role: string;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getHeroes = async (request: APIRequestContext) => {
  const heroesResponse = await request.get('/api/heroes/');
  expect(heroesResponse.ok()).toBeTruthy();

  const heroes = (await heroesResponse.json()) as HeroSummary[];
  expect(heroes.length, 'The e2e tests need heroes in the local database.').toBeGreaterThan(0);
  return heroes;
};

const searchAndOpenHero = async (page: Page, hero: HeroSummary) => {
  await page.getByLabel('Search Heroes').fill(hero.display_name);
  await page.getByRole('button', { name: new RegExp(escapeRegExp(hero.display_name), 'i') }).click();
  await expect(page.locator('.hero-name')).toHaveText(hero.display_name);
};

test('loads a hero from the sidebar and shows hero details', async ({ page, request }) => {
  const heroes = await getHeroes(request);
  const hero = heroes.find((candidate) => candidate.display_name.length > 0) ?? heroes[0];

  await page.goto('/');

  await expect(page.getByText('Welcome to Overwatch Team Comps!')).toBeVisible();
  await searchAndOpenHero(page, hero);

  await expect(page.locator('.hero-name')).toHaveText(hero.display_name);
  await expect(page.getByText('Role', { exact: true })).toBeVisible();
  await expect(page.getByText(hero.role)).toBeVisible();
});

test('registers, logs in, saves, and loads a team composition', async ({ page, request }) => {
  const heroes = await getHeroes(request);
  const tanks = heroes.filter((hero) => hero.role.toLowerCase() === 'tank');
  const damage = heroes.filter((hero) => hero.role.toLowerCase() === 'damage');
  const support = heroes.filter((hero) => hero.role.toLowerCase() === 'support');

  expect(tanks.length, 'The test needs at least one tank hero.').toBeGreaterThanOrEqual(1);
  expect(damage.length, 'The test needs at least two damage heroes.').toBeGreaterThanOrEqual(2);
  expect(support.length, 'The test needs at least two support heroes.').toBeGreaterThanOrEqual(2);

  const team = [tanks[0], damage[0], damage[1], support[0], support[1]];
  const username = `e2euser${Date.now()}`;
  const password = 'StrongPass1';
  const teamName = `E2E Team ${Date.now()}`;

  await page.goto('/');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.getByRole('button', { name: 'No Account? Register' }).click();
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Register', exact: true }).click();

  await expect(page.getByText('Registration was successful. Please login now.')).toBeVisible();
  await page.getByRole('button', { name: 'Go to Login', exact: true }).click();
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('form').getByRole('button', { name: 'Login', exact: true }).click();

  await expect(page.getByText('You were successfully logged in.')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

  await searchAndOpenHero(page, team[0]);
  await page.getByAltText('tank', { exact: true }).click();

  await searchAndOpenHero(page, team[1]);
  await page.getByAltText('damage', { exact: true }).nth(0).click();

  await searchAndOpenHero(page, team[2]);
  await page.getByAltText('damage', { exact: true }).nth(1).click();

  await searchAndOpenHero(page, team[3]);
  await page.getByAltText('support', { exact: true }).nth(0).click();

  await searchAndOpenHero(page, team[4]);
  await page.getByAltText('support', { exact: true }).nth(1).click();

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    await dialog.accept(teamName);
  });
  await page.locator('button.saveBtn-add').click();

  await expect.poll(async () => {
    const response = await request.get('/api/team-compositions/', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('accessToken'))}`,
      },
    });
    if (!response.ok()) {
      return false;
    }
    const compositions = (await response.json()) as { name: string }[];
    return compositions.some((composition) => composition.name === teamName);
  }).toBe(true);

  await page.locator('button.loadBtn').click();
  await expect(page.getByRole('button', { name: new RegExp(escapeRegExp(teamName), 'i') })).toBeVisible();
});
