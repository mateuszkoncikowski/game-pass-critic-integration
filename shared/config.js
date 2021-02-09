import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('../.env') })

export const CONTENTFUL_SPACE = process.env.CONTENTFUL_SPACE
export const CONTENTFUL_TOKEN = process.env.CONTENTFUL_TOKEN
