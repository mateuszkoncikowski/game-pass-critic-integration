import { filter, includes, map, pipe } from 'ramda'

import {
  createContentfulGameDraft,
  fetchContentfulGameIds,
} from '../clients/contentfulManagementClient.js'
import { fetchGamePassGames } from '../clients/gamePassClient.js'
import { runWithTimer } from '../shared/scrapers.js'

const addMissingContentfulGamesAsDrafts = async () => {
  const gamePassGames = await fetchGamePassGames()
  const contentfulGamesIds = await fetchContentfulGameIds()

  pipe(
    filter((g) => !includes(g.gamePassId, contentfulGamesIds)),
    map(createContentfulGameDraft)
  )(gamePassGames)
}

;(async () => {
  await runWithTimer(addMissingContentfulGamesAsDrafts)
})()
