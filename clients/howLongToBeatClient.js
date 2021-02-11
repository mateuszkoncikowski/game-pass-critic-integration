import puppeteer from 'puppeteer'

import { logger } from '../shared/logger.js'
import { openPage } from './puppeteerClient.js'

const HOW_LONG_URL = 'https://howlongtobeat.com'

export async function getGameTimeToBeat(game) {
  let timeToBeat = 'N/A'
  const url = `${HOW_LONG_URL}/game?id=${game.howLongToBeatId}`
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.goto(url, {
      waitUntil: 'load',
      timeout: 0,
    })
    const element = await page.$('.game_times li div')
    timeToBeat = await page.evaluate((el) => el.textContent, element)
    await browser.close()
  } catch (error) {
    logger.error('Issue with HowLongToBeat game fetching', {
      title: game.title,
      url,
      error,
    })
  }
  return timeToBeat
}

export async function getHowLongToBeatId(titleToSearch, gameId) {
  const [page, browser] = await openPage(HOW_LONG_URL)
  try {
    await page.type('#global_search_box', titleToSearch)
    await page.waitForSelector('.search_list_details')
    const howLongToBeatUrl = await page.$$eval('.search_list_details a', (el) =>
      el.map((x) => x.getAttribute('href'))
    )
    return howLongToBeatUrl[0].slice(8)
  } catch (error) {
    logger.error('Looking for HowLongToBeat id crashed', {
      title: titleToSearch,
      gameId,
    })
  } finally {
    await browser.close()
  }
}
