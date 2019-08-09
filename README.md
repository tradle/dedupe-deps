# dedupe-deps

UPDATE: the current implementation has issues with files that have dependencies (require()/import statements). Due to the structure of `node_modules/`, an identical file living in two locations can pull in different copies of dependencies.

see/follow a less opinionated one here: https://github.com/ExodusMovement/find-duplicates

## TL;DR

problem: multiple copies of the same version of a dependency in both your fs and your bundle

solution: replace all duplicates with `module.exports = require('../path/to/cananocal/file.js')`, right in the filesystem, so bundlers (webpack/browserify/metro) don't need to worry about it

## Problem

Because of the way package managers (npm/yarn) save deps in node_modules, you can end up with the same version of the same dependency occuring multiple times in your dependency tree. Bundlers like webpack, browserify and the React Native packager, then all have to solve that problem of preventing duplicates from being bundled. It's not that solutions don't exist, it's that they have to re-invented in every new ecosystem.

See for example this [webpack issue](https://github.com/webpack/webpack/issues/5593), opened in 2017...and still open.

## Solution

The solution is somewhat dirty. Avert your eyes. We're going to deduplicate directly in the filesystem. Let's say we have multiple copies of super-awesome in our tree:

```sh
# version 1.1.0
node_modules/a/node_modules/super-awesome/index.js
# also version 1.1.0
node_modules/b/node_modules/super-awesome/index.js
```

We're going to choose the first one as the canonical super-awesome@1.1.0 and replace js files in the duplicate with `module.exports = require('../path/to/cananocal/file.js')`

## Install

```sh
npm install --save-dev dedupe-deps
```

## Usage


```sh
# run in project root
# "DEBUG=dedupe-deps" is optional, if you want to see what files are being deduped
DEBUG=dedupe-deps dedupe-deps --dir .
```

To do a dry-run, add a `--dry-run` flag

Or put it in your package.json, e.g.:

```js
  "scripts": {
    "dedupe-deps": "dedupe-deps --dir .",
    "postinstall": "npm run dedupe-deps"
  }
```
