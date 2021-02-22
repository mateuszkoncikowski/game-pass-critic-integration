import puppeteer from 'puppeteer'

export const openPage = async (url) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  await goto(page, url)

  return [page, browser]
}

export const goto = async (page, url) => {
  await page.goto(url, {
    waitUntil: 'load',
  })
}

export const closePage = async (browser) => {
  const pages = await browser.pages()
  await Promise.all(pages.map((page) => page.close()))
  await browser.close()
}
