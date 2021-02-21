import { logger } from '../shared/logger.js'
import { openPage } from './puppeteerClient.js'

const METACRITIC_URL = 'https://www.metacritic.com'

export async function getGameScore(game) {
  const url = `${METACRITIC_URL}/game/pc/${game.metaCriticGameResult.href}`
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
    xbox: '80000',
  }
  const url = `${METACRITIC_URL}/search/game/${titleToSearch}/results?plats[${
    isPcOnly ? platform.pc : platform.xbox
  }]=1&search_type=advanced`
  const [page, browser] = await openPage(url)

  try {
    return await page.$eval('.product_title a', (el) => ({
      href: el.getAttribute('href').slice(9),
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
