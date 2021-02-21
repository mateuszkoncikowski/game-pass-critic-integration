import Bottleneck from 'bottleneck'
import contentful from 'contentful-management'

import { CONTENTFUL_SPACE, CONTENTFUL_TOKEN } from '../shared/config.js'

const { createClient } = contentful

const contentfulClient = createClient({
  accessToken: CONTENTFUL_TOKEN,
})

const getEnvironment = () =>
  contentfulClient
    .getSpace(CONTENTFUL_SPACE)
    .then((space) => space.getEnvironment('master'))

export const createContentfulGamePass = (game) =>
  getEnvironment().then((environment) =>
    environment.createEntryWithId('gamePassGame', game.gamePassId, {
      fields: {
        title: {
          'en-US': game['LocalizedProperties'][0]['ProductTitle'],
        },
        metaCriticScore: {
          'en-US': game.metaCriticScore,
        },
        howLongToBeatInAverage: {
          'en-US': game.howLongToBeatInAverage,
        },
      },
    })
  )

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
