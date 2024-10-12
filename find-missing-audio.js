import { readdirSync } from 'node:fs'
import { WORDS } from './src/lib/words.js'

const wordList = [...WORDS.round1, ...WORDS.round2, ...WORDS.round3]

function extractWordFromFilename(filename) {
  const index = filename.indexOf('-')
  if (index !== -1) {
    return filename.slice(0, Math.max(0, index))
  }
  const extension = filename.slice(filename.lastIndexOf('.'))
  return filename.slice(0, Math.max(0, filename.lastIndexOf(extension)))
}

export function findMissingAudio(wordList) {
  const audioDirectory = 'static/audio/'
  const audioFiles = new Set(
    readdirSync(audioDirectory).map((filename) =>
      extractWordFromFilename(filename),
    ),
  )
  const missingFiles = wordList.filter((word) => !audioFiles.has(word))
  console.info('Words without audio files:', missingFiles)
  return missingFiles.sort()
}

const words = findMissingAudio(wordList)
console.info(words.length)
