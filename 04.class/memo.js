#!/usr/bin/env node

import minimist from 'minimist'
import sqlite3 from 'sqlite3'
import { exit } from 'process'
import { getStdin } from './util.js'
import DB from './db.js'
import Command from './command.js'

const main = async () => {
  const db = new DB(new sqlite3.Database('memos.sqlite'))
  const stdin = await getStdin()
  const argv = minimist(process.argv.slice(2))
  const command = new Command(db)

  if (stdin) {
    command.add(stdin)
  }

  if ([argv.l, argv.r, argv.d, argv.e].filter(option => option === true).length >= 2) {
    console.log('You cannot define more than one option.')
    exit(1)
  }

  if (argv.l) {
    command.list()
  }

  if (argv.r) {
    command.reference()
  }

  if (argv.d) {
    command.delete()
  }

  if (argv.e) {
    command.edit()
  }
}

main()
