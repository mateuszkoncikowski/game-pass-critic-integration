import { Sema } from 'async-sema'
import { writeFileSync } from 'fs'
import Timer from 'timer-node'

import { logger } from './logger.js'

export const runWithTimer = async (fn) => {
  const timer = new Timer('scraper')
  timer.start()

  await fn()

  timer.stop()
  logger.info(`${timer.format()}`)
}

export const storeData = (data, path) => {
  try {
    writeFileSync(path, JSON.stringify(data))
  } catch (err) {
    logger.error(err)
  }
}

const s = new Sema(5, {
  capacity: 100,
})

export const runWithConcurrency = async (fn) => {
  await s.acquire()

  try {
    await fn()
  } finally {
    s.release()
  }
}
