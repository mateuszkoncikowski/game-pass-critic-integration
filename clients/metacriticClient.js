import puppeteer from 'puppeteer'

import { logger } from '../shared/logger.js'
import { openPage } from './puppeteerClient.js'

const METACRITIC_URL = 'https://www.metacritic.com'

export async function getGameScore(game) {
  const url = `${METACRITIC_URL}/game/pc/${game.metaCriticId}`
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.goto(url, {
    waitUntil: 'load',
    timeout: 0,
  })
  try {
    const element = await page.$('.main_details .metascore_w')
    return parseInt(await page.evaluate((el) => el.textContent, element))
  } catch (error) {
    logger.error('Issue with Metacritic game fetching', {
      service: 'howLongToBeatId service',
      title: game.title,
      url,
      error,
    })
  } finally {
    await browser.close()
  }
}

export async function getMetaCriticId(titleToSearch, gameId) {
  const url = `${METACRITIC_URL}/search/game/${titleToSearch}/results?plats[3]=1&search_type=advanced&sort=score`
  const [page, browser] = await openPage(url)

  try {
    const metacriticGameUrl = await page.$$eval('.product_title a', (el) =>
      el.map((x) => x.getAttribute('href'))
    )
    return metacriticGameUrl[0].slice(9)
  } catch (error) {
    logger.error('Looking for HowLongToBeat id crashed', {
      title: titleToSearch,
      gameId,
    })
  } finally {
    await browser.close()
  }
}
