import path from 'path'
import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  levels: winston.config.npm.levels,
  format: winston.format.simple(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({
      filename: path.resolve('../logs/error.log'),
      level: 'error',
      options: { flags: 'w' },
    }),
    new winston.transports.File({
      filename: path.resolve('../logs/combined.log'),
      options: { flags: 'w' },
    }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
}
