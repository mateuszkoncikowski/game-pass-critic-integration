import fetch from 'node-fetch'
import { join, map, pipe, prop, tail } from 'ramda'

import {
  getGamesContentUrl,
  getGamesListUrl,
} from '../constants/gamePassContants.js'

const addGamePassIdPropIntoGame = (game) => ({
  ...game,
  gamePassId: game['ProductId'],
})

export async function fetchGamePassGames() {
  const gamePassGamesIds = await fetch(getGamesListUrl())
    .then((res) => res.json())
    .then((data) => pipe(tail, map(prop('id')), join(','))(data))

  return await fetch(getGamesContentUrl(gamePassGamesIds))
    .then((res) => res.json())
    .then((data) => data['Products'])
    .then(map(addGamePassIdPropIntoGame))
}
