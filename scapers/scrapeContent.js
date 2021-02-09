import { Sema } from 'async-sema'
import { find, propEq } from 'ramda'

import { createContentfulGamePass } from '../clients/contentfulManagementClient.js'
import { fetchGamePassGames } from '../clients/gamePassClient.js'
import { getGameTimeToBeat } from '../clients/howLongToBeatClient.js'
import { getGameScore } from '../clients/metacriticClient.js'
import { GAME_IDS } from '../constants/gamesIds.js'
import { runWithTimer } from '../shared/scrapers.js'

const scrapeGamesContent = async () => {
  const games = await fetchGamePassGames()
  await Promise.all(games.map(fetchGameContent))
}

const s = new Sema(5, {
  capacity: 100,
})

const fetchGameContent = async (game) => {
  await s.acquire()

  try {
    const gameIds = find(propEq('gamePassId', game.gamePassId))(GAME_IDS)

    const [metaCriticScore, howLongToBeatInAverage] = await Promise.all([
      getGameScore(gameIds),
      getGameTimeToBeat(gameIds),
    ])

    await createContentfulGamePass({
      ...game,
      howLongToBeatInAverage,
      metaCriticScore,
    }).then((entry) => entry.publish())
  } finally {
    s.release()
  }
}

;(async () => {
  await runWithTimer(scrapeGamesContent)
})()
