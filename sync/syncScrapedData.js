import { find, map, prop, propEq } from 'ramda'

import { createContentfulGamePassGames } from '../clients/contentfulManagementClient.js'
import { fetchGamePassGames } from '../clients/gamePassClient.js'
import { SCRAPED_CONTENT } from '../data/scrapedContent.js'
import { runWithTimer } from '../shared/scrapers.js'

const syncScrapedData = async () => {
  const gamePassGames = await fetchGamePassGames()
  const gamePassIds = map(prop('gamePassId'))(gamePassGames)
  const matchedGames = map((gameId) =>
    find(propEq('gamePassId', gameId))(SCRAPED_CONTENT)
  )(gamePassIds)

  await createContentfulGamePassGames(matchedGames)
}

;(async () => {
  await runWithTimer(syncScrapedData)
})()
