import { expect, test, type Page } from '@playwright/test'

async function waitForCatalog(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /^全部 Skills \d+$/ })).toBeVisible()
}

test('desktop discovery, semantic corrections, details and guest favorites', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
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
  await expect(superpowersCard).toContainText('从需求澄清、规划到测试交付')

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
