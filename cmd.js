#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const { dedupe } = require('./')

const args = minimist(process.argv.slice(2), {
  default: {
    dir: '.'
  }
})

let dir = path.resolve(args.dir)
if (!dir.endsWith(path.sep)) dir += path.sep
if (!dir.endsWith('node_modules')) dir += 'node_modules'

if (!fs.lstatSync(dir).isDirectory()) {
  throw new Error(`expected --dir <dirToDedupe>`)
}

dedupe({ dir }).catch(err => {
  process.exitCode = 1
  console.error(err.stack)
})
