import { appendFile, existsSync, unlinkSync } from 'fs'
import Timer from 'timer-node'

import { logger } from './logger.js'

export const runWithTimer = async (fn) => {
  const timer = new Timer('scraper')
  timer.start()

  await fn()

  timer.stop()
  logger.info(`${timer.format()}`)
}

const path = '../logs/result.log'

export const removeResultsFile = () => {
  if (existsSync(path)) {
    unlinkSync(path)
  }
}

export const storeData = (data) => {
  try {
    appendFile(path, `${JSON.stringify(data)},\n`, (error) => {
      if (error) throw error
    })
  } catch (err) {
    logger.error(err)
  }
}
