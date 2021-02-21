import { Sema } from 'async-sema'
import { find, head, pipe, prop, propEq, replace, split } from 'ramda'

import { fetchGamePassGames } from '../clients/gamePassClient.js'
import { getHowLongToBeatSearchResult } from '../clients/howLongToBeatClient.js'
import { getMetaCriticSearchResult } from '../clients/metacriticClient.js'
import { isPcOnly } from '../meta/gamePassGame.js'
import { logger } from '../shared/logger.js'
import {
  removeResultsFile,
  runWithTimer,
  storeData,
} from '../shared/scrapers.js'

const RESULTS_FILE_PATH = '../logs/gameIdsResults.log'

const scrapeGamesIds = async () => {
  const games = await fetchGamePassGames()
  removeResultsFile(RESULTS_FILE_PATH)
  await Promise.all(games.map(fetchGameIds))
}

const s = new Sema(4, {
  capacity: 100,
})

const fetchGameIds = async (game, index, games) => {
  await s.acquire()

  try {
    const gamePassTitle = getTitleFromGamePass(game)
    const titleToSearch = getTitleToSearch(game)

    const [metaCriticGameResult, howLongToBeatResult] = await Promise.all([
      getMetaCriticSearchResult(titleToSearch, game.gamePassId, isPcOnly(game)),
      getHowLongToBeatSearchResult(titleToSearch, game.gamePassId),
    ])

    logger.info(
      `Scraped game (${index + 1} / ${games.length}): ${getTitleFromGamePass(
        game
      )}`,
      {
        titleToSearch,
        gamePassId: game.gamePassId,
        howLongToBeatResult,
        metaCriticGameResult,
      }
    )

    const scrapedGame = {
      title: titleToSearch,
      gamePassTitle,
      gamePassId: game.gamePassId,
      howLongToBeatResult,
      metaCriticGameResult,
    }

    storeData(RESULTS_FILE_PATH, scrapedGame)
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
  { gamePassId: '9PJGNFWR6MHL', title: 'MotoGP 20' },
  { gamePassId: '9NXP19FZ7DZ4', title: 'Katana Zero' },
  { gamePassId: 'BR26S2C6SKN1', title: 'Stealth Inc 2' },
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
  replace(/game of the year edition/i, ''),
  replace(/ea sports /i, ''),
  replace(/season update /i, ''),
  replace(/deluxe edition/i, '')
)

;(async () => {
  await runWithTimer(scrapeGamesIds)
})()
