import { Sema } from 'async-sema'
import { find, propEq } from 'ramda'

import { fetchGamePassGames } from '../clients/gamePassClient.js'
import { getGameTimeToBeat } from '../clients/howLongToBeatClient.js'
import { getGameScore } from '../clients/metacriticClient.js'
import { GAME_IDS } from '../data/scrapedIds.js'
import { getGameTitle } from '../meta/gamePassGame.js'
import { logger } from '../shared/logger.js'
import {
  removeResultsFile,
  runWithTimer,
  storeData,
} from '../shared/scrapers.js'

const RESULTS_FILE_PATH = '../logs/gameContentResults.log'

const scrapeGamesContent = async () => {
  const games = await fetchGamePassGames()
  removeResultsFile(RESULTS_FILE_PATH)
  await Promise.all(games.map(fetchGameContent))
}

const s = new Sema(1, {
  capacity: 100,
})

const fetchGameContent = async (game, index, games) => {
  await s.acquire()

  try {
    const gameIds = find(propEq('gamePassId', game.gamePassId))(GAME_IDS)

    const [metaCriticContent, howLongToBeatContent] = await Promise.all([
      getGameScore(gameIds),
      getGameTimeToBeat(gameIds),
    ])

    logger.info(
      `Scraped game content (${index + 1} / ${games.length}): ${getGameTitle(
        game
      )}`,
      {
        title: getGameTitle(game),
        gamePassId: game.gamePassId,
        metaCriticContent,
        howLongToBeatContent,
      }
    )

    const scrapedGame = {
      gameIds,
      gamePassId: game.gamePassId,
      metaCriticContent,
      howLongToBeatContent,
    }

    storeData(RESULTS_FILE_PATH, scrapedGame)
  } finally {
    s.release()
  }
}

;(async () => {
  await runWithTimer(scrapeGamesContent)
})()
