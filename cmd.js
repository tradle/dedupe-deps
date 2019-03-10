#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const { dedupe } = require('./')
const debug = require('./debug')

const parseArgs = args => {
  args = minimist(args, {
    default: {
      dir: '.',
      'dry-run': false
    },
    boolean: ['dry-run']
  })

  const dryRun = args['dry-run']
  if (dryRun) {
    if (!debug.enabled) {
      throw new Error(`set DEBUG=${debug.namespace} to view dry run output`)
    }

    debug('this is a dry-run')
  }

  let { dir } = args
  dir = path.resolve(dir)
  if (!dir.endsWith(path.sep)) dir += path.sep
  if (!dir.endsWith('node_modules')) dir += 'node_modules'
  return { dir, dryRun }
}

const { dir, dryRun } = parseArgs(process.argv.slice(2))
if (!fs.lstatSync(dir).isDirectory()) {
  throw new Error(`expected --dir <dirToDedupe>`)
}

dedupe({ dir, dryRun }).catch(err => {
  process.exitCode = 1
  console.error(err.stack)
})
