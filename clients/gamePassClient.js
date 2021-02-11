import fetch from 'node-fetch'
import { concat, map, pipe, prop, tail, uniq } from 'ramda'

import {
  GAME_PASS,
  getGamesContentUrl,
  getGamesListUrl,
} from '../constants/gamePassContants.js'

const addGamePassIdPropIntoGame = (game) => ({
  ...game,
  gamePassId: game['ProductId'],
})

const getGamesData = pipe(tail, map(prop('id')))

export async function fetchGamePassGames() {
  const gamePassPcGamesIds = await fetch(
    getGamesListUrl(GAME_PASS.allPcGamesId)
  )
    .then((res) => res.json())
    .then((data) => getGamesData(data))

  const gamePassConsoleGamesIds = await fetch(
    getGamesListUrl(GAME_PASS.allConsoleGamesId)
  )
    .then((res) => res.json())
    .then((data) => getGamesData(data))

  const uniqGameList = uniq(concat(gamePassPcGamesIds, gamePassConsoleGamesIds))

  return await fetch(getGamesContentUrl(uniqGameList))
    .then((res) => res.json())
    .then((data) => data['Products'])
    .then(map(addGamePassIdPropIntoGame))
}
