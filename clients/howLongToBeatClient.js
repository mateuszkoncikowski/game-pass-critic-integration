import puppeteer from 'puppeteer'

import { logger } from '../shared/logger.js'

export async function getGameTimeToBeat(game) {
  let timeToBeat = 'N/A'
  const url = `https://howlongtobeat.com/game?id=${game.howLongToBeatId}`
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
      service: 'howLongToBeatId service',
      title: game.title,
      url,
      error,
    })
  }
  return timeToBeat
}

export async function getHowLongToBeatId(titleToSearch, gameId) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(15000)
  try {
    await page.goto('https://howlongtobeat.com/')
    await page.type('#global_search_box', titleToSearch)
    await page.waitForSelector('.search_list_details')
    const howLongToBeatUrl = await page.$$eval('.search_list_details a', (el) =>
      el.map((x) => x.getAttribute('href'))
    )
    return howLongToBeatUrl[0].slice(8)
  } catch (error) {
    logger.error('Looking for HowLongToBeat id crashed', {
      service: 'howLongToBeatId service',
      title: titleToSearch,
      gameId,
    })
  } finally {
    await browser.close()
  }
}
