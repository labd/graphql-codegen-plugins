import fs from 'fs'
import path from 'path'

export const readFileSync = (filePath: string) =>
  fs.readFileSync(path.resolve(__dirname, filePath), 'utf8')

export const writeFileSync = (filePath: string, content: string) =>
  fs.writeFileSync(path.resolve(__dirname, filePath), content)
