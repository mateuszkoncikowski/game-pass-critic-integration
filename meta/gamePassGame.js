import { head, isNil, path, pipe, prop } from 'ramda'

const getLocalizedProps = pipe(prop('LocalizedProperties'), head)

export const getGameTitle = pipe(getLocalizedProps, prop('ProductTitle'))

export const isPcOnly = pipe(
  path(['Properties', 'XboxConsoleGenCompatible']),
  isNil
)
