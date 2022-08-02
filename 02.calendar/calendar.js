import { setDate, lastDayOfMonth } from 'date-fns'
import minimist from 'minimist'

const isNumber = (value) => {
  return ((typeof value === 'number') && (isFinite(value)))
}

const calendar = (m, y) => {
  if (m !== undefined) {
    if (m < 1 || m > 12 || !isNumber(m)) {
      console.error(`cal: ${m} is not a month number (1..12)`)
      process.exit(-1)
    }
  }

  if (y !== undefined) {
    if (y < 1 || y > 9999 || !isNumber(y)) {
      console.error(`cal: year ${y} not in range 1..9999`)
      process.exit(-1)
    }
  }

  const today = new Date()
  const month = m ?? today.getMonth() + 1
  const year = y ?? today.getFullYear()
  const targetDate = new Date(year, month - 1)
  const isThisMonth = today.getMonth() === targetDate.getMonth() && today.getFullYear() === targetDate.getFullYear()
  const firstDay = setDate(targetDate, 1)
  const lastDay = lastDayOfMonth(targetDate)
  let weekday = firstDay.getDay()

  const format = (day) => {
    return today.getDate() === day && isThisMonth
      ? `\x1b[47m${day < 10 ? ' ' : ''}${day}\x1b[0m `
      : `${day < 10 ? ' ' : ''}${day} `
  }

  const printCal = () => {
    console.log(`      ${month}月 ${year}`)
    console.log('日 月 火 水 木 金 土')
    process.stdout.write(`${'   '.repeat(weekday)}`)
    for (let i = 1; i <= lastDay.getDate(); i++) {
      process.stdout.write(format(i))
      if (weekday === 6) {
        process.stdout.write('\n')
        weekday = 0
      } else {
        weekday++
      }
    }
    process.stdout.write('\n')
  }
  return {
    printCal
  }
}

const main = () => {
  const argv = minimist(process.argv.slice(2))
  const cal = calendar(argv.m, argv.y)
  cal.printCal()
}

main()
