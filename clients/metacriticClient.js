import { logger } from '../shared/logger.js'
import { goto, openPage } from './puppeteerClient.js'

const METACRITIC_URL = 'https://www.metacritic.com'
const getMetacriticUrl = (titleToSearch, platform) =>
  `${METACRITIC_URL}/search/game/${titleToSearch}/results${
    platform ? `?plats[${platform}]=1&search_type=advanced}` : ''
  }`

export async function getGameScore(game) {
  const url = `${METACRITIC_URL}/${game.metaCriticGameResult.href}`
  let metaScore, userScore
  const [page, browser] = await openPage(url)

  try {
    userScore = await page.$eval(
      '.userscore_wrap .metascore_w',
      (el) => el.textContent
    )
    metaScore = await page.$eval(
      '.main_details .metascore_w',
      (el) => el.textContent
    )
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

  return {
    metaScore: metaScore ? metaScore : 'N/A',
    userScore: userScore ? userScore : 'N/A',
  }
}

export async function getMetaCriticSearchResult(
  titleToSearch,
  gameId,
  isPcOnly
) {
  const platform = {
    pc: '3',
    xbox360: '2',
    xbox: '80000',
  }
  const url = getMetacriticUrl(
    titleToSearch,
    isPcOnly ? platform.pc : platform.xbox
  )
  const [page, browser] = await openPage(url)

  try {
    const numberOfResults = await page.$$eval(
      '.search_results .result',
      (els) => els.length
    )

    if (numberOfResults === 0) {
      await goto(page, getMetacriticUrl(titleToSearch, platform.xbox360))
    }

    const fallbackNumberOfResults = await page.$$eval(
      '.search_results .result',
      (els) => els.length
    )

    if (fallbackNumberOfResults === 0) {
      await goto(page, getMetacriticUrl(titleToSearch))
    }

    return await page.$eval('.product_title a', (el) => ({
      href: el.getAttribute('href'),
      text: el.textContent.replace(/\s+/g, ' ').trim(),
    }))
  } catch (error) {
    logger.error('Issue with Metacritic game fetching', {
      title: titleToSearch,
      url,
      gameId,
      error,
    })
  } finally {
    await browser.close()
  }
}
