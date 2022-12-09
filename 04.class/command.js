import Enquirer from 'enquirer'
import { exec, spawn } from 'child_process'
import { open, readFile, unlink } from 'fs/promises'

export default class Command {
  constructor (db) {
    this.db = db
  }

  add (stdin) {
    this.db.add(stdin)
    this.db.close()
  }

  async list () {
    const memos = await this.db.all().catch(err => console.error(err))
    this.db.close()
    if (memos.length === 0) {
      console.log("You don't have any notes in your storage.")
      return
    }
    console.log(memos.map(memo => memo.message).join('\n'))
  }

  async reference () {
    const memos = await this.db.all().catch(err => console.error(err))
    this.db.close()

    if (memos.length === 0) {
      console.log("You don't have any notes in your storage.")
      return
    }

    const prompt = new Enquirer.Select({
      name: 'memo',
      message: 'Choose a note you want to see:',
      choices: memos
    })

    const answer = await prompt.run().catch(error => {
      console.error(error)
    })
    console.log(answer)
  }

  async delete () {
    const memos = await this.db.all().catch(err => console.error(err))

    if (memos.length === 0) {
      console.log("You don't have any notes in your storage.")
      return
    }

    let id

    const prompt = new Enquirer.Select({
      name: 'memos',
      message: 'Choose a note you want to delete:',
      choices: memos,
      async onSubmit (_name, _value, self) {
        id = await self.selected.value
      }
    })

    const answer = await prompt.run().catch(error => {
      console.error(error)
    })

    this.db.delete(id)

    console.log(`${answer} is deleted.`)
    this.db.close()
  }

  async edit () {
    const memos = await this.db.all().catch(err => console.error(err))

    if (memos.length === 0) {
      console.log("You don't have any notes in your storage.")
      return
    }

    let id
    const prompt = new Enquirer.Select({
      name: 'memo',
      message: 'Choose a note you want to edit:',
      choices: memos,
      async onSubmit (_name, _value, self) {
        id = await self.selected.value
      }
    })

    const memo = await prompt.run().catch(error => {
      console.error(error)
    })

    let editor = 'vi'
    if (process.env.EDITOR) {
      editor = process.env.EDITOR
    } else {
      console.log('Since there is no EDITOR environment variable, using Vi by default.')
    }

    const openEditor = async (file) => {
      let filehandle
      try {
        filehandle = await open(file, 'r+')
        await filehandle.write(memo, 0)
      } finally {
        await filehandle?.close()
      }

      // vscodeは--waitオプションを付けないとファイルを開いた瞬間にcliが終了してしまう。
      const child = spawn(editor, [file, editor === 'code' ? '--wait' : ''], {
        stdio: 'inherit',
        detached: true
      })

      child.on('exit', async () => {
        console.log('editor ended')
        const content = await readFile(file, 'utf8')
        unlink(file)
        this.db.update(id, content)
        console.log(`Note is updated to: ${content}`)
        this.db.close()
      })
    }

    exec('mktemp', function (err, stdout, _stderr) {
      if (err) {
        console.log(`mktemp: ${err}`)
        return
      }
      openEditor(stdout.trim()).catch(error => {
        console.error(error)
      })
    })
  }
}
