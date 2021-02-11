export const GAME_PASS = {
  endpoints: {
    catalog: 'https://catalog.gamepass.com/',
    displayCatalog: 'https://displaycatalog.mp.microsoft.com',
  },
  allPcGamesId: 'fdd9e2a7-0fee-49f6-ad69-4354098401ff',
  allConsoleGamesId: 'f6f1f99f-9b49-4ccd-b3bf-4d9767a77f5e',
  market: 'US',
  language: 'en-us',
  msCv: 'DGU1mcuYo0WMMp+F.1',
}

export const getGamesListUrl = (gameListId) => {
  const {
    endpoints: { catalog },
    language,
    market,
  } = GAME_PASS

  return `${catalog}/sigls/v2?id=${gameListId}&language=${language}&market=${market}`
}

export const getGamesContentUrl = (gamePassGamesIds) => {
  const {
    endpoints: { displayCatalog },
    market,
    language,
    msCv,
  } = GAME_PASS

  return `${displayCatalog}/v7.0/products?bigIds=${gamePassGamesIds}&market=${market}&languages=${language}&MS-CV=${msCv}`
}
