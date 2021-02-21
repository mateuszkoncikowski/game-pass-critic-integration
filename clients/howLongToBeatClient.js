import { logger } from '../shared/logger.js'
import { openPage } from './puppeteerClient.js'

const HOW_LONG_URL = 'https://howlongtobeat.com'

export async function getGameTimeToBeat(game) {
  const url = `${HOW_LONG_URL}/game?id=${game.howLongToBeatResult.href}`
  const [page, browser] = await openPage(url)
  try {
    const gameTimes = await page.$$eval('.game_times li', (gameTimes) =>
      gameTimes.map((gt) =>
        gt.textContent.trim().replace(/\t/g, '').split('\n')
      )
    )

    return {
      gameTimes,
    }
  } catch (error) {
    logger.error('Issue with HowLongToBeat game fetching', {
      title: game.title,
      url,
      error,
    })
  } finally {
    await browser.close()
  }
}

export async function getHowLongToBeatSearchResult(titleToSearch, gameId) {
  const [page, browser] = await openPage(HOW_LONG_URL)
  try {
    await page.type('#global_search_box', titleToSearch)
    await page.waitForSelector('.search_list_details')
    return await page.$eval('.search_list_details a', (el) => ({
      href: el.getAttribute('href').slice(8),
      text: el.textContent.replace(/\s+/g, ' ').trim(),
    }))
  } catch (error) {
    logger.error('Looking for HowLongToBeat id crashed', {
      title: titleToSearch,
      gameId,
    })
  } finally {
    await browser.close()
  }
}
