import { head, pipe, prop } from 'ramda'

const getLocalizedProps = pipe(prop('LocalizedProperties'), head)

export const getGameTitle = pipe(getLocalizedProps, prop('ShortTitle'))
