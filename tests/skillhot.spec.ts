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
  await expect(switchCard).toContainText('管理 Claude Code、Codex 等编程智能体配置和模型服务')
  await switchCard.getByRole('button', { name: '详情' }).click()
  const switchPanel = page.getByRole('complementary', { name: 'farion1231/cc-switch 详情' })
  await expect(switchPanel).toContainText('作者原始描述')
  await expect(switchPanel).toContainText('已人工核对')

  await search.fill('superpowers')
  const superpowersCard = page.locator('.search-results-section article').filter({ hasText: 'obra/superpowers' })
  await expect(superpowersCard).toContainText('编程开发')
  await expect(superpowersCard).toContainText('给 Claude Code、Codex 这类编程智能体使用的软件开发方法和技能集合')

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
  await expect(page.getByRole('heading', { name: '找 Skill，不用再翻遍 GitHub。' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '项目解读' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'AI 解读' })).toHaveCount(0)
  await expect(page.getByText('导出 CSV')).toHaveCount(0)
  await expect(page.getByText('下载开放数据')).toHaveCount(0)
  await expect(page.locator('a[href*="skills.csv"]')).toHaveCount(0)
})

test('category and topic pages can load more repositories', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)

  await page.getByRole('button', { name: '分类', exact: true }).click()
  await expect(page.getByRole('heading', { name: '技能分类' })).toBeVisible()
  await page.getByRole('button', { name: /^编程开发 \d+$/ }).click()
  const categoryCards = page.locator('.categories-page .skill-card-grid article')
  await expect(page.locator('.categories-page .pagination-status')).toContainText(/当前显示 48 \/ 共 \d+ 个项目/)
  await expect(categoryCards).toHaveCount(48)
  await page.locator('.categories-page').getByRole('button', { name: /加载更多/ }).click()
  await expect(categoryCards).toHaveCount(96)
  await expect(page.locator('.categories-page .pagination-status')).toContainText(/当前显示 96 \/ 共 \d+ 个项目/)

  await page.getByRole('button', { name: '话题', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Skills 生态话题' })).toBeVisible()
  const topicCards = page.locator('.topics-page .skill-card-grid article')
  await expect(page.locator('.topics-page .pagination-status')).toContainText(/当前显示 48 \/ 共 \d+ 个项目/)
  await expect(topicCards).toHaveCount(48)
  await page.locator('.topics-page').getByRole('button', { name: /加载更多/ }).click()
  await expect(topicCards).toHaveCount(96)
})

test('home uses lightweight catalog and then loads full index lazily', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))

  await page.goto('/')
  await expect(page.getByRole('heading', { name: '发现适合你的 Agent Skills' })).toBeVisible()
  expect(requests.some((url) => url.endsWith('/data/home.json'))).toBeTruthy()
  expect(requests.some((url) => url.endsWith('/data/skills.json'))).toBeFalsy()

  await page.getByRole('navigation', { name: '主要页面' }).getByRole('button', { name: '榜单' }).click()
  await expect(page.getByRole('heading', { name: 'Skills 榜单' })).toBeVisible()
  expect(requests.some((url) => url.endsWith('/data/skills-lite.json'))).toBeTruthy()
})

test('detail panel shows product-facing project interpretation without technical labels', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)

  await page.locator('.detail-restore button').click()
  const panel = page.locator('.detail-shell')
  await expect(panel).toContainText(/看懂这个项目|项目解读/, { timeout: 10_000 })
  await expect(panel).toContainText('适合谁')
  await expect(panel).toContainText('预期效果')
  await expect(panel).not.toContainText('AI 项目解读')
  await expect(panel).not.toContainText('离线生成')
  await expect(panel).not.toContainText('AI 已解读')
})

test('sample detail explains a project in plain user-facing language', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)

  await page.getByPlaceholder('搜索 Skills、仓库、场景或平台').fill('superpowers')
  const superpowersCard = page.locator('.search-results-section article').filter({ hasText: 'obra/superpowers' })
  await superpowersCard.getByRole('button', { name: '详情' }).click()
  const panel = page.getByRole('complementary', { name: 'obra/superpowers 详情' })

  await expect(panel).toContainText('superpowers 是一套给 Claude Code、Codex 这类编程智能体使用的软件开发方法和技能集合')
  await expect(panel.getByRole('heading', { name: '这是什么' })).toBeVisible()
  await expect(panel.getByRole('heading', { name: '它解决什么问题' })).toBeVisible()
  await expect(panel.getByRole('heading', { name: '你能用它做什么' })).toBeVisible()
  await expect(panel.getByRole('heading', { name: '不适合谁' })).toBeVisible()
  await expect(panel.getByRole('heading', { name: '怎么开始用' })).toBeVisible()
  await expect(panel).toContainText('让智能体按计划、实现、测试、评审这些步骤推进任务')
  await expect(panel.getByRole('heading', { name: '适用场景' })).toHaveCount(0)
})

test('batch-generated detail explains non-sample projects from a user perspective', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)

  await page.getByPlaceholder('搜索 Skills、仓库、场景或平台').fill('affaan-m/ECC')
  const card = page.locator('.search-results-section article').filter({ hasText: 'affaan-m/ECC' })
  await expect(card).toContainText('性能优化与工程方法系统')
  await card.getByRole('button', { name: '详情' }).click()
  const panel = page.getByRole('complementary', { name: 'affaan-m/ECC 详情' })

  await expect(panel).toContainText('看懂这个项目')
  await expect(panel.getByRole('heading', { name: '这是什么' })).toBeVisible()
  await expect(panel.getByRole('heading', { name: '它解决什么问题' })).toBeVisible()
  await expect(panel.getByRole('heading', { name: '你能用它做什么' })).toBeVisible()
  await expect(panel.getByRole('heading', { name: '不适合谁' })).toBeVisible()
  await expect(panel.getByRole('heading', { name: '怎么开始用' })).toBeVisible()
  await expect(panel).toContainText('先判断它是否适合你的当前任务')
  await expect(panel).not.toContainText('离线生成')
  await expect(panel.getByRole('heading', { name: '适用场景' })).toHaveCount(0)
})

test('desktop detail panel width modes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' })
  await page.locator('.detail-restore button').click()
  const layout = page.locator('.site-layout')
  await expect(page.locator('.detail-shell')).toBeVisible()
  await expect(layout).toHaveClass(/detail-side/)

  // switch through the three width modes
  await page.getByRole('button', { name: '占一半', exact: true }).click()
  await expect(layout).toHaveClass(/detail-half/)
  await page.getByRole('button', { name: '全屏', exact: true }).click()
  await expect(layout).toHaveClass(/detail-full/)
  expect(await page.evaluate(() => localStorage.getItem('skillhot:detailMode'))).toBe('full')

  // the middle skill grid reflows to fewer columns when the panel takes half
  const cols = () => page.locator('.skill-card-grid').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)
  await page.getByRole('button', { name: '靠右显示', exact: true }).click()
  await expect(layout).toHaveClass(/detail-side/)
  await expect.poll(cols).toBe(3)
  await page.getByRole('button', { name: '占一半', exact: true }).click()
  await expect.poll(cols).toBe(2)
})

test('desktop nav closes an open detail and the collapse toolbar is sticky', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)

  // open the detail panel
  await page.locator('.detail-restore button').click()
  await expect(page.locator('.detail-shell')).toBeVisible()

  // the collapse/收起 toolbar is pinned to the top of the scrolling panel, not static
  await expect(page.locator('.detail-toolbar')).toHaveCSS('position', 'sticky')

  // clicking a primary nav item goes straight to that page and dismisses the detail
  await page.getByRole('navigation', { name: '主要页面' }).getByRole('button', { name: '榜单' }).click()
  await expect(page.getByRole('heading', { name: 'Skills 榜单' })).toBeVisible()
  await expect(page.locator('.detail-shell')).toHaveCount(0)
})

test('opening another skill resets the detail panel scroll to the top', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }' })

  // open the pre-selected skill, then scroll its detail panel to the bottom
  await page.locator('.detail-restore button').click()
  const panel = page.locator('.detail-panel')
  await expect(panel).toBeVisible()
  await panel.evaluate((el) => { el.scrollTop = el.scrollHeight })
  await expect.poll(() => panel.evaluate((el) => el.scrollTop)).toBeGreaterThan(40)

  // open a different skill — its detail should start from the top, not inherit the scroll
  await page.locator('.discovery-card:not(.selected)').first().getByRole('button', { name: '详情' }).click()
  await expect.poll(() => panel.evaluate((el) => el.scrollTop)).toBe(0)
})

test('guest feedback dialog opens, validates and closes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)
  await page.getByRole('button', { name: '反馈' }).click()
  const dialog = page.getByRole('dialog', { name: '反馈' })
  await expect(dialog).toBeVisible()
  const submit = dialog.getByRole('button', { name: '提交反馈' })
  await expect(submit).toBeDisabled()
  await dialog.locator('.feedback-message').fill('这是一条测试反馈')
  await expect(submit).toBeEnabled()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
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

test('mobile: opening the menu closes an open detail instead of overlapping it', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-mobile', 'mobile product flow')
  await waitForCatalog(page)

  // open a skill detail (full-screen drawer on mobile)
  await page.getByRole('button', { name: '详情' }).first().click()
  await expect(page.locator('.detail-shell')).toBeVisible()

  // tapping the hamburger must dismiss the detail first, then show the sidebar — no overlap
  await page.getByRole('button', { name: '打开筛选菜单' }).click()
  await expect(page.getByRole('complementary', { name: '分类与导航' })).toBeVisible()
  await expect(page.locator('.detail-shell')).toHaveCount(0)
})
