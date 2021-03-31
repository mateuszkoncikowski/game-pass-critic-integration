import Bottleneck from 'bottleneck'
import contentful from 'contentful-management'
import { map, path, pipe, prop } from 'ramda'

import { getGameTitle } from '../meta/gamePassGame.js'
import { CONTENTFUL_SPACE, CONTENTFUL_TOKEN } from '../shared/config.js'

const { createClient } = contentful

const contentfulClient = createClient({
  accessToken: CONTENTFUL_TOKEN,
})

const getEnvironment = async () => {
  const space = await contentfulClient.getSpace(CONTENTFUL_SPACE)
  return space.getEnvironment('master')
}

export const createContentfulGameDraft = (game) => {
  getEnvironment().then((environment) => {
    environment
      .createEntryWithId('gamePassGame', game.gamePassId, {
        fields: {
          title: {
            'en-US': getGameTitle(game),
          },
        },
      })
      .catch((error) => {
        console.log(error, game)
      })
  })
}

export const createContentfulGamePassGame = (game) =>
  getEnvironment().then((environment) =>
    environment
      .createEntryWithId('gamePassGame', game.gamePassId, {
        fields: {
          title: {
            'en-US': path(['gameIds', 'gamePassTitle'])(game),
          },
          metaCriticScore: {
            'en-US': pipe(
              path(['metaCriticContent', 'metaScore']),
              parseInt
            )(game),
          },
          metaCriticUserScore: {
            'en-US': pipe(
              path(['metaCriticContent', 'userScore']),
              parseFloat
            )(game),
          },
          metaCriticHref: {
            'en-US': path(['gameIds', 'metaCriticGameResult', 'href'])(game),
          },
          howLongToBeatCategories: {
            'en-US': pipe(
              path(['howLongToBeatContent', 'gameTimes']),
              map((game) => game[0])
            )(game),
          },
          howLongToBeatHours: {
            'en-US': pipe(
              path(['howLongToBeatContent', 'gameTimes']),
              map((game) => game[1])
            )(game),
          },
          howLongToBeatGameId: {
            'en-US': pipe(
              path(['gameIds', 'howLongToBeatResult', 'href']),
              parseInt
            )(game),
          },
        },
      })
      .catch((error) => {
        console.log(error, game)
      })
  )

export const createContentfulGamePassGames = async (games) => {
  const limiter = new Bottleneck({
    reservoir: 10,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 1,
    minTime: 333,
  })

  return await limiter.schedule(() => {
    const allTasks = games.map(
      async (game) => await createContentfulGamePassGame(game)
    )

    return Promise.all(allTasks)
  })
}

export const removeAllContentfulGames = () => {
  const limiter = new Bottleneck({
    minTime: 1000,
  })

  getEnvironment().then((environment) =>
    environment.getEntries({ content_type: 'gamePassGame' }).then((response) =>
      limiter.schedule(() => {
        const allTasks = response.items.map((entry) => {
          if (entry.sys.publishedCounter === 0) {
            entry.delete()
          } else {
            entry.unpublish().then(() => entry.delete())
          }
        })

        return Promise.all(allTasks)
      })
    )
  )
}

export const fetchContentfulGameIds = async () => {
  const environment = await getEnvironment()
  return environment
    .getEntries({ content_type: 'gamePassGame', limit: 1000 })
    .then((res) => pipe(prop('items'), map(path(['sys', 'id'])))(res))
}
