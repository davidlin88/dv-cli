#! /usr/bin/env node

const { program } = require('commander')
const create = require('../lib/create.js')

program
  .version('0.1.0')
  .command('create <name>')
  .description('create a new project')
  .action(name => {
    create(name)
  })

program.parse()
