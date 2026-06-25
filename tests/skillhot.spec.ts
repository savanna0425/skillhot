import { expect, test, type Page } from '@playwright/test'

async function waitForCatalog(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /^全部 Skills \d+$/ })).toBeVisible()
}

test('desktop discovery, semantic corrections, details and guest favorites', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    const text = message.text()
    const isTransientResourceError = /Failed to load resource: the server responded with a status of 429/.test(text)
    if (message.type() === 'error' && !isTransientResourceError) consoleErrors.push(text)
  })

  await waitForCatalog(page)
  const search = page.getByPlaceholder('搜索 Skills、仓库、场景或平台')

  await search.fill('cc-switch')
  await expect(page.getByRole('heading', { name: '搜索结果' })).toBeVisible()
  await expect(page.locator('.search-results-section article')).toHaveCount(2)
  const switchCard = page.locator('.search-results-section article').filter({ hasText: 'farion1231/cc-switch' })
  await expect(switchCard).toContainText('Agent工具与平台')
  await expect(switchCard).toContainText('跨平台管理 Claude Code、Codex 等编程智能体及模型服务配置')
  await switchCard.getByRole('button', { name: '详情' }).click()
  const switchPanel = page.getByRole('complementary', { name: 'farion1231/cc-switch 详情' })
  await expect(switchPanel).toContainText('作者原始描述')
  await expect(switchPanel).toContainText('分类置信度 · 人工复核')

  await search.fill('superpowers')
  const superpowersCard = page.locator('.search-results-section article').filter({ hasText: 'obra/superpowers' })
  await expect(superpowersCard).toContainText('编程开发')
  await expect(superpowersCard).toContainText('一套面向智能体的软件开发方法与技能框架')

  await page.screenshot({ path: 'test-results/desktop-search.png', fullPage: false })
  await superpowersCard.getByRole('button', { name: '收藏' }).click()
  await expect(page).toHaveURL(/#auth$/)
  await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible()
  expect(consoleErrors).toEqual([])
})

test('desktop navigation and export restriction', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)
  await page.getByRole('navigation', { name: '主要页面' }).getByRole('button', { name: '榜单' }).click()
  await expect(page.getByRole('heading', { name: 'Skills 榜单' })).toBeVisible()
  await page.getByRole('button', { name: /^Agent工具与平台 \d+$/ }).click()
  await expect(page.getByRole('heading', { name: 'Agent工具与平台', exact: true })).toBeVisible()

  await page.getByRole('button', { name: '关于', exact: true }).click()
  await expect(page.getByRole('heading', { name: '让好用的 Agent Skills 更容易被发现。' })).toBeVisible()
  await expect(page.getByText('导出 CSV')).toHaveCount(0)
  await expect(page.getByText('下载开放数据')).toHaveCount(0)
  await expect(page.locator('a[href*="skills.csv"]')).toHaveCount(0)
})

test('desktop detail panel resize and fullscreen', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)
  // Disable the layout open-transition so width/position measurements are deterministic.
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' })
  await page.locator('.detail-restore button').click()
  const layout = page.locator('.site-layout')
  await expect(page.locator('.detail-shell')).toBeVisible()
  await expect(layout).toHaveCSS('--detail-width', '366px')

  // fullscreen toggle covers the middle list, then restores
  await page.locator('.detail-fullscreen-toggle').click()
  await expect(layout).toHaveClass(/detail-fullscreen/)
  await page.locator('.detail-fullscreen-toggle').click()
  await expect(layout).not.toHaveClass(/detail-fullscreen/)

  // drag the resizer left to widen, and persist the new width
  const handle = page.locator('.detail-resizer')
  const box = await handle.boundingBox()
  if (!box) throw new Error('resizer not found')
  await page.mouse.move(box.x + box.width / 2, box.y + 120)
  await page.mouse.down()
  await page.mouse.move(box.x - 220, box.y + 120, { steps: 10 })
  await page.mouse.up()
  const width = await layout.evaluate((el) => parseInt(getComputedStyle(el).getPropertyValue('--detail-width'), 10))
  expect(width).toBeGreaterThan(500)
  const stored = await page.evaluate(() => Number(localStorage.getItem('skillhot:detailWidth')))
  expect(stored).toBeGreaterThan(500)
})

test('mobile Chrome menu and discovery layout', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-mobile', 'mobile product flow')
  await waitForCatalog(page)
  const menu = page.getByRole('button', { name: '打开筛选菜单' })
  await expect(menu).toBeVisible()
  await menu.click()
  const sidebar = page.getByRole('complementary', { name: '分类与导航' })
  await expect(sidebar).toBeVisible()
  await sidebar.getByRole('button', { name: /^编程开发 \d+$/ }).click()
  await expect(page.getByRole('heading', { name: '编程开发', exact: true })).toBeVisible()
  await page.screenshot({ path: 'test-results/mobile-category.png', fullPage: false })
})
