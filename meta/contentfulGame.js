import { path } from 'ramda'

export const simplifyContentfulGameEntry = (contentfulGame) => ({
  gamePassId: path(['sys', 'id'], contentfulGame),
  metaCriticScore: path(['fields', 'metaCriticScore', 'en-US'], contentfulGame),
  howLongToBeatInAverage: path(
    ['fields', 'howLongToBeatInAverage', 'en-US'],
    contentfulGame
  ),
})
