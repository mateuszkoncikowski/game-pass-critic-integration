import { Sema } from 'async-sema'
import { find, head, pipe, prop, propEq, replace, split } from 'ramda'

import { fetchGamePassGames } from '../clients/gamePassClient.js'
import { getHowLongToBeatId } from '../clients/howLongToBeatClient.js'
import { getMetaCriticId } from '../clients/metacriticClient.js'
import { logger } from '../shared/logger.js'
import {
  removeResultsFile,
  runWithTimer,
  storeData,
} from '../shared/scrapers.js'

const scrapeGamesIds = async () => {
  const games = await fetchGamePassGames(5)
  removeResultsFile()
  await Promise.all(games.slice(0, 10).map(fetchGameIds))
}

const s = new Sema(5, {
  capacity: 100,
})

const fetchGameIds = async (game) => {
  await s.acquire()

  try {
    const gamePassTitle = getTitleFromGamePass(game)
    const titleToSearch = getTitleToSearch(game)
    const [metaCriticId, howLongToBeatId] = await Promise.all([
      getMetaCriticId(titleToSearch, game.gamePassId),
      getHowLongToBeatId(titleToSearch, game.gamePassId),
    ])

    logger.info(`Scraped game: ${getTitleFromGamePass(game)}`, {
      titleToSearch,
      howLongToBeatId,
      metaCriticId,
    })

    const scrapedGame = {
      title: titleToSearch,
      gamePassTitle,
      gamePassId: game.gamePassId,
      howLongToBeatId,
      metaCriticId,
    }

    storeData(scrapedGame)
  } finally {
    s.release()
  }
}

const STATIC_TITLES = [
  { gamePassId: '9MT8ND8BS6NB', title: 'ARK: Survival Evolved' },
  { gamePassId: '9MWB2BFF0SPD', title: 'Bloodstained: Ritual of the Night' },
  { gamePassId: '9PFJDSL1CC7G', title: 'Disgaea 4 Complete' },
  { gamePassId: '9P5LZC1KB48V', title: 'Pillars of Eternity' },
  { gamePassId: '9PN3VDFTB5HZ', title: "The Bard's Tale" },
  { gamePassId: '9PF6BS5DGNLX', title: 'Deliver Us The Moon' },
  { gamePassId: '9N88HSBP6RJ8', title: 'MotoGP 20' },
  { gamePassId: '', title: '' },
]

const getStaticTitle = (game) =>
  pipe(find(propEq('gamePassId', game.gamePassId)), prop('title'))

const getTitleToSearch = (game) => {
  const staticTitle = getStaticTitle(game)(STATIC_TITLES)
  return staticTitle ? staticTitle : getTitleFromGamePassAndClean(game)
}

const getTitleFromGamePass = pipe(
  prop('LocalizedProperties'),
  head,
  prop('ProductTitle')
)

const getTitleFromGamePassAndClean = pipe(
  prop('LocalizedProperties'),
  head,
  prop('ProductTitle'),
  replace(/ *\([^)]*\) */g, ''),
  split(':'),
  head,
  replace(/ - game preview/i, ''),
  replace(/ - microsoft store edition/i, ''),
  replace(/microsoft store edition/i, ''),
  replace(/ - standard edition/i, ''),
  replace(/standard edition/i, ''),
  replace(/for windows 10/i, ''),
  replace(/ - windows 10 edition/i, ''),
  replace(/ - windows edition/i, ''),
  replace(/windows 10 edition/i, ''),
  replace(/windows edition/i, ''),
  replace(/ - for windows 10/i, ''),
  replace(/ - windows 10/i, ''),
  replace(/windows 10/i, ''),
  replace(/windows/i, ''),
  replace('- PC', ''),
  replace(/ PC/, ''),
  replace(/®/g, ''),
  replace(/™/g, ''),
  replace(/for windows 10/i, ''),
  replace(/bundle/i, ''),
  replace(/win10/i, ''),
  replace(/game of the year edition/i, '')
)

;(async () => {
  await runWithTimer(scrapeGamesIds)
})()
