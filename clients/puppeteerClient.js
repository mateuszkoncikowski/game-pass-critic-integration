import puppeteer from 'puppeteer'

export const openPage = async (url) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  await page.goto(url, {
    waitUntil: 'load',
    timeout: 0,
  })

  return [page, browser]
}
