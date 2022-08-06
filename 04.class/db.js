import { firstLine } from './util.js'

export default class DB {
  constructor (db) {
    this.db = db
  }

  add (memo) {
    this.db.serialize(() => {
      this.db.run('CREATE TABLE IF NOT EXISTS memo(value TEXT)')
      const stmt = this.db.prepare('INSERT INTO memo VALUES (?)')
      stmt.run(memo)
      stmt.finalize()
    })
  }

  delete (id) {
    this.db.serialize(() => {
      this.db.run('CREATE TABLE IF NOT EXISTS memo(value TEXT)')
      const stmt = this.db.prepare('DELETE FROM memo where rowid = ?')
      stmt.run(id)
      stmt.finalize()
    })
  }

  update (id, value) {
    this.db.serialize(() => {
      this.db.run('CREATE TABLE IF NOT EXISTS memo(value TEXT)')
      this.db.run('UPDATE memo SET value = ? where rowid = ?', value, id)
    })
  }

  async all () {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('CREATE TABLE IF NOT EXISTS memo(value TEXT)')
        this.db.all('SELECT rowid AS id, value FROM memo', (err, rows) => {
          if (err) {
            reject(err)
          } else {
            const memos = rows.map((row) => {
              return {
                name: row.value,
                message: firstLine(row.value),
                value: row.id
              }
            })
            resolve(memos)
          }
        })
      })
    })
  }

  close () {
    this.db.close()
  }
}
