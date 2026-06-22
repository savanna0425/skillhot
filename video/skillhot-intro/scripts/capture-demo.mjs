import { chromium } from '@playwright/test'
import { mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const assets = path.join(root, 'assets')
const recordings = path.join(root, '.recordings')
await mkdir(assets, { recursive: true })
await rm(recordings, { recursive: true, force: true })
await mkdir(recordings, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: recordings, size: { width: 1600, height: 900 } },
})
const page = await context.newPage()
const pause = (ms) => page.waitForTimeout(ms)

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '全部 Skills 1502' }).waitFor()
await pause(700)
await page.screenshot({ path: path.join(assets, 'site-home.png') })

const search = page.getByPlaceholder('搜索 Skills、仓库、场景或平台')
await search.click()
await search.type('firecrawl', { delay: 110 })
await page.getByRole('heading', { name: '搜索结果' }).waitFor()
await pause(1200)
await page.screenshot({ path: path.join(assets, 'site-search-firecrawl.png') })

const exampleCard = page.locator('.search-results-section article').filter({ hasText: 'firecrawl/firecrawl' })
await exampleCard.getByRole('button', { name: '详情' }).click()
await page.getByRole('complementary', { name: 'firecrawl/firecrawl 详情' }).waitFor()
await pause(1800)
await page.screenshot({ path: path.join(assets, 'site-detail-firecrawl.png') })

await page.getByRole('button', { name: '收起右侧详情栏' }).click()
await pause(500)
await search.fill('')
await pause(350)

await page.getByRole('navigation', { name: '主要页面' }).getByRole('button', { name: '分类' }).click()
await page.getByRole('heading', { name: '技能分类' }).waitFor()
await pause(1200)
await page.screenshot({ path: path.join(assets, 'site-categories.png') })
await page.getByRole('button').filter({ hasText: /^自动化\b/ }).first().click()
await pause(1000)

await page.getByRole('navigation', { name: '主要页面' }).getByRole('button', { name: '榜单' }).click()
await page.getByRole('heading', { name: 'Skills 榜单' }).waitFor()
await page.getByLabel('榜单排序').selectOption('stars')
await pause(1400)
await page.screenshot({ path: path.join(assets, 'site-ranking.png') })

await page.getByRole('navigation', { name: '主要页面' }).getByRole('button', { name: '话题' }).click()
await pause(1100)
await page.screenshot({ path: path.join(assets, 'site-topics.png') })

const video = page.video()
await page.close()
await context.close()
await browser.close()
if (!video) throw new Error('Chrome demo recording was not created')
const source = await video.path()
await rename(source, path.join(assets, 'site-demo.webm'))
console.log(`Captured SkillHot demo with Chrome: ${path.join(assets, 'site-demo.webm')}`)
