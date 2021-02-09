import puppeteer from 'puppeteer'

export async function getGameScore(game) {
  let score = 0
  const url = `https://www.metacritic.com/game/pc/${game.metaCriticId}`
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.goto(url, {
      waitUntil: 'load',
      timeout: 0,
    })
    const element = await page.$('.main_details .metascore_w')
    score = parseInt(await page.evaluate((el) => el.textContent, element))
    await browser.close()
  } catch (error) {
    logger.error('Issue with Metacritic game fetching', {
      service: 'howLongToBeatId service',
      title: game.title,
      url,
      error,
    })
  }
  return score
}

export async function getMetaCriticId(titleToSearch, gameId) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(15000)
  const url = `https://www.metacritic.com/search/game/${titleToSearch}/results?plats[3]=1&search_type=advanced&sort=score`
  let metaCriticId
  try {
    await page.goto(url)
    const metacriticGameUrl = await page.$$eval('.product_title a', (el) =>
      el.map((x) => x.getAttribute('href'))
    )
    metaCriticId = metacriticGameUrl[0].slice(9)
  } catch (error) {
    logger.error('Looking for HowLongToBeat id crashed', {
      service: 'MetacriticId service',
      title: titleToSearch,
      gameId,
    })
  }
  await browser.close()
  return metaCriticId
}
