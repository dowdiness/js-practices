import readline from 'readline'

export const getStdin = async () => {
  if (process.stdin.isTTY) {
    return false
  }

  process.stdin.setEncoding('utf8')

  const lines = []
  const reader = readline.createInterface({
    input: process.stdin
  })

  return new Promise((resolve) => {
    reader.on('line', (line) => {
      lines.push(line)
    })
    reader.on('close', () => {
      resolve(lines.join('\n'))
    })
  })
}

export const firstLine = (str) => {
  if (str.indexOf('\n') === -1) {
    return str
  } else {
    return str.substring(0, str.indexOf('\n'))
  }
}
